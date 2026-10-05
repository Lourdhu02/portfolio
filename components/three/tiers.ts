import { useSyncExternalStore } from 'react'

export type Tier = 'high' | 'medium' | 'low'

// Device capabilities never change during a session, so there is nothing to subscribe to.
const subscribe = () => () => {}

function getDeviceTier(): Tier {
  // Basic heuristic based on device memory and concurrency
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory || 8
  const cores = navigator.hardwareConcurrency || 4
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

  if (isMobile || memory <= 4 || cores <= 4) return 'low'
  if (memory <= 8 || cores <= 8) return 'medium'
  return 'high'
}

export function usePerformanceTier(): Tier {
  return useSyncExternalStore(subscribe, getDeviceTier, () => 'high')
}
