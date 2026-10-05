"use client"
import { useState } from 'react'
import { m } from 'motion/react'
import { METRICS, show } from '@/content/truth'

const p50 = METRICS.meterOcr.p50
const gpuShare = `${((p50.value / (p50.before ?? p50.value)) * 100).toFixed(1)}%`

const nodes = [
  { id: 'presence', label: 'Meter Presence', model: 'MobileViTv2', input: '3×256×256', engine: 'TensorRT FP16' },
  { id: 'dial', label: 'Dial Detection', model: 'YOLO26n-OBB', input: '3×352×352', engine: 'TensorRT FP16' },
  { id: 'type', label: 'Digital/Analog', model: 'MobileViTv2', input: 'UINT8 96×288×3', engine: 'TensorRT FP16' },
  { id: 'read', label: 'Readers', model: 'SVTRv2 + CTC ×6', input: 'Digital 3×96×W · analog 3×64×W', engine: 'TensorRT FP16' },
]

export function PipelineDiagram() {
  const [activeNode, setActiveNode] = useState<string | null>(null)
  const [isGpu, setIsGpu] = useState(true)

  return (
    <div className="w-full rounded-none border border-line bg-surface p-5 sm:p-8 relative overflow-hidden" style={{ borderBottomRightRadius: '14px' }}>
      
      {/* Header Controls */}
      <div className="flex flex-wrap gap-4 justify-between items-start mb-8 sm:mb-12">
        <h3 className="font-display text-2xl uppercase tracking-widest text-text">Serving Architecture</h3>
        <button 
          onClick={() => setIsGpu(!isGpu)}
          className="px-4 py-2 bg-raised border border-line text-sm font-mono hover:bg-line transition-colors"
          style={{ borderRadius: '10px' }}
        >
          Path: {isGpu ? 'GPU (Triton)' : 'Serverless fallback'}
        </button>
      </div>

      {/* Latency Viz */}
      <div className="mb-10 sm:mb-16">
        <div className="text-xs font-mono text-muted mb-2 uppercase tracking-widest">End-to-end p50, same 1,000 photos</div>
        <div className="h-4 bg-raised w-full overflow-hidden" style={{ borderRadius: '999px' }}>
          <m.div 
            className="h-full bg-accent"
            initial={false}
            animate={{ width: isGpu ? gpuShare : '100%' }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
          />
        </div>
        <div className="flex justify-between text-xs font-mono mt-2">
          <span className="text-accent">{isGpu ? show(p50) : show(p50, 'before')}</span>
          <span className="text-muted">{show(p50, 'before')}</span>
        </div>
      </div>

      {/* Phones: the four stages stack vertically and tap to expand, since there is no hover */}
      <div className="relative sm:hidden">
        <div aria-hidden="true" className="absolute left-[15px] top-4 bottom-4 w-px bg-line" />
        <ol className="relative">
        {nodes.map((node) => {
          const open = activeNode === node.id
          return (
            <li key={node.id} className="relative">
              <button
                type="button"
                aria-expanded={open}
                onClick={() => setActiveNode(open ? null : node.id)}
                className="flex w-full min-h-12 items-center gap-4 py-2 text-left"
              >
                <span className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 bg-surface transition-colors ${open ? 'border-accent' : 'border-line'}`}>
                  <span className={`h-2 w-2 rounded-full transition-colors ${open ? 'bg-accent' : 'bg-muted'}`} />
                </span>
                <span className={`font-mono text-xs uppercase tracking-wider ${open ? 'text-text' : 'text-muted'}`}>{node.label}</span>
                <span className="ml-auto font-mono text-xs text-muted" aria-hidden="true">{open ? '−' : '+'}</span>
              </button>
              {open && (
                <m.dl
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="ml-12 mb-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 border border-line bg-raised p-3 text-sm"
                  style={{ borderBottomRightRadius: '10px' }}
                >
                  <dt className="font-mono text-xs text-muted">MODEL</dt>
                  <dd>{node.model}</dd>
                  <dt className="font-mono text-xs text-muted">INPUT</dt>
                  <dd>{node.input}</dd>
                  <dt className="font-mono text-xs text-muted">ENGINE</dt>
                  <dd className="text-accent">{isGpu ? node.engine : 'Serverless function'}</dd>
                </m.dl>
              )}
            </li>
          )
        })}
        </ol>
      </div>

      {/* SVG Pipeline */}
      <div className="relative w-full h-[200px] hidden sm:block">
        {/* Draw Line */}
        {/* SVG path data cannot use calc(), so the 50px insets live on the box and the path spans a 0-100 viewBox. */}
        <svg className="absolute inset-y-0 left-[50px] right-[50px] h-full w-[calc(100%-100px)]" viewBox="0 0 100 200" preserveAspectRatio="none">
          <path d="M 0,100 L 100,100" stroke="#1C1C22" strokeWidth="2" fill="none" vectorEffect="non-scaling-stroke" />
          
          {/* Animated Pulse */}
          <m.path 
            d="M 0,100 L 100,100" 
            stroke={isGpu ? "#FF4655" : "#8A8A96"} 
            strokeWidth="4" 
            fill="none"
            vectorEffect="non-scaling-stroke"
            initial={{ pathLength: 0, pathOffset: 0, opacity: 0 }}
            animate={{ 
              pathLength: [0, 0.2, 0.2, 0], 
              pathOffset: [0, 0, 0.8, 1],
              opacity: [0, 1, 1, 0]
            }}
            transition={{
              duration: isGpu ? 1 : 2.5,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </svg>

        {/* Nodes */}
        <div className="absolute inset-0 flex justify-between items-center px-12">
          {nodes.map((node) => (
            <div 
              key={node.id}
              className="relative group cursor-pointer"
              onMouseEnter={() => setActiveNode(node.id)}
              onMouseLeave={() => setActiveNode(null)}
              onFocus={() => setActiveNode(node.id)}
              onBlur={() => setActiveNode(null)}
              tabIndex={0}
            >
              {/* Node Circle */}
              <div className="w-8 h-8 rounded-full bg-surface border-2 border-line z-10 relative group-hover:border-accent transition-colors flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-muted group-hover:bg-accent transition-colors" />
              </div>
              
              <div className="absolute top-12 left-1/2 -translate-x-1/2 text-center whitespace-nowrap">
                <span className="font-mono text-xs text-muted uppercase tracking-wider">{node.label}</span>
              </div>

              {/* Hover Panel */}
              {activeNode === node.id && (
                <m.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute bottom-12 left-1/2 -translate-x-1/2 bg-raised border border-line p-4 min-w-[200px] z-20 pointer-events-none"
                  style={{ borderBottomRightRadius: '14px' }}
                >
                  <div className="text-xs font-mono text-muted mb-1">MODEL</div>
                  <div className="text-sm font-medium mb-3">{node.model}</div>
                  
                  <div className="text-xs font-mono text-muted mb-1">INPUT</div>
                  <div className="text-sm font-medium mb-3">{node.input}</div>
                  
                  <div className="text-xs font-mono text-muted mb-1">ENGINE</div>
                  <div className="text-sm font-medium text-accent">{isGpu ? node.engine : 'Serverless function'}</div>
                </m.div>
              )}
            </div>
          ))}
        </div>
      </div>
      
    </div>
  )
}
