"use client"
import { useRef, useMemo, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import type { MotionValue } from 'motion/react'
import { vertexShader, fragmentShader } from './shaders/particle'
import { buildParticles, NO_SHOCK } from './particleData'
import { PARTICLE_COUNT, Tier } from './tiers'
import { color } from '@/lib/tokens'

interface ParticleSystemProps {
  tier: Exclude<Tier, 'static'>
  lines: string[]
  reducedMotion: boolean
  // 0 to 1 across the hero; scatters the name into a starfield as the page scrolls past it.
  // Supplied by Motion's scroll loop so the dissolve stays in step with the hero's own scroll-out.
  scrollProgress?: MotionValue<number>
  // Share of the viewport the name may fill, and how far to lift it, so it never runs into
  // the tagline and CTAs below it
  fitHeight?: number
  offsetY?: number
  onReady?: () => void
}

export function ParticleSystem({ tier, lines, reducedMotion, scrollProgress, fitHeight = 0.55, offsetY = 0, onReady }: ParticleSystemProps) {
  const groupRef = useRef<THREE.Group>(null)
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const { viewport, gl } = useThree()

  const particleCount = PARTICLE_COUNT[tier]
  const linesKey = lines.join('\n')

  const { positions, targets, seeds, sizes, accents, textWidth, textHeight } = useMemo(
    () => buildParticles(particleCount, linesKey.split('\n')),
    [particleCount, linesKey]
  )

  // Scale the whole block so the name always fits the width and its allotted band of height
  const fit = Math.min(1, (viewport.width * 0.88) / textWidth, (viewport.height * fitHeight) / textHeight)

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uProgress: { value: 0 },
    uMouse: { value: new THREE.Vector3(1e3, 1e3, 0) },
    uMouseForce: { value: 0 },
    uMouseRadius: { value: 1 },
    uShockOrigin: { value: new THREE.Vector3() },
    uShockAge: { value: NO_SHOCK },
    uScatter: { value: 0 },
    uPointScale: { value: 1 },
    uColor: { value: new THREE.Color(color.text) },
    uAccent: { value: new THREE.Color(color.accent) },
  }), [])

  const progressRef = useRef(reducedMotion ? 1 : 0)
  const lastPointer = useRef(new THREE.Vector2())
  const pointerWorld = useRef(new THREE.Vector3())
  const shockStart = useRef(-NO_SHOCK)

  useEffect(() => { onReady?.() }, [onReady])

  // A click or tap sends a shockwave ring from that point
  useEffect(() => {
    if (reducedMotion) return
    function onPointerDown(e: PointerEvent) {
      const mat = materialRef.current
      const group = groupRef.current
      if (!mat || !group || window.scrollY > window.innerHeight * 0.5) return
      const rect = gl.domElement.getBoundingClientRect()
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1
      const ny = -((e.clientY - rect.top) / rect.height) * 2 + 1
      const s = group.scale.x
      mat.uniforms.uShockOrigin.value.set((nx * viewport.width) / 2 / s, (ny * viewport.height) / 2 / s, 0)
      shockStart.current = mat.uniforms.uTime.value
    }
    window.addEventListener('pointerdown', onPointerDown)
    return () => window.removeEventListener('pointerdown', onPointerDown)
  }, [reducedMotion, gl, viewport.width, viewport.height])

  useFrame((state, delta) => {
    const mat = materialRef.current
    if (!mat) return
    const u = mat.uniforms
    u.uTime.value = state.clock.elapsedTime
    const cam = state.camera as THREE.PerspectiveCamera
    u.uPointScale.value = (state.size.height * state.gl.getPixelRatio()) / (2 * Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)))

    // Converge over ~1.8 s; per-particle stagger lives in the shader
    if (progressRef.current < 1) progressRef.current = Math.min(1, progressRef.current + delta * 0.55)
    u.uProgress.value = progressRef.current

    if (scrollProgress && !reducedMotion) {
      // The hero fades out by ~0.75 of its own scroll-out, so finish scattering before it goes
      u.uScatter.value = THREE.MathUtils.clamp(scrollProgress.get() / 0.6, 0, 1)
    }

    if (reducedMotion) return

    u.uShockAge.value = state.clock.elapsedTime - shockStart.current

    // Repulsion radius is ~12% of the viewport width, in the group's (unscaled) units
    u.uMouseRadius.value = Math.max(1.2, viewport.width * 0.12) / fit
    const target = pointerWorld.current.set(
      (state.pointer.x * viewport.width) / 2 / fit,
      (state.pointer.y * viewport.height) / 2 / fit,
      0
    )
    // Frame-rate independent smoothing; snap when the pointer arrives so it never sweeps in from afar
    if (u.uMouseForce.value < 0.05) u.uMouse.value.copy(target)
    else u.uMouse.value.lerp(target, 1 - Math.exp(-delta * 12))

    // Force rises while the pointer moves and eases off when it rests
    const moved = !lastPointer.current.equals(state.pointer)
    lastPointer.current.copy(state.pointer)
    u.uMouseForce.value = THREE.MathUtils.lerp(u.uMouseForce.value, moved ? 1 : 0, 1 - Math.exp(-delta * (moved ? 14 : 1.5)))
  })

  return (
    <group ref={groupRef} scale={fit} position={[0, viewport.height * offsetY, 0]}>
      <points>
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
    </group>
  )
}
