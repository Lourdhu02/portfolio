"use client"
import { Command } from 'cmdk'
import { useMemo } from 'react'
import { COMMANDS, postCommands, type PostSummary } from '@/lib/commands'
import { useModKey } from '@/lib/useMediaQuery'
import { CommandMenu, Kbd, useRunCommand } from './CommandMenu'

// The ⌘K dialog itself. CommandPalette loads this (and cmdk with it) the first time the menu opens.
export default function CommandPaletteDialog({ posts, open, onOpenChange }: { posts: PostSummary[]; open: boolean; onOpenChange: (open: boolean) => void }) {
  const run = useRunCommand()
  const mod = useModKey()
  const commands = useMemo(() => [...COMMANDS, ...postCommands(posts)], [posts])

  return (
    <Command.Dialog
      open={open}
      onOpenChange={onOpenChange}
      label="Command menu"
      loop
      overlayClassName="cmdk-overlay fixed inset-0 z-[90] bg-bg/70 backdrop-blur-sm"
      contentClassName="cmdk-content fixed left-1/2 top-[14vh] z-[91] w-[min(640px,calc(100vw-2rem))] -translate-x-1/2 overflow-hidden border border-line bg-surface/95 shadow-[0_40px_120px_-20px_rgba(0,0,0,0.9)] backdrop-blur-xl rounded-[10px] rounded-br-[var(--radius-cut)] outline-none"
    >
      <CommandMenu
        commands={commands}
        onRun={(cmd) => {
          onOpenChange(false)
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
