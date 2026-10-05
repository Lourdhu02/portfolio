"use client"
import { useState } from 'react'
import Link from 'next/link'
import { m, AnimatePresence } from 'motion/react'

interface SampleMeter {
  id: string
  name: string
  type: string
  reading: string
  confidence: number
  latencies: {
    detect: string
    crop: string
    read: string
    total: string
  }
  chars: Array<{ char: string; conf: number }>
  notes: string
}

const SAMPLES: SampleMeter[] = [
  {
    id: 'sample-1',
    name: 'Sample 01 · Analog Dial',
    type: 'Analog Dial · YOLO26n-OBB + SVTRv2',
    reading: '4777.1 kWh',
    confidence: 99.2,
    latencies: {
      detect: '2.1 ms',
      crop: '0.8 ms',
      read: '11.6 ms',
      total: '14.5 ms'
    },
    chars: [
      { char: '4', conf: 99.8 },
      { char: '7', conf: 99.1 },
      { char: '7', conf: 98.9 },
      { char: '7', conf: 99.4 },
      { char: '.', conf: 99.9 },
      { char: '1', conf: 99.3 }
    ],
    notes: 'CTC repeat logic validated. Blank frame reset active.'
  },
  {
    id: 'sample-2',
    name: 'Sample 02 · Digital LCD',
    type: '7-Segment LCD · MobileViTv2 + CTC',
    reading: '08429.5 kWh',
    confidence: 99.7,
    latencies: {
      detect: '1.9 ms',
      crop: '0.7 ms',
      read: '9.8 ms',
      total: '12.4 ms'
    },
    chars: [
      { char: '0', conf: 99.9 },
      { char: '8', conf: 99.7 },
      { char: '4', conf: 99.8 },
      { char: '2', conf: 99.6 },
      { char: '9', conf: 99.5 },
      { char: '.', conf: 99.9 },
      { char: '5', conf: 99.8 }
    ],
    notes: 'High-contrast backlight. Glare compensation passed.'
  },
  {
    id: 'sample-3',
    name: 'Sample 03 · Industrial 3-Phase',
    type: 'Mechanical Rotary · SVTRv2 Fused SDPA',
    reading: '12984.0 kWh',
    confidence: 98.6,
    latencies: {
      detect: '2.4 ms',
      crop: '1.1 ms',
      read: '13.2 ms',
      total: '16.7 ms'
    },
    chars: [
      { char: '1', conf: 99.4 },
      { char: '2', conf: 99.1 },
      { char: '9', conf: 98.2 },
      { char: '8', conf: 98.5 },
      { char: '4', conf: 98.9 },
      { char: '.', conf: 99.7 },
      { char: '0', conf: 99.2 }
    ],
    notes: 'Extreme angle compensation via Spatial Transformer.'
  }
]

export default function LabPage() {
  const [selectedSample, setSelectedSample] = useState<SampleMeter>(SAMPLES[0])
  const [isProcessing, setIsProcessing] = useState(false)
  const [activeStep, setActiveStep] = useState<'idle' | 'detecting' | 'cropping' | 'reading' | 'done'>('done')
  const [copied, setCopied] = useState(false)

  const runSimulation = (sample: SampleMeter) => {
    setSelectedSample(sample)
    setIsProcessing(true)
    setActiveStep('detecting')

    setTimeout(() => {
      setActiveStep('cropping')
      setTimeout(() => {
        setActiveStep('reading')
        setTimeout(() => {
          setActiveStep('done')
          setIsProcessing(false)
        }, 500)
      }, 400)
    }, 400)
  }

  const copyPayload = () => {
    const payload = JSON.stringify({
      sample: selectedSample.name,
      reading: selectedSample.reading,
      confidence: `${selectedSample.confidence}%`,
      latencies: selectedSample.latencies,
      engine: 'TensorRT FP16 / Triton 24.08',
      hardwareTarget: 'NVIDIA L4'
    }, null, 2)
    navigator.clipboard.writeText(payload)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <main className="relative w-full max-w-6xl mx-auto px-6 py-32 text-text">
      <Link href="/" className="inline-block font-mono text-xs uppercase tracking-widest text-muted hover:text-accent transition-colors mb-16">
        ← Back to Home
      </Link>
      
      <header className="mb-16">
        <div className="flex items-center gap-3 font-mono text-xs text-detect uppercase tracking-widest mb-4">
          <span className="w-2 h-2 rounded-full bg-detect animate-pulse" />
          <span>Interactive Benchmark</span>
        </div>
        <h1 className="font-display text-6xl md:text-8xl leading-[0.85] mb-6 uppercase">
          Lab: Meter OCR
        </h1>
        <p className="font-mono text-muted uppercase tracking-widest max-w-2xl leading-relaxed">
          A scripted walkthrough of how a meter reading pipeline works: detection, cropping and CTC decoding. The samples are synthetic and the timings are illustrative, not production numbers. A live in-browser model is coming.
        </p>
      </header>

      {/* Preset Selectors */}
      <section className="mb-8">
        <div className="font-mono text-xs text-muted uppercase tracking-widest mb-3">Select Test Target:</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {SAMPLES.map((sample) => (
            <button
              key={sample.id}
              onClick={() => runSimulation(sample)}
              className={`p-4 text-left border transition-all ${
                selectedSample.id === sample.id 
                  ? 'border-detect bg-detect/10 text-text' 
                  : 'border-line bg-surface hover:border-muted text-muted'
              }`}
              style={{ borderBottomRightRadius: '10px' }}
            >
              <div className="font-mono text-xs text-detect mb-1">
                {selectedSample.id === sample.id ? '● ACTIVE' : '○ READY'}
              </div>
              <div className="font-display text-lg text-text tracking-wide">{sample.name}</div>
              <div className="font-mono text-[11px] text-muted mt-1">{sample.type}</div>
            </button>
          ))}
        </div>
      </section>

      {/* Visual Workspace Canvas */}
      <section className="relative w-full bg-surface border border-line p-6 md:p-8 mb-8 overflow-hidden" style={{ borderBottomRightRadius: '14px' }}>
        
        {/* Top Status Bar */}
        <div className="flex flex-wrap items-center justify-between pb-6 mb-6 border-b border-line/60 font-mono text-xs text-muted">
          <div className="flex items-center gap-2">
            <span className="text-detect">ENGINE:</span>
            <span>TensorRT FP16</span>
            <span className="text-line">|</span>
            <span className="text-detect">TARGET:</span>
            <span>NVIDIA L4</span>
          </div>
          <div className="flex items-center gap-4">
            <span>STATE: <span className="text-detect uppercase">{activeStep}</span></span>
            <button 
              onClick={() => runSimulation(selectedSample)}
              disabled={isProcessing}
              className="px-3 py-1 bg-detect/20 border border-detect text-detect hover:bg-detect/30 transition-all uppercase tracking-wider disabled:opacity-50"
            >
              {isProcessing ? 'Analyzing...' : 'Re-Run Pass'}
            </button>
          </div>
        </div>

        {/* Visual Simulated Meter Screen */}
        <div className="relative w-full aspect-[21/9] bg-[#050507] border border-line rounded flex items-center justify-center overflow-hidden">
          
          {/* Subtle Grid Backdrop */}
          <div 
            className="absolute inset-0 opacity-15"
            style={{
              backgroundImage: 'linear-gradient(#2DE2E6 1px, transparent 1px), linear-gradient(90deg, #2DE2E6 1px, transparent 1px)',
              backgroundSize: '32px 32px'
            }}
          />

          {/* Laser Scan Line during processing */}
          {isProcessing && (
            <m.div 
              initial={{ top: '0%' }}
              animate={{ top: '100%' }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
              className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-detect to-transparent z-20 shadow-[0_0_15px_#2DE2E6]"
            />
          )}

          {/* Meter Frame Simulator */}
          <div className="relative z-10 w-full max-w-xl p-6 bg-[#09090D] border border-line/80 rounded-lg flex flex-col items-center">
            
            {/* OBB Detection Box Overlay */}
            <div className={`relative px-8 py-5 border transition-all duration-300 ${
              activeStep === 'detecting' || activeStep === 'cropping' || activeStep === 'reading' || activeStep === 'done'
                ? 'border-detect shadow-[0_0_20px_rgba(45,226,230,0.2)]'
                : 'border-line'
            }`}>
              
              {/* Corner brackets */}
              <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-detect" />
              <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-detect" />
              <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-detect" />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-detect" />
              
              {/* Target ID Label */}
              <div className="absolute -top-6 left-0 font-mono text-[10px] text-detect tracking-widest uppercase">
                [OBB: DIAL_REGION 99.4%]
              </div>

              {/* Display Digits */}
              <div className="font-mono text-3xl md:text-5xl font-bold tracking-[0.25em] text-[#E0E0E0] select-none flex items-center">
                {activeStep === 'idle' ? (
                  <span className="text-muted/40">------.-</span>
                ) : (
                  selectedSample.chars.map((item, idx) => (
                    <m.span 
                      key={idx}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="inline-block hover:text-detect transition-colors"
                      title={`Confidence: ${item.conf}%`}
                    >
                      {item.char}
                    </m.span>
                  ))
                )}
              </div>
            </div>

            <div className="mt-4 font-mono text-[11px] text-muted uppercase tracking-widest text-center">
              {selectedSample.notes}
            </div>
          </div>
        </div>

        {/* Inference Telemetry & Latency Breakdown */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-line/60">
          <div className="p-3 bg-bg/50 border border-line">
            <div className="font-mono text-[10px] text-muted uppercase">01 / Detect (YOLO-OBB)</div>
            <div className="font-display text-2xl text-detect mt-1">{selectedSample.latencies.detect}</div>
          </div>
          <div className="p-3 bg-bg/50 border border-line">
            <div className="font-mono text-[10px] text-muted uppercase">02 / Crop & Rectify</div>
            <div className="font-display text-2xl text-detect mt-1">{selectedSample.latencies.crop}</div>
          </div>
          <div className="p-3 bg-bg/50 border border-line">
            <div className="font-mono text-[10px] text-muted uppercase">03 / Recognize (SVTRv2)</div>
            <div className="font-display text-2xl text-detect mt-1">{selectedSample.latencies.read}</div>
          </div>
          <div className="p-3 bg-bg/50 border border-line">
            <div className="font-mono text-[10px] text-muted uppercase">Total End-to-End</div>
            <div className="font-display text-2xl text-success mt-1">{selectedSample.latencies.total}</div>
          </div>
        </div>

        {/* JSON Export Strip */}
        <div className="mt-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 bg-bg border border-line font-mono text-xs">
          <div className="text-muted truncate max-w-xl">
            <span className="text-detect">OUTPUT:</span> {JSON.stringify({ reading: selectedSample.reading, confidence: `${selectedSample.confidence}%`, latency: selectedSample.latencies.total })}
          </div>
          <button 
            onClick={copyPayload}
            className="px-3 py-1.5 border border-line bg-surface hover:border-accent text-text transition-colors uppercase tracking-wider text-[11px] whitespace-nowrap"
            style={{ borderRadius: '6px' }}
          >
            {copied ? '✓ Copied Payload' : 'Copy JSON Telemetry'}
          </button>
        </div>

      </section>

      {/* Honesty note: this page is a demo, never production */}
      <footer className="border-t border-line pt-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs font-mono text-muted">
        <div>
          Synthetic samples · scripted demo · not the production system
        </div>
        <Link href="/work/meter-ocr" className="text-accent hover:underline uppercase tracking-wider">
          See the production system →
        </Link>
      </footer>
    </main>
  )
}
