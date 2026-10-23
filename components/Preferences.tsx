/** Server-rendered controls, progressively enhanced by the small site script. */
export function ThemeToggle() {
  return (
    <label className="theme-select" title="Color theme">
      <span className="sr-only">Color theme</span>
      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <circle cx="8" cy="8" r="6" stroke="currentColor" />
        <path d="M8 2a6 6 0 0 1 0 12Z" fill="currentColor" />
      </svg>
      <select id="theme" aria-label="Color theme" defaultValue="light">
        <option value="light">Light</option>
        <option value="dark">Dark</option>
        <option value="system">System</option>
      </select>
    </label>
  )
}
export function IstClock({ initial }: { initial: string }) {
  return (
    <span className="clock mono muted">
      Bengaluru <span data-ist-clock suppressHydrationWarning>{initial}</span> IST
    </span>
  )
}
