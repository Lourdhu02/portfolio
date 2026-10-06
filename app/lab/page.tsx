import type { Metadata } from 'next'
import Link from 'next/link'
import { MeterLab } from '@/components/lab/MeterLab'
import card from '@/lib/lab/model-card.json'

export const metadata: Metadata = {
  title: 'Lab · Read the meter yourself · Lourdu Raju',
  description: 'A tiny CTC meter reader I trained, running in your browser. Stress it, watch it decode, and measure it on your own device.',
}

const REPO = 'https://github.com/Lourdhu02/portfolio/tree/main'
const pct = (x: number) => `${(x * 100).toFixed(1)}%`

export default function LabPage() {
  const date = new Date(card.trainedOn + 'T00:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })

  return (
    <main className="relative w-full px-5 sm:px-10 lg:px-16 pt-24 pb-16 sm:py-32 text-text">
      <Link href="/" className="inline-block font-mono text-xs uppercase tracking-widest text-muted hover:text-accent transition-colors -mt-2 py-2 mb-8 sm:mb-14">
        ← Back to Home
      </Link>

      <header className="mb-10 sm:mb-14 grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
        <div className="lg:col-span-8">
          <div className="flex items-center gap-3 font-mono text-xs text-detect uppercase tracking-widest mb-4">
            <span className="w-2 h-2 rounded-full bg-detect animate-pulse" />
            <span>Lab 01 · Live model</span>
          </div>
          <h1 className="font-display text-[clamp(3.25rem,16vw,3.75rem)] sm:text-7xl md:text-8xl leading-[0.85] uppercase">
            Read the meter
            <br />
            <span className="text-muted">yourself.</span>
          </h1>
        </div>
        <p className="lg:col-span-4 text-text/80 leading-relaxed">
          A {Math.round(card.params / 1000)}k-parameter CTC reader I trained on synthetic meters, running on your device right now. Throw blur, glare and grime at it, watch every frame vote, and time it yourself. Every number on this page is measured, and most of them by your browser.
        </p>
      </header>

      <MeterLab />

      {/* Model card */}
      <section className="mt-24 grid grid-cols-1 lg:grid-cols-12 gap-10 border-t border-line pt-12">
        <div className="lg:col-span-4">
          <div className="font-mono text-xs text-muted uppercase tracking-widest mb-3">Model card</div>
          <h2 className="font-display text-4xl uppercase leading-[0.9]">How this was built and measured</h2>
        </div>
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8 text-sm text-text/80 leading-relaxed">
          <dl className="font-mono text-xs grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 self-start">
            <dt className="text-muted">Architecture</dt><dd>8 conv layers → {card.frames} frames × 12 classes, CTC</dd>
            <dt className="text-muted">Parameters</dt><dd>{card.params.toLocaleString('en-US')}</dd>
            <dt className="text-muted">Weights</dt><dd>{(card.bytes / 1024).toFixed(0)} KB, int8 per-channel, BN folded</dd>
            <dt className="text-muted">Training set</dt><dd>{card.trainSamples.toLocaleString('en-US')} rendered meters, {card.epochs} epochs, CPU</dd>
            <dt className="text-muted">Held-out exact match</dt><dd>{pct(card.valExact.int8)} int8 · {pct(card.valExact.fp32)} fp32</dd>
            <dt className="text-muted">Held-out CER</dt><dd>{pct(card.valCer.int8)} int8</dd>
            <dt className="text-muted">Validation set</dt><dd>{card.valSamples.toLocaleString('en-US')} meters, unseen seeds</dd>
            <dt className="text-muted">Trained</dt><dd>{date}</dd>
          </dl>
          <div className="space-y-4">
            <p>
              The meters are drawn by the same renderer you are playing with: training data came from running it in headless Chromium, so the page and the model see one distribution. The stress curves use {card.sweepSamplesPerPoint} fresh meters per level, one stress at a time.
            </p>
            <p>
              <span className="text-text">What it can&apos;t do.</span> It has only ever seen synthetic seven-segment displays, so a photo of a real meter is out of distribution. It is the recognition stage alone: no detector, no rectifier, no quality gate. My production system is a different, larger and private pipeline; nothing here comes from it.
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-xs uppercase tracking-wider">
              <a href={`${REPO}/scripts/lab`} target="_blank" rel="noreferrer" className="text-accent hover:underline">Training code →</a>
              <a href={`${REPO}/lib/lab`} target="_blank" rel="noreferrer" className="text-accent hover:underline">Renderer and inference →</a>
              <Link href="/work/meter-ocr" className="text-muted hover:text-text">The production system →</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
