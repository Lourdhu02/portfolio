// Site-wide interaction plumbing: window events so any component can open the
// command palette or raise a toast without sharing React context.

export const OPEN_PALETTE_EVENT = 'lr:open-palette'
export const TOAST_EVENT = 'lr:toast'

export function openPalette() {
  window.dispatchEvent(new Event(OPEN_PALETTE_EVENT))
}

export function toast(message: string) {
  window.dispatchEvent(new CustomEvent<string>(TOAST_EVENT, { detail: message }))
}

export async function copyText(text: string, message: string) {
  try {
    await navigator.clipboard.writeText(text)
    toast(message)
    return true
  } catch {
    return false
  }
}

export function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
}
