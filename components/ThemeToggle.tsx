'use client'

import { useSyncExternalStore } from 'react'

function currentTheme() {
  const theme = document.documentElement.dataset.theme
  return theme === 'dark' || (!theme && matchMedia('(prefers-color-scheme: dark)').matches)
}

function subscribe(notify: () => void) {
  const media = matchMedia('(prefers-color-scheme: dark)')
  const observer = new MutationObserver(notify)
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  })
  function syncStorage(event: StorageEvent) {
    if (event.key !== 'portfolio-theme' && event.key !== null) return
    const theme = event.newValue
    if (theme === 'system') delete document.documentElement.dataset.theme
    else document.documentElement.dataset.theme = theme === 'dark' ? 'dark' : 'light'
    notify()
  }
  window.addEventListener('storage', syncStorage)
  media.addEventListener('change', notify)
  return () => {
    observer.disconnect()
    window.removeEventListener('storage', syncStorage)
    media.removeEventListener('change', notify)
  }
}

export function ThemeToggle() {
  const dark = useSyncExternalStore(subscribe, currentTheme, () => false)
  function toggle() {
    const theme = currentTheme() ? 'light' : 'dark'
    document.documentElement.dataset.theme = theme
    try {
      localStorage.setItem('portfolio-theme', theme)
    } catch {
      /* Visit-only preference. */
    }
  }
  return (
    <button
      id="theme"
      className="theme-toggle"
      type="button"
      aria-label="Dark mode"
      aria-pressed={dark}
      onClick={toggle}
      title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <svg className="theme-sun" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
      <svg className="theme-moon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M20 14.1A8.5 8.5 0 0 1 9.9 4a8.5 8.5 0 1 0 10.2 10.2Z"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    </button>
  )
}
