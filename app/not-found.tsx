import { ParticleName } from '@/components/three/ParticleName'
import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="relative w-full h-[100vh] flex flex-col items-center justify-center">
      <div className="absolute inset-0 z-0">
        <ParticleName />
      </div>
      
      <div className="relative z-10 flex flex-col items-center space-y-6 mt-48">
        <h2 className="font-display text-4xl text-accent">404 / Missing</h2>
        <p className="font-mono text-sm uppercase tracking-widest text-muted">The requested path has drifted.</p>
        <Link 
          href="/"
          className="px-6 py-3 border border-line bg-surface hover:border-accent hover:text-accent transition-colors font-mono text-xs uppercase tracking-widest"
          style={{ borderRadius: '10px' }}
        >
          Return to Lab
        </Link>
      </div>
    </main>
  )
}
