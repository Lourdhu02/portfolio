"use client"
import { useEffect, useSyncExternalStore } from 'react'

export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'theme'
const LIGHT_QUERY = '(prefers-color-scheme: light)'

// Runs in <head> before first paint (app/layout.tsx), so the page never flashes the wrong
// theme. A saved choice wins; otherwise the system setting decides.
export const themeScript = `try{var t=localStorage.getItem('${STORAGE_KEY}');if(t!=='light'&&t!=='dark')t=matchMedia('${LIGHT_QUERY}').matches?'light':'dark';document.documentElement.dataset.theme=t}catch(e){}`

function systemTheme(): Theme {
  return window.matchMedia(LIGHT_QUERY).matches ? 'light' : 'dark'
}

function savedTheme(): Theme | null {
  try {
    const t = localStorage.getItem(STORAGE_KEY)
    return t === 'light' || t === 'dark' ? t : null
  } catch {
    return null
  }
}

function currentTheme(): Theme {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'
}

function apply(theme: Theme) {
  document.documentElement.dataset.theme = theme
}

// Flip the theme. Picking the one the system already uses clears the saved choice, so the
// site goes back to following the system. The new theme wipes in as a circle from (x, y).
export function toggleTheme(origin?: { x: number; y: number }): Theme {
  const next: Theme = currentTheme() === 'light' ? 'dark' : 'light'
  try {
    if (next === systemTheme()) localStorage.removeItem(STORAGE_KEY)
    else localStorage.setItem(STORAGE_KEY, next)
  } catch {
    // Storage can be blocked; the switch still applies to this page view.
  }

  const root = document.documentElement
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!document.startViewTransition || reduce) {
    apply(next)
    return next
  }
  const x = origin?.x ?? window.innerWidth - 40
  const y = origin?.y ?? 40
  const r = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y))
  root.style.setProperty('--theme-x', `${x}px`)
  root.style.setProperty('--theme-y', `${y}px`)
  root.style.setProperty('--theme-r', `${r}px`)
  root.classList.add('theme-vt')
  const vt = document.startViewTransition(() => apply(next))
  vt.finished.finally(() => root.classList.remove('theme-vt'))
  return next
}

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
  return () => observer.disconnect()
}

export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, currentTheme, () => 'dark')
}

export function ThemeToggle({ className = '' }: { className?: string }) {
  const theme = useTheme()

  // With no saved choice, follow the system setting live.
  useEffect(() => {
    const mq = window.matchMedia(LIGHT_QUERY)
    const onChange = () => { if (!savedTheme()) apply(systemTheme()) }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const next = theme === 'light' ? 'dark' : 'light'
  return (
    <button
      type="button"
      onClick={(e) => toggleTheme(e.detail ? { x: e.clientX, y: e.clientY } : undefined)}
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
      className={`group relative flex h-11 w-11 items-center justify-center text-text ${className}`}
    >
      {/* Half-filled disc: the filled half swaps sides as the theme changes */}
      <svg viewBox="0 0 20 20" className="h-[18px] w-[18px] transition-transform duration-500 ease-out group-hover:rotate-180" aria-hidden="true">
        <circle cx="10" cy="10" r="8.25" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M10 1.75a8.25 8.25 0 0 1 0 16.5z"
          fill="currentColor"
          className="origin-center transition-transform duration-500"
          style={{ transform: theme === 'light' ? 'scaleX(-1)' : undefined }}
        />
      </svg>
    </button>
  )
}
