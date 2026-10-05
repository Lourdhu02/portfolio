"use client"
import { Command } from 'cmdk'
import { COMMANDS } from '@/lib/commands'
import { CommandMenu, useRunCommand } from './CommandMenu'

const DOCKED = COMMANDS.filter((c) => c.group === 'Lab' || c.group === 'Work' || c.id === 'copy-email')

// The docked console's menu. Split from LabDock so cmdk only loads as the console scrolls near.
export default function LabConsole() {
  const run = useRunCommand()
  return (
    <Command label="Lab console" loop>
      <CommandMenu
        commands={DOCKED}
        onRun={run}
        placeholder="Search experiments and work…"
        listClassName="h-[320px]"
      />
    </Command>
  )
}
