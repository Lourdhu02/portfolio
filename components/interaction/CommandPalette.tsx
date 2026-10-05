"use client"
import { Command } from 'cmdk'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { COMMANDS, GO_SHORTCUTS, postCommands, type PostSummary } from '@/lib/commands'
import { OPEN_PALETTE_EVENT, isTypingTarget, toast } from '@/lib/interaction'
import { useModKey } from '@/lib/useMediaQuery'
import { CommandMenu, Kbd, useRunCommand } from './CommandMenu'

// Global ⌘K / Ctrl+K menu, plus "/" to open and "g <letter>" to jump between pages.
export function CommandPalette({ posts }: { posts: PostSummary[] }) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const run = useRunCommand()
  const mod = useModKey()
  const commands = useMemo(() => [...COMMANDS, ...postCommands(posts)], [posts])

  useEffect(() => {
    let goPending = false
    let goTimer: ReturnType<typeof setTimeout> | undefined

    function onKeyDown(e: KeyboardEvent) {
      if (e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((o) => !o)
        return
      }
      if (e.metaKey || e.ctrlKey || e.altKey || isTypingTarget(e.target)) return
      if (document.querySelector('[role="dialog"]:not([data-state="closed"])')) return

      if (goPending) {
        goPending = false
        clearTimeout(goTimer)
        const dest = GO_SHORTCUTS[e.key.toLowerCase()]
        if (dest) {
          e.preventDefault()
          toast(`→ ${dest.label}`)
          router.push(dest.href)
        }
        return
      }
      if (e.key === '/') {
        e.preventDefault()
        setOpen(true)
      } else if (e.key === 'g') {
        goPending = true
        goTimer = setTimeout(() => { goPending = false }, 1200)
      }
    }
    const onOpen = () => setOpen(true)

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener(OPEN_PALETTE_EVENT, onOpen)
    return () => {
      clearTimeout(goTimer)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener(OPEN_PALETTE_EVENT, onOpen)
    }
  }, [router])

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Command menu"
      loop
      overlayClassName="cmdk-overlay fixed inset-0 z-[90] bg-bg/70 backdrop-blur-sm"
      contentClassName="cmdk-content fixed left-1/2 top-[14vh] z-[91] w-[min(640px,calc(100vw-2rem))] -translate-x-1/2 overflow-hidden border border-line bg-surface/95 shadow-[0_40px_120px_-20px_rgba(0,0,0,0.9)] backdrop-blur-xl rounded-[10px] rounded-br-[var(--radius-cut)] outline-none"
    >
      <CommandMenu
        commands={commands}
        onRun={(cmd) => {
          setOpen(false)
          run(cmd)
        }}
      />
      <div className="flex items-center justify-between border-t border-line px-4 py-2.5 font-mono text-[10px] uppercase tracking-widest text-muted">
        <span className="flex items-center gap-3">
          <span className="flex items-center gap-1"><Kbd>↑</Kbd><Kbd>↓</Kbd> move</span>
          <span className="flex items-center gap-1"><Kbd>↵</Kbd> open</span>
          <span className="hidden items-center gap-1 sm:flex"><Kbd>esc</Kbd> close</span>
        </span>
        <span className="flex items-center gap-1"><Kbd>{mod}</Kbd><Kbd>K</Kbd></span>
      </div>
    </Command.Dialog>
  )
}
