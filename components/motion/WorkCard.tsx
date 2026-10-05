"use client"
import { useRef, useState, ViewTransition } from 'react'
import { m, useMotionTemplate, useMotionValue, useSpring } from 'motion/react'
import Link from 'next/link'

interface WorkCardProps {
  id: string;
  title: string;
  kicker: string;
  href: string;
  children?: React.ReactNode;
}

export function WorkCard({ id, title, kicker, href, children }: WorkCardProps) {
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
      className="group relative flex flex-col space-y-4"
    >
      <m.div
        ref={ref}
        onMouseMove={onMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ scale: 0.98 }}
        whileTap={{ scale: 0.96 }}
        transition={{ type: "spring", stiffness: 320, damping: 30 }}
        className="relative overflow-hidden bg-surface aspect-video rounded-none w-full"
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
        <div className="absolute inset-0 z-20 border border-line pointer-events-none rounded-none" style={{ borderBottomRightRadius: '14px' }} />
        
        {/* Media / Code composition */}
        <div className="absolute inset-0 z-0">
          {children}
        </div>
      </m.div>

      <div className="flex flex-col space-y-1">
        <span className="font-mono text-xs uppercase tracking-widest text-muted">{kicker}</span>
        {/* Morphs into the case study's h1 on navigation (globals.css, "Shared title") */}
        <ViewTransition name={`work-title-${id}`} share="morph" default="none">
          <h3 className="font-display text-4xl w-fit">{title}</h3>
        </ViewTransition>
      </div>
    </Link>
  )
}
