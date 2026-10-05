"use client"
import { useState } from 'react'
import { m } from 'motion/react'

const nodes = [
  { id: 'presence', label: 'Meter Presence', model: 'MobileViTv2', input: '3×256×256', engine: 'TensorRT FP16' },
  { id: 'dial', label: 'Dial Detection', model: 'YOLO26n-OBB', input: '3×352×352', engine: 'TensorRT FP16' },
  { id: 'type', label: 'Digital/Analog', model: 'MobileViTv2', input: 'Crop', engine: 'TensorRT FP16' },
  { id: 'read', label: 'Readers', model: 'SVTRv2 + CTC', input: 'Sequence', engine: 'TensorRT FP16' },
]

export function PipelineDiagram() {
  const [activeNode, setActiveNode] = useState<string | null>(null)
  const [isGpu, setIsGpu] = useState(true)

  return (
    <div className="w-full rounded-none border border-line bg-surface p-8 relative overflow-hidden" style={{ borderBottomRightRadius: '14px' }}>
      
      {/* Header Controls */}
      <div className="flex justify-between items-start mb-12">
        <h3 className="font-display text-2xl uppercase tracking-widest text-text">Serving Architecture</h3>
        <button 
          onClick={() => setIsGpu(!isGpu)}
          className="px-4 py-2 bg-raised border border-line text-sm font-mono hover:bg-line transition-colors"
          style={{ borderRadius: '10px' }}
        >
          Path: {isGpu ? 'GPU (Triton)' : 'Serverless (ONNX)'}
        </button>
      </div>

      {/* Latency Viz */}
      <div className="mb-16">
        <div className="text-xs font-mono text-muted mb-2 uppercase tracking-widest">End-to-End Latency (p50)</div>
        <div className="h-4 bg-raised w-full overflow-hidden" style={{ borderRadius: '999px' }}>
          <m.div 
            className="h-full bg-accent"
            initial={false}
            animate={{ width: isGpu ? '11%' : '100%' }} // 156ms vs 1415ms
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
          />
        </div>
        <div className="flex justify-between text-xs font-mono mt-2">
          <span className="text-accent">{isGpu ? '156ms' : '1,415ms'}</span>
          <span className="text-muted">1.4s</span>
        </div>
      </div>

      {/* SVG Pipeline */}
      <div className="relative w-full h-[200px]">
        {/* Draw Line */}
        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
          <path d="M 50,100 L calc(100% - 50px),100" stroke="#1C1C22" strokeWidth="2" fill="none" />
          
          {/* Animated Pulse */}
          <m.path 
            d="M 50,100 L calc(100% - 50px),100" 
            stroke={isGpu ? "#FF4655" : "#8A8A96"} 
            strokeWidth="4" 
            fill="none"
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
                  <div className="text-sm font-medium text-accent">{isGpu ? node.engine : 'ONNX / TFLite'}</div>
                </m.div>
              )}
            </div>
          ))}
        </div>
      </div>
      
    </div>
  )
}
