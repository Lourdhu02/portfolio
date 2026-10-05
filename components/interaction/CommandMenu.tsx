"use client"
import { Command } from 'cmdk'
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'
import { TRUTH } from '@/content/truth'
import { type CommandDef } from '@/lib/commands'
import { copyText, toast } from '@/lib/interaction'
import { toggleJinx } from '@/components/JinxMode'
import { Kbd } from './Kbd'

export { Kbd }

export function useRunCommand() {
  const router = useRouter()
  return useCallback((cmd: CommandDef) => {
    if (cmd.action === 'copy-email') {
      void copyText(TRUTH.identity.email, 'Email copied to clipboard').then((ok) => {
        if (!ok) window.location.href = `mailto:${TRUTH.identity.email}`
      })
    } else if (cmd.action === 'toggle-jinx') {
      toast(toggleJinx() ? 'Jinx mode on · Esc to exit' : 'Jinx mode off')
    } else if (cmd.href && cmd.external) {
      window.open(cmd.href, '_blank', 'noopener,noreferrer')
    } else if (cmd.href) {
      router.push(cmd.href)
    }
  }, [router])
}

interface CommandMenuProps {
  commands: CommandDef[]
  onRun: (cmd: CommandDef) => void
  placeholder?: string
  listClassName?: string
}

// Input + grouped list, shared by the global ⌘K dialog and the docked lab console.
export function CommandMenu({ commands, onRun, placeholder = 'Type a command or search…', listClassName = 'max-h-[min(60vh,420px)]' }: CommandMenuProps) {
  const groups = commands.reduce<Record<string, CommandDef[]>>((acc, cmd) => {
    ;(acc[cmd.group] ??= []).push(cmd)
    return acc
  }, {})

  return (
    <>
      <div className="flex items-center gap-3 border-b border-line px-4">
        <span aria-hidden="true" className="font-mono text-accent">&gt;</span>
        <Command.Input
          placeholder={placeholder}
          className="h-14 w-full bg-transparent font-mono text-sm text-text outline-none placeholder:text-muted"
        />
      </div>
      <Command.List className={`${listClassName} overflow-y-auto overscroll-contain scroll-py-2 p-2`}>
        <Command.Empty className="py-10 text-center font-mono text-xs uppercase tracking-widest text-muted">
          Nothing matches. Try “lab” or “email”.
        </Command.Empty>
        {Object.entries(groups).map(([group, items]) => (
          <Command.Group
            key={group}
            heading={group}
            className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.2em] [&_[cmdk-group-heading]]:text-muted/70"
          >
            {items.map((cmd) => (
              <Command.Item
                key={cmd.id}
                value={`${cmd.label} ${cmd.group}`}
                keywords={cmd.keywords}
                onSelect={() => onRun(cmd)}
                className="group/item relative flex cursor-pointer items-center justify-between gap-4 rounded-[6px] px-3 py-2.5 font-mono text-sm text-text/80 transition-colors data-[selected=true]:bg-raised data-[selected=true]:text-text"
              >
                <span
                  aria-hidden="true"
                  className="absolute inset-y-2 left-0 w-0.5 origin-center scale-y-0 bg-accent transition-transform duration-150 group-data-[selected=true]/item:scale-y-100"
                />
                <span className="flex min-w-0 items-center gap-3">
                  <span className="truncate">{cmd.label}</span>
                  {cmd.external && <span aria-hidden="true" className="text-muted">↗</span>}
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  {cmd.hint && <span className="hidden truncate text-xs text-muted sm:inline">{cmd.hint}</span>}
                  {cmd.shortcut && (
                    <span className="hidden items-center gap-1 sm:flex" aria-label={`Shortcut ${cmd.shortcut.join(' then ')}`}>
                      {cmd.shortcut.map((k) => <Kbd key={k}>{k}</Kbd>)}
                    </span>
                  )}
                </span>
              </Command.Item>
            ))}
          </Command.Group>
        ))}
      </Command.List>
    </>
  )
}
