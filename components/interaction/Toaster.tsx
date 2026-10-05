"use client"
import { AnimatePresence, m } from 'motion/react'
import { useEffect, useState } from 'react'
import { TOAST_EVENT } from '@/lib/interaction'
import { spring } from '@/lib/tokens'

// One toast at a time; a new one replaces the old. The live region is always mounted
// so screen readers announce each message.
export function Toaster() {
  const [toast, setToast] = useState<{ id: number; message: string } | null>(null)

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined
    function onToast(e: Event) {
      const message = (e as CustomEvent<string>).detail
      setToast({ id: Date.now(), message })
      clearTimeout(timer)
      timer = setTimeout(() => setToast(null), 2400)
    }
    window.addEventListener(TOAST_EVENT, onToast)
    return () => {
      clearTimeout(timer)
      window.removeEventListener(TOAST_EVENT, onToast)
    }
  }, [])

  return (
    <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-8 z-[95] flex justify-center px-4">
      <AnimatePresence mode="popLayout">
        {toast && (
          <m.div
            key={toast.id}
            initial={{ y: 24, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -12, opacity: 0 }}
            transition={{ type: 'spring', ...spring.ui }}
            className="flex items-center gap-3 rounded-full border border-line bg-raised/95 px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-text shadow-2xl backdrop-blur"
          >
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-success" />
            {toast.message}
          </m.div>
        )}
      </AnimatePresence>
    </div>
  )
}
