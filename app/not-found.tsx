import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="relative flex h-[100svh] w-full flex-col justify-center px-5 sm:px-10 lg:px-16">
      <p className="font-display text-[clamp(120px,30vw,420px)] font-black leading-[0.8] text-text">404</p>
      <div className="mt-8 flex flex-col items-start space-y-6">
        <h2 className="font-display text-4xl text-accent">404 / Missing</h2>
        <p className="font-mono text-sm uppercase tracking-widest text-muted">Nothing measured here yet.</p>
        <Link
          href="/"
          className="glass px-6 py-3 font-mono text-xs uppercase tracking-widest transition-colors hover:text-accent"
        >
          Back to the start
        </Link>
      </div>
    </main>
  )
}
