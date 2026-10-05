export function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex min-w-5 h-5 items-center justify-center rounded-[4px] border border-line bg-bg px-1 font-mono text-[10px] uppercase text-muted">
      {children}
    </kbd>
  )
}
