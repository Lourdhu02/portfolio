"use client"
import { useSyncExternalStore } from 'react'

// Server render and hydration use `serverValue`, then the real match takes over.
export function useMediaQuery(query: string, serverValue = false) {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(query)
      mq.addEventListener('change', onChange)
      return () => mq.removeEventListener('change', onChange)
    },
    () => window.matchMedia(query).matches,
    () => serverValue,
  )
}

const noop = () => () => {}

// "⌘" on Apple platforms, "Ctrl" elsewhere. Renders "⌘" on the server.
export function useModKey() {
  return useSyncExternalStore(
    noop,
    () => (/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent) ? '⌘' : 'Ctrl'),
    () => '⌘',
  )
}
