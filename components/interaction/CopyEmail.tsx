"use client"
import { copyText } from '@/lib/interaction'

export function CopyEmail({ email, className }: { email: string; className?: string }) {
  return (
    <button
      type="button"
      data-cursor="copy"
      onClick={() => void copyText(email, 'Email copied to clipboard')}
      className={className}
    >
      {email}
      <span className="sr-only"> (copy to clipboard)</span>
    </button>
  )
}
