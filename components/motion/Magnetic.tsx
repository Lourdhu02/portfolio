"use client"
import { useRef, useState } from 'react'
import { motion, useSpring } from 'motion/react'

interface MagneticProps {
  children: React.ReactNode;
  strength?: number;
}

export function Magnetic({ children, strength = 10 }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null)
  
  const x = useSpring(0, { stiffness: 140, damping: 18 })
  const y = useSpring(0, { stiffness: 140, damping: 18 })
  
  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!ref.current) return
    const { left, top, width, height } = ref.current.getBoundingClientRect()
    const centerX = left + width / 2
    const centerY = top + height / 2
    const distanceX = e.clientX - centerX
    const distanceY = e.clientY - centerY
    
    // Check if within 80px magnetic pull radius
    if (Math.abs(distanceX) < width / 2 + 80 && Math.abs(distanceY) < height / 2 + 80) {
      x.set((distanceX / (width / 2 + 80)) * strength)
      y.set((distanceY / (height / 2 + 80)) * strength)
    } else {
      x.set(0)
      y.set(0)
    }
  }

  function onMouseLeave() {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{ x, y }}
      className="inline-block"
    >
      {children}
    </motion.div>
  )
}
