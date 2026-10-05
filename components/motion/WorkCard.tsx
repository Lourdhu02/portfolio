"use client"
import { useRef, useState, ViewTransition } from 'react'
import { m, useMotionTemplate, useMotionValue, useSpring } from 'motion/react'
import Link from 'next/link'

interface WorkCardProps {
  id: string;
  title: string;
  kicker: string;
  href: string;
  index: string;
  summary?: string;
  tags?: string[];
  aspect?: string;
  className?: string;
  children?: React.ReactNode;
}

export function WorkCard({ id, title, kicker, href, index, summary, tags = [], aspect = 'aspect-video', className = '', children }: WorkCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  
  const springX = useSpring(mouseX, { stiffness: 320, damping: 30 })
  const springY = useSpring(mouseY, { stiffness: 320, damping: 30 })
  
  function onMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect()
    mouseX.set(clientX - left)
    mouseY.set(clientY - top)
  }

  const maskImage = useMotionTemplate`radial-gradient(400px at ${springX}px ${springY}px, white, transparent 80%)`

  return (
    <Link 
      href={href}
      className={`group relative flex flex-col gap-5 ${className}`}
    >
      <m.div
        ref={ref}
        onMouseMove={onMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ scale: 0.99 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", stiffness: 320, damping: 30 }}
        className={`relative overflow-hidden bg-surface ${aspect} rounded-none w-full`}
        style={{
          borderBottomRightRadius: '14px' // signature cut corner
        }}
      >
        {/* Glow effect on hover */}
        <m.div 
          className="pointer-events-none absolute inset-0 z-10 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ maskImage, WebkitMaskImage: maskImage }}
        />
        
        {/* Border */}
        <div className="absolute inset-0 z-20 border border-line group-hover:border-muted/40 transition-colors duration-300 pointer-events-none rounded-none" style={{ borderBottomRightRadius: '14px' }} />
        {/* Accent rule that draws in on hover */}
        <div className="absolute left-0 top-0 z-20 h-px w-full origin-left scale-x-0 bg-accent transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100 pointer-events-none" />
        
        {/* Media / Code composition */}
        <div className="absolute inset-0 z-0">
          {children}
        </div>
      </m.div>

      <div className="grid grid-cols-[auto_1fr_auto] items-start gap-x-4 gap-y-1">
        <span className="font-mono text-xs text-accent pt-1.5">{index}</span>
        <div className="flex flex-col gap-1 min-w-0">
          <span className="font-mono text-[11px] uppercase tracking-widest text-muted">{kicker}</span>
          {/* Morphs into the case study's h1 on navigation (globals.css, "Shared title") */}
          <ViewTransition name={`work-title-${id}`} share="morph" default="none">
            <h3 className="font-display text-4xl md:text-5xl uppercase leading-[0.9] tracking-tight w-fit">{title}</h3>
          </ViewTransition>
          {summary && <p className="mt-2 max-w-md text-sm leading-relaxed text-text/70">{summary}</p>}
          {tags.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-2">
              {tags.map((t) => (
                <li key={t} className="rounded-full border border-line px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-muted">{t}</li>
              ))}
            </ul>
          )}
        </div>
        <span aria-hidden="true" className="mt-1 grid h-10 w-10 place-items-center rounded-full border border-line text-text transition-all duration-300 group-hover:border-accent group-hover:bg-accent group-hover:text-bg group-hover:-rotate-45">
          →
        </span>
      </div>
    </Link>
  )
}
