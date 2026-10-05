"use client"
import dynamic from 'next/dynamic'

// For server components that want particle text: loads the canvas on the client only
export const LazyParticleName = dynamic(() => import('./ParticleName'), { ssr: false })
