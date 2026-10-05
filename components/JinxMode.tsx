"use client"
import { useEffect } from 'react'

const KONAMI = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a']
const WORD = 'jinx'
const STORAGE_KEY = 'jinx-mode'

function setJinx(on: boolean) {
  if (on) document.documentElement.dataset.jinx = ''
  else delete document.documentElement.dataset.jinx
  try {
    if (on) sessionStorage.setItem(STORAGE_KEY, '1')
    else sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    // Storage can be blocked; the mode still works for this page view.
  }
}

function isTyping(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
}

// Konami code or typing "jinx" turns it on for the session; Esc turns it off.
export function JinxMode() {
  useEffect(() => {
    try {
      if (sessionStorage.getItem(STORAGE_KEY)) setJinx(true)
    } catch {}

    let konami = 0
    let word = ''

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setJinx(false)
        return
      }
      if (isTyping(e.target) || e.metaKey || e.ctrlKey || e.altKey) return

      const key = e.key.toLowerCase()
      konami = key === KONAMI[konami] ? konami + 1 : key === KONAMI[0] ? 1 : 0
      word = (word + key).slice(-WORD.length)

      if (konami === KONAMI.length || word === WORD) {
        konami = 0
        word = ''
        setJinx(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return null
}
