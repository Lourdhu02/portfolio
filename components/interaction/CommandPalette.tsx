"use client"
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { GO_SHORTCUTS, type PostSummary } from '@/lib/commands'
import { OPEN_PALETTE_EVENT, isTypingTarget, toast } from '@/lib/interaction'

// cmdk and the menu only load once someone opens it, so they stay out of every page's first load.
const CommandPaletteDialog = dynamic(() => import('./CommandPaletteDialog'), { ssr: false })

// Global ⌘K / Ctrl+K menu, plus "/" to open and "g <letter>" to jump between pages.
export function CommandPalette({ posts }: { posts: PostSummary[] }) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  // Mount the dialog on first open and keep it mounted, so its close animation still plays.
  const [loaded, setLoaded] = useState(false)
  if (open && !loaded) setLoaded(true)

  useEffect(() => {
    let goPending = false
    let goTimer: ReturnType<typeof setTimeout> | undefined

    function onKeyDown(e: KeyboardEvent) {
      if (e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((o) => !o)
        return
      }
      if (e.metaKey || e.ctrlKey || e.altKey || isTypingTarget(e.target)) return
      if (document.querySelector('[role="dialog"]:not([data-state="closed"])')) return

      if (goPending) {
        goPending = false
        clearTimeout(goTimer)
        const dest = GO_SHORTCUTS[e.key.toLowerCase()]
        if (dest) {
          e.preventDefault()
          toast(`→ ${dest.label}`)
          router.push(dest.href)
        }
        return
      }
      if (e.key === '/') {
        e.preventDefault()
        setOpen(true)
      } else if (e.key === 'g') {
        goPending = true
        goTimer = setTimeout(() => { goPending = false }, 1200)
      }
    }
    const onOpen = () => setOpen(true)

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener(OPEN_PALETTE_EVENT, onOpen)
    return () => {
      clearTimeout(goTimer)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener(OPEN_PALETTE_EVENT, onOpen)
    }
  }, [router])

  return (
    loaded ? <CommandPaletteDialog posts={posts} open={open} onOpenChange={setOpen} /> : null
  )
}
