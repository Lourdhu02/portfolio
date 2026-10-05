import { useState, useEffect } from 'react'

export type Tier = 'high' | 'medium' | 'low'

export function usePerformanceTier(): Tier {
  const [tier, setTier] = useState<Tier>('high')

  useEffect(() => {
    // Basic heuristic based on device memory and concurrency
    const memory = (navigator as any).deviceMemory || 8
    const cores = navigator.hardwareConcurrency || 4
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    
    if (isMobile || memory <= 4 || cores <= 4) {
      setTier('low')
    } else if (memory <= 8 || cores <= 8) {
      setTier('medium')
    } else {
      setTier('high')
    }
  }, [])

  return tier
}
