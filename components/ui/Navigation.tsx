"use client"
import Link from 'next/link'
import { m, AnimatePresence } from 'motion/react'
import { useState } from 'react'

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)

  const links = [
    { label: 'Work', href: '/#work' },
    { label: 'Lab', href: '/lab' },
    { label: 'Writing', href: '/writing' },
    { label: 'About', href: '/about' },
  ]

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-50 p-6 flex justify-between items-center mix-blend-difference pointer-events-none">
        <Link href="/" className="font-display text-2xl text-text pointer-events-auto hover:text-accent transition-colors">
          LR
        </Link>
        <button 
          onClick={() => setIsOpen(true)}
          className="font-mono text-xs uppercase tracking-widest text-text pointer-events-auto hover:text-accent transition-colors"
        >
          [ Menu ]
        </button>
      </nav>

      <AnimatePresence>
        {isOpen && (
          <m.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] bg-bg/90 backdrop-blur-md flex flex-col items-center justify-center"
          >
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-6 right-6 font-mono text-xs uppercase tracking-widest text-text hover:text-accent transition-colors"
            >
              [ Close ]
            </button>
            <div className="flex flex-col space-y-8 items-center">
              {links.map((link, idx) => (
                <m.div
                  key={link.label}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 20, opacity: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Link 
                    href={link.href} 
                    onClick={() => setIsOpen(false)}
                    className="font-display text-6xl md:text-8xl hover:text-accent transition-colors"
                  >
                    {link.label}
                  </Link>
                </m.div>
              ))}
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </>
  )
}
