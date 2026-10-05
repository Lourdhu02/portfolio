import { LazyParticleName } from '@/components/three/LazyParticleName'
import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="relative w-full h-[100vh] flex flex-col items-center justify-center">
      <LazyParticleName lines={['404']} className="absolute inset-0" />
      
      <div className="absolute inset-x-0 bottom-[16svh] z-10 flex flex-col items-center space-y-6 px-4 text-center">
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
