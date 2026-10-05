"use client"
import { motion, useInView } from 'motion/react'
import { useRef } from 'react'

interface SplitLinesProps {
  children: string;
  className?: string;
  staggerDelay?: number;
}

export function SplitLines({ children, className = "", staggerDelay = 0.06 }: SplitLinesProps) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-10%" })

  // Very basic splitting by words for simplicity, but simulating line split
  // Ideally we use a true line splitter, but for now we split by words and use a flex container
  const words = children.split(' ')

  return (
    <div ref={ref} className={`flex flex-wrap gap-x-[0.25em] ${className}`}>
      {words.map((word, i) => (
        <div key={i} className="overflow-hidden inline-block pb-1">
          <motion.div
            initial={{ y: "100%" }}
            animate={inView ? { y: 0 } : { y: "100%" }}
            transition={{ 
              duration: 0.7, 
              ease: [0.22, 1, 0.36, 1], 
              delay: i * staggerDelay 
            }}
          >
            {word}
          </motion.div>
        </div>
      ))}
    </div>
  )
}
