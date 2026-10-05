"use client"
import { useCallback, useEffect, useRef, useState } from 'react'
import type { MeterSpec, StressKey } from '@/lib/lab/meter'
import type { ReadResult, WorkerIn, WorkerOut } from '@/lib/lab/worker'

export interface SweepPoint {
  level: number
  exact: number
  n: number
  msP50: number
}

// Owns the worker. Reads are latest-wins: while one is in flight, newer specs
// replace the queued one, so dragging a slider never builds a backlog.
export function useMeterWorker() {
  const worker = useRef<Worker | null>(null)
  const inFlight = useRef(false)
  const queued = useRef<MeterSpec | null>(null)
  const nextId = useRef(1)
  const sweepRef = useRef(0)
  const loaded = useRef(false)

  const [ready, setReady] = useState<{ bytes: number; ms: number } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ReadResult | null>(null)
  const [timings, setTimings] = useState<number[]>([])
  const [sweep, setSweep] = useState<{ key: StressKey; points: SweepPoint[]; running: boolean } | null>(null)

  const send = useCallback((m: WorkerIn) => worker.current?.postMessage(m), [])

  const pump = useCallback(() => {
    if (!loaded.current || inFlight.current || !queued.current) return
    inFlight.current = true
    send({ type: 'read', id: nextId.current++, spec: queued.current })
    queued.current = null
  }, [send])

  useEffect(() => {
    const w = new Worker(new URL('../../lib/lab/worker.ts', import.meta.url), { type: 'module' })
    worker.current = w
    loaded.current = false
    inFlight.current = false
    w.onmessage = (e: MessageEvent<WorkerOut>) => {
      const m = e.data
      if (m.type === 'ready') {
        loaded.current = true
        setReady({ bytes: m.bytes, ms: m.ms })
        pump()
      } else if (m.type === 'error') {
        setError(m.message)
      } else if (m.type === 'read') {
        inFlight.current = false
        setResult(m)
        setTimings((t) => (t.length >= 500 ? [...t.slice(1), m.ms] : [...t, m.ms]))
        pump()
      } else if (m.type === 'sweep-point') {
        if (m.id !== sweepRef.current) return
        setTimings((t) => [...t.slice(-499), m.msP50])
        setSweep((s) => (s ? { ...s, points: [...s.points, m] } : s))
      } else if (m.type === 'sweep-done') {
        if (m.id === sweepRef.current) setSweep((s) => (s ? { ...s, running: false } : s))
      }
    }
    w.onerror = (e) => setError(e.message || 'Worker failed to start')
    w.postMessage({ type: 'load', url: '/lab/meter-ctc.bin' } satisfies WorkerIn)
    return () => w.terminate()
  }, [pump])

  const read = useCallback(
    (spec: MeterSpec) => {
      queued.current = spec
      pump()
    },
    [pump],
  )

  const runSweep = useCallback(
    (key: StressKey, perLevel = 24) => {
      const id = nextId.current++
      sweepRef.current = id
      setSweep({ key, points: [], running: true })
      send({ type: 'sweep', id, key, perLevel, seed: (Math.random() * 2 ** 31) | 0 })
    },
    [send],
  )

  const cancelSweep = useCallback(() => {
    sweepRef.current = 0
    send({ type: 'cancel' })
    setSweep((s) => (s ? { ...s, running: false } : s))
  }, [send])

  return { ready, error, result, timings, read, sweep, runSweep, cancelSweep }
}

export function percentile(xs: number[], p: number) {
  if (!xs.length) return 0
  const s = [...xs].sort((a, b) => a - b)
  return s[Math.min(s.length - 1, Math.floor(p * s.length))]
}
