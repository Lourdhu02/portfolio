"use client"
import * as React from "react"
import { Command } from "cmdk"
import Link from "next/link"

export function LabCommand() {
  const [open, setOpen] = React.useState(true)
  const [value, setValue] = React.useState("")

  return (
    <div className="w-full max-w-2xl mx-auto rounded-none border border-line bg-surface overflow-hidden shadow-2xl" style={{ borderBottomRightRadius: '14px' }}>
      <Command 
        value={value} 
        onValueChange={setValue}
        className="w-full flex flex-col"
        shouldFilter={true}
      >
        <div className="flex items-center border-b border-line px-4">
          <span className="text-muted font-mono mr-2">&gt;</span>
          <Command.Input 
            placeholder="Search lab experiments..." 
            className="flex h-14 w-full bg-transparent text-sm font-mono outline-none placeholder:text-muted disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
        
        <Command.List className="max-h-[300px] overflow-y-auto overflow-x-hidden p-2">
          <Command.Empty className="py-6 text-center text-sm font-mono text-muted">
            No experiments found.
          </Command.Empty>
          
          <Command.Group heading={<div className="px-2 py-2 text-xs font-mono text-muted uppercase tracking-widest">Active Experiments</div>}>
            <Command.Item value="ocr-demo" className="aria-selected:bg-raised aria-selected:text-accent cursor-pointer rounded-none px-2 py-3 text-sm font-mono transition-colors">
              <Link href="/lab" className="flex items-center justify-between w-full">
                <span>01. In-Browser OCR Demo</span>
                <span className="text-muted text-xs">ONNX/WASM</span>
              </Link>
            </Command.Item>
            <Command.Item value="fluid-sim" className="aria-selected:bg-raised aria-selected:text-accent cursor-pointer rounded-none px-2 py-3 text-sm font-mono transition-colors">
              <Link href="/404" className="flex items-center justify-between w-full">
                <span>02. Fluid Sim</span>
                <span className="text-muted text-xs">Compute</span>
              </Link>
            </Command.Item>
          </Command.Group>

          <Command.Separator className="h-px w-full bg-line my-2" />

          <Command.Group heading={<div className="px-2 py-2 text-xs font-mono text-muted uppercase tracking-widest">Archived</div>}>
            <Command.Item value="legacy-particles" className="aria-selected:bg-raised aria-selected:text-accent cursor-pointer rounded-none px-2 py-3 text-sm font-mono text-muted transition-colors">
              <Link href="/404" className="flex items-center justify-between w-full">
                <span>Legacy Particles</span>
                <span className="text-xs">Canvas2D</span>
              </Link>
            </Command.Item>
          </Command.Group>
        </Command.List>
      </Command>
    </div>
  )
}
