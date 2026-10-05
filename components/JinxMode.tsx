"use client"
import { useEffect, useState } from 'react'

export function JinxMode() {
  const [jinxed, setJinxed] = useState(false)

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key.toLowerCase() === 'j') {
        setJinxed(prev => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    if (jinxed) {
      document.documentElement.style.setProperty('--color-accent', '#FF00FF')
      document.documentElement.style.setProperty('--color-success', '#00FFFF')
      document.body.style.transform = 'skewX(-5deg)'
      document.body.style.transformOrigin = 'top center'
    } else {
      document.documentElement.style.removeProperty('--color-accent')
      document.documentElement.style.removeProperty('--color-success')
      document.body.style.transform = ''
      document.body.style.transformOrigin = ''
    }
  }, [jinxed])

  return null
}
