"use client"
import { useRef, useMemo, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { vertexShader, fragmentShader } from './shaders/particle'
import { sampleTextToParticles } from '@/utils/canvasSampling'
import { Tier } from './tiers'

interface ParticleSystemProps {
  tier: Tier;
}

function buildParticleAttributes(particleCount: number) {
  // Generate target positions from text
  const targetArray = sampleTextToParticles('LOURDU RAJU', particleCount)

  // Initial random positions
  const posArray = new Float32Array(particleCount * 3)
  const seedArray = new Float32Array(particleCount)
  const sizeArray = new Float32Array(particleCount)
  const accentArray = new Float32Array(particleCount)

  for(let i = 0; i < particleCount; i++) {
    // Nebula-like initial distribution
    posArray[i * 3] = (Math.random() - 0.5) * 40
    posArray[i * 3 + 1] = (Math.random() - 0.5) * 40
    posArray[i * 3 + 2] = (Math.random() - 0.5) * 40 - 10

    seedArray[i] = Math.random()
    sizeArray[i] = Math.random() * 0.5 + 0.1

    // 6-8% tinted signal red
    accentArray[i] = Math.random() < 0.07 ? 1.0 : 0.0
  }

  return {
    positions: posArray,
    targets: targetArray,
    seeds: seedArray,
    sizes: sizeArray,
    accents: accentArray
  }
}

export function ParticleSystem({ tier }: ParticleSystemProps) {
  const pointsRef = useRef<THREE.Points>(null)
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const { viewport } = useThree()
  
  const particleCount = tier === 'high' ? 24000 : tier === 'medium' ? 12000 : 6000

  // Geometry attributes
  const { positions, targets, seeds, sizes, accents } = useMemo(
    () => buildParticleAttributes(particleCount),
    [particleCount]
  )

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uProgress: { value: 0 },
    uMouse: { value: new THREE.Vector3(0, 0, 0) },
    uMouseForce: { value: 0 },
    uColor: { value: new THREE.Color('#EDEDF0') },
    uAccent: { value: new THREE.Color('#FF4655') }
  }), [])

  // Animation values
  const progressRef = useRef(0)
  const isReducedMotion = typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false

  useFrame((state, delta) => {
    if (!materialRef.current) return
    
    const mat = materialRef.current
    mat.uniforms.uTime.value = state.clock.elapsedTime
    
    // Animate progress 0 -> 1 over 1.8 seconds (0.4s to 2.2s window)
    if (progressRef.current < 1.0) {
      if (isReducedMotion) {
        progressRef.current = 1.0
      } else {
        progressRef.current = Math.min(1.0, progressRef.current + delta * 0.55)
      }
      mat.uniforms.uProgress.value = progressRef.current
    }
    
    // Mouse repulsion logic
    if (!isReducedMotion) {
      // Convert normalized pointer to world space at z=0
      const vec = new THREE.Vector3(
        (state.pointer.x * viewport.width) / 2,
        (state.pointer.y * viewport.height) / 2,
        0
      )
      
      // Lerp mouse uniform
      mat.uniforms.uMouse.value.lerp(vec, 0.1)
      
      // If mouse is moving, increase force, else decay
      // Very basic decay for now
      if (Math.abs(state.pointer.x) > 0.01 || Math.abs(state.pointer.y) > 0.01) {
        mat.uniforms.uMouseForce.value = THREE.MathUtils.lerp(mat.uniforms.uMouseForce.value, 1.0, 0.1)
      } else {
        mat.uniforms.uMouseForce.value = THREE.MathUtils.lerp(mat.uniforms.uMouseForce.value, 0.0, 0.05)
      }
    }
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={particleCount} args={[positions, 3]} />
        <bufferAttribute attach="attributes-target" count={particleCount} args={[targets, 3]} />
        <bufferAttribute attach="attributes-seed" count={particleCount} args={[seeds, 1]} />
        <bufferAttribute attach="attributes-size" count={particleCount} args={[sizes, 1]} />
        <bufferAttribute attach="attributes-isAccent" count={particleCount} args={[accents, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
