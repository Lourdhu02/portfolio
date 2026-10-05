"use client"
import { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { vertexShader, fragmentShader } from './shaders/particle'
import { buildParticles, PARTICLE_ACCENT, PARTICLE_COLOR } from './particleData'

interface ParticleSystemProps {
  count: number;
}

// Scratch vector for the pointer, reused every frame instead of allocating one.
const pointerWorld = new THREE.Vector3()

export function ParticleSystem({ count: particleCount }: ParticleSystemProps) {
  const pointsRef = useRef<THREE.Points>(null)
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const { viewport } = useThree()
  
  // Geometry attributes
  const { positions, targets, seeds, sizes, accents } = useMemo(() => buildParticles(particleCount), [particleCount])

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uProgress: { value: 0 },
    uMouse: { value: new THREE.Vector3(0, 0, 0) },
    uMouseForce: { value: 0 },
    uColor: { value: new THREE.Color(PARTICLE_COLOR) },
    uAccent: { value: new THREE.Color(PARTICLE_ACCENT) }
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
      pointerWorld.set(
        (state.pointer.x * viewport.width) / 2,
        (state.pointer.y * viewport.height) / 2,
        0
      )
      
      // Lerp mouse uniform
      mat.uniforms.uMouse.value.lerp(pointerWorld, 0.1)
      
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
