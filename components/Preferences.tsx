export function IstClock({ initial }: { initial: string }) {
  return (
    <span className="clock mono muted">
      Bengaluru{' '}
      <span data-ist-clock suppressHydrationWarning>
        {initial}
      </span>{' '}
      IST
    </span>
  )
}
