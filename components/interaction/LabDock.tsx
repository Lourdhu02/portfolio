"use client"
import { Command } from 'cmdk'
import { useEffect, useRef, useState } from 'react'
import { COMMANDS } from '@/lib/commands'
import { openPalette } from '@/lib/interaction'
import { useModKey } from '@/lib/useMediaQuery'
import { CommandMenu, Kbd, useRunCommand } from './CommandMenu'

const DOCKED = COMMANDS.filter((c) => c.group === 'Lab' || c.group === 'Work' || c.id === 'copy-email')

// The home page's lab console: a docked window running the same command menu as ⌘K,
// with the shortcuts spelled out beside it.
export function LabDock() {
  const run = useRunCommand()
  const mod = useModKey()
  const slot = useRef<HTMLDivElement>(null)
  const [armed, setArmed] = useState(false)

  // cmdk scrolls its selected item into view on mount, which would yank the whole page
  // down on load. Mount the console once it is fully on screen, where that scroll is a no-op.
  useEffect(() => {
    const el = slot.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setArmed(true)
        io.disconnect()
      }
    }, { threshold: 0.9 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div className="grid grid-cols-1 items-center gap-8 sm:gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
      <div className="space-y-6">
        <p className="font-display text-4xl leading-[1.02] md:text-6xl">
          Every system here is one keystroke away.
        </p>
        <p className="max-w-md text-sm leading-relaxed text-muted md:text-base">
          The console on the right is the same command menu that runs on every page. Search the work, open the lab, or copy my email without touching the mouse.
        </p>
        <dl className="hidden sm:grid max-w-sm grid-cols-[auto_1fr] items-center gap-x-6 gap-y-3 font-mono text-xs uppercase tracking-widest text-muted">
          <dt className="flex gap-1"><Kbd>{mod}</Kbd><Kbd>K</Kbd></dt>
          <dd>Open anywhere</dd>
          <dt className="flex gap-1"><Kbd>g</Kbd><Kbd>w</Kbd></dt>
          <dd>Jump to work</dd>
          <dt className="flex gap-1"><Kbd>g</Kbd><Kbd>l</Kbd></dt>
          <dd>Jump to the lab</dd>
          <dt className="flex gap-1"><Kbd>/</Kbd></dt>
          <dd>Search</dd>
        </dl>
      </div>

      <div className="relative">
        <div aria-hidden="true" className="absolute -inset-px rounded-[10px] rounded-br-[var(--radius-cut)] bg-[linear-gradient(140deg,var(--color-accent)_0%,transparent_35%,transparent_70%,var(--color-detect)_100%)] opacity-40" />
        <div className="relative overflow-hidden rounded-[10px] rounded-br-[var(--radius-cut)] bg-surface shadow-[0_30px_100px_-30px_rgba(0,0,0,0.9)]">
          <div className="flex items-center justify-between border-b border-line bg-raised/60 px-4 py-2.5">
            <div className="flex items-center gap-2" aria-hidden="true">
              <span className="h-2.5 w-2.5 rounded-full bg-accent/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-line" />
              <span className="h-2.5 w-2.5 rounded-full bg-line" />
            </div>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">lab://console</span>
            <button
              type="button"
              onClick={openPalette}
              className="flex items-center gap-1 rounded-[4px] font-mono text-[10px] uppercase tracking-widest text-muted transition-colors hover:text-text"
              aria-label="Open the full command menu"
            >
              <Kbd>{mod}</Kbd><Kbd>K</Kbd>
            </button>
          </div>
          <div ref={slot} className="min-h-[377px]">
            {armed && (
              <Command label="Lab console" loop>
                <CommandMenu
                  commands={DOCKED}
                  onRun={run}
                  placeholder="Search experiments and work…"
                  listClassName="h-[320px]"
                />
              </Command>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
