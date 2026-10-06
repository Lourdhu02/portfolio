"use client"
import { useMemo, useRef, type RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { BotKind } from './types'

// The four robots, built from primitives so the whole crew costs no model downloads.
// Every robot shares a body (pearl shell, dark visor, pill eyes, thruster) and gets its own
// ears, tail or wings plus a signature action that runs harder while the camera is on it:
// Jinx scans a meter, Tobi fetches a document, Mikey runs his wheel, Luffy sends sound rings.

export interface StageState {
  // Camera stop: 0 is the wide shot, 1–4 are the robots
  s: number
  // Pointer in -1..1, for head tracking and parallax
  px: number
  py: number
}

let glowTexture: THREE.Texture | null = null
function getGlowTexture() {
  if (glowTexture) return glowTexture
  const c = document.createElement('canvas')
  c.width = c.height = 64
  const g = c.getContext('2d')!
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32)
  grad.addColorStop(0, 'rgba(255,255,255,1)')
  grad.addColorStop(0.25, 'rgba(255,255,255,0.45)')
  grad.addColorStop(1, 'rgba(255,255,255,0)')
  g.fillStyle = grad
  g.fillRect(0, 0, 64, 64)
  glowTexture = new THREE.CanvasTexture(c)
  return glowTexture
}

function useMaterials(glow: string) {
  return useMemo(() => {
    const color = new THREE.Color(glow)
    return {
      shell: new THREE.MeshPhysicalMaterial({ color: '#f4f3f0', roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.12, sheen: 0.4, sheenColor: color }),
      trim: new THREE.MeshStandardMaterial({ color: '#25252d', metalness: 0.7, roughness: 0.3 }),
      visor: new THREE.MeshPhysicalMaterial({ color: '#06060a', roughness: 0.08, clearcoat: 1, metalness: 0.2 }),
      light: new THREE.MeshBasicMaterial({ color, toneMapped: false }),
      holo: new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false, toneMapped: false }),
      halo: new THREE.SpriteMaterial({ map: getGlowTexture(), color, transparent: true, opacity: 0.55, depthWrite: false }),
    }
  }, [glow])
}

type Mats = ReturnType<typeof useMaterials>

const activity = (state: StageState, index: number) => Math.max(0, 1 - Math.abs(state.s - (index + 1)))

function Halo({ mats, scale, position }: { mats: Mats; scale: number; position: [number, number, number] }) {
  return <sprite material={mats.halo} scale={[scale, scale, 1]} position={position} />
}

// Exhaust sparks under the thruster: one small points cloud per robot, updated on the CPU
function Sparks({ glow, count = 36 }: { glow: string; count?: number }) {
  const ref = useRef<THREE.Points>(null)
  const { geometry, seeds } = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3))
    // Fixed pseudo-random seeds, so renders stay pure
    const rand = (k: number) => { const x = Math.sin(k * 127.1) * 43758.5453; return x - Math.floor(x) }
    const seeds = Array.from({ length: count }, (_, i) => [rand(i + 1), rand(i + 51) * Math.PI * 2, 0.4 + rand(i + 101) * 0.8])
    return { geometry: g, seeds }
  }, [count])
  const material = useMemo(() => new THREE.PointsMaterial({ color: glow, size: 0.06, transparent: true, opacity: 0.85, depthWrite: false, toneMapped: false }), [glow])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (!ref.current) return
    const pos = ref.current.geometry.attributes.position as THREE.BufferAttribute
    for (let i = 0; i < count; i++) {
      const [phase, angle, speed] = seeds[i]
      const p = (t * speed + phase) % 1
      const r = 0.05 + p * 0.28
      pos.setXYZ(i, Math.cos(angle + t) * r, -1.05 - p * 0.9, Math.sin(angle + t) * r)
    }
    pos.needsUpdate = true
  })
  return <points ref={ref} geometry={geometry} material={material} />
}

// A holographic meter readout for Jinx to scan
function useReadoutTexture(glow: string) {
  return useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 256
    c.height = 96
    const g = c.getContext('2d')!
    g.strokeStyle = glow
    g.lineWidth = 3
    g.strokeRect(4, 4, 248, 88)
    g.fillStyle = glow
    g.font = 'bold 54px ui-monospace, monospace'
    g.textBaseline = 'middle'
    g.fillText('04777.1', 18, 52)
    return new THREE.CanvasTexture(c)
  }, [glow])
}

export function Robot({ kind, glow, index, position, state }: {
  kind: BotKind
  glow: string
  index: number
  position: [number, number, number]
  state: RefObject<StageState>
}) {
  const mats = useMaterials(glow)
  const readout = useReadoutTexture(glow)
  const body = useRef<THREE.Group>(null)
  const head = useRef<THREE.Group>(null)
  const eyes = useRef<THREE.Group>(null)
  const armL = useRef<THREE.Group>(null)
  const armR = useRef<THREE.Group>(null)
  const partA = useRef<THREE.Group>(null) // ears, wings
  const partB = useRef<THREE.Group>(null) // tail
  const action = useRef<THREE.Group>(null)
  const scan = useRef<THREE.Mesh>(null)
  const rings = useRef<THREE.Group>(null)
  const blink = useRef({ next: 2 + index * 0.7, until: 0 })
  const seed = index * 1.37

  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime + seed
    const st = state.current!
    const a = activity(st, index)
    const ease = 1 - Math.pow(0.002, dt)

    if (body.current) {
      body.current.position.y = Math.sin(t * 1.6) * 0.12
      body.current.rotation.z = Math.sin(t * 0.9) * 0.04
    }
    if (head.current) {
      head.current.rotation.y += ((st.px * 0.5 * a + Math.sin(t * 0.5) * 0.15 * (1 - a)) - head.current.rotation.y) * ease
      head.current.rotation.x += ((-st.py * 0.25 * a) - head.current.rotation.x) * ease
      head.current.rotation.z = Math.sin(t * 0.7) * 0.06
    }
    // Blink every few seconds, sometimes twice
    const b = blink.current
    if (t > b.next) { b.until = t + 0.12; b.next = t + 2.5 + Math.random() * 3 }
    if (eyes.current) eyes.current.scale.y += ((t < b.until ? 0.1 : 1) - eyes.current.scale.y) * 0.5
    // Arms swing gently, and the robot in focus waves
    if (armL.current) armL.current.rotation.z = 0.35 + Math.sin(t * 1.6) * 0.08
    if (armR.current) armR.current.rotation.z = -0.35 - Math.sin(t * 1.6) * 0.08 - a * (1.6 + Math.sin(t * 9) * 0.35)

    const speed = 0.4 + a * 1.6
    if (kind === 'cat') {
      if (partB.current) partB.current.rotation.y = Math.sin(t * 2) * 0.5
      if (partA.current) partA.current.rotation.z = Math.sin(t * 5) > 0.97 ? 0.15 : 0
      if (scan.current) {
        scan.current.position.x = Math.sin(t * 2.4 * speed) * 0.5
        ;(scan.current.material as THREE.MeshBasicMaterial).opacity = 0.25 + a * 0.6
      }
      if (action.current) action.current.position.y = 1.15 + Math.sin(t * 1.3) * 0.08
    } else if (kind === 'dog') {
      if (partB.current) partB.current.rotation.y = Math.sin(t * (6 + a * 14)) * (0.3 + a * 0.4)
      if (partA.current) partA.current.children.forEach((ear, i) => { ear.rotation.z = (i ? -1 : 1) * (0.15 + Math.sin(t * 3 + i) * 0.12 + a * 0.2) })
      if (action.current) {
        // The document flies out on a loop and is brought back to the front
        const p = (t * 0.35 * speed) % 1
        const r = 1.9 * Math.sin(p * Math.PI)
        action.current.position.set(Math.cos(p * Math.PI * 2) * r + 0.2, 0.9 + Math.sin(p * Math.PI) * 0.8, 0.6 + Math.sin(p * Math.PI * 2) * r * 0.6)
        action.current.rotation.y = p * Math.PI * 4
      }
    } else if (kind === 'hamster') {
      if (action.current) action.current.rotation.z -= dt * (0.6 + a * 3.2)
      if (partB.current) partB.current.children.forEach((foot, i) => { foot.position.z = 0.15 + Math.sin(t * (6 + a * 10) + i * Math.PI) * 0.18 })
    } else if (kind === 'parrot') {
      if (partA.current) partA.current.children.forEach((wing, i) => { wing.rotation.z = (i ? -1 : 1) * (0.25 + Math.abs(Math.sin(t * (3 + a * 9))) * (0.5 + a * 0.5)) })
      if (rings.current) rings.current.children.forEach((ring, i) => {
        const p = (t * 0.6 * speed + i / 3) % 1
        ring.position.z = 1 + p * 2.2
        ring.scale.setScalar(0.25 + p * 1.5)
        ;((ring as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = (1 - p) * (0.2 + a * 0.6)
      })
    }
  })

  const scale = kind === 'hamster' ? 0.88 : 1
  const ringMats = useMemo(() => [0, 1, 2].map(() => mats.holo.clone()), [mats])

  return (
    <group position={position} rotation={[0, -0.35, 0]}>
      {/* Hovering hex pad */}
      <group position={[0, -2, 0]}>
        <mesh material={mats.trim}><cylinderGeometry args={[1.3, 1.45, 0.16, 6]} /></mesh>
        <mesh material={mats.light} rotation={[Math.PI / 2, 0, Math.PI / 6]} position={[0, 0.09, 0]}><torusGeometry args={[1.18, 0.022, 6, 6]} /></mesh>
        <Halo mats={mats} scale={2.6} position={[0, 0.2, 0]} />
      </group>

      <group ref={body} scale={scale}>
        {/* Torso, chest core and thruster */}
        <mesh material={mats.shell} scale={kind === 'hamster' ? [1, 0.82, 0.92] : [0.82, 0.78, 0.74]}><sphereGeometry args={[0.85, 40, 28]} /></mesh>
        <mesh material={mats.light} position={[0, 0.05, 0.62]}><torusGeometry args={[0.13, 0.03, 8, 24]} /></mesh>
        <Halo mats={mats} scale={0.7} position={[0, 0.05, 0.7]} />
        <mesh material={mats.trim} position={[0, -0.78, 0]}><cylinderGeometry args={[0.22, 0.14, 0.22, 16]} /></mesh>
        <Halo mats={mats} scale={0.9} position={[0, -1.0, 0]} />
        <Sparks glow={glow} />

        {/* Arms */}
        <group ref={armL} position={[-0.68, 0.15, 0]}>
          <mesh material={mats.shell} position={[-0.05, -0.32, 0]}><capsuleGeometry args={[0.11, 0.38, 6, 12]} /></mesh>
        </group>
        <group ref={armR} position={[0.68, 0.15, 0]}>
          <mesh material={mats.shell} position={[0.05, -0.32, 0]}><capsuleGeometry args={[0.11, 0.38, 6, 12]} /></mesh>
        </group>

        {/* Head with visor and eyes */}
        <group ref={head} position={[0, 1.2, 0]}>
          <mesh material={mats.shell} scale={[1.12, 0.94, 1]}><sphereGeometry args={[0.78, 40, 28]} /></mesh>
          <mesh material={mats.visor} position={[0, 0.02, 0.36]} scale={[1, 0.68, 0.66]}><sphereGeometry args={[0.72, 40, 24]} /></mesh>
          <group ref={eyes} position={[0, 0.04, 0.83]}>
            <mesh material={mats.light} position={[-0.24, 0, 0]}><capsuleGeometry args={[0.075, 0.12, 6, 12]} /></mesh>
            <mesh material={mats.light} position={[0.24, 0, 0]}><capsuleGeometry args={[0.075, 0.12, 6, 12]} /></mesh>
          </group>
          <Halo mats={mats} scale={1.1} position={[0, 0.04, 0.9]} />
          {/* Antenna */}
          {kind !== 'parrot' && (
            <group position={[0.18, 0.72, 0]} rotation={[0, 0, -0.2]}>
              <mesh material={mats.trim} position={[0, 0.16, 0]}><cylinderGeometry args={[0.018, 0.018, 0.32, 8]} /></mesh>
              <mesh material={mats.light} position={[0, 0.36, 0]}><sphereGeometry args={[0.06, 16, 12]} /></mesh>
              <Halo mats={mats} scale={0.5} position={[0, 0.36, 0]} />
            </group>
          )}

          {kind === 'cat' && (
            <group ref={partA}>
              {[-1, 1].map((s) => (
                <group key={s} position={[s * 0.48, 0.62, 0]} rotation={[0, 0, -s * 0.38]}>
                  <mesh material={mats.shell}><coneGeometry args={[0.24, 0.46, 4]} /></mesh>
                  <mesh material={mats.light} position={[0, -0.02, 0.09]} scale={0.5}><coneGeometry args={[0.24, 0.46, 4]} /></mesh>
                </group>
              ))}
            </group>
          )}
          {kind === 'dog' && (
            <group ref={partA}>
              {[-1, 1].map((s) => (
                <group key={s} position={[s * 0.8, 0.28, 0]}>
                  <mesh material={mats.trim} position={[s * 0.06, -0.3, 0]} scale={[0.16, 0.5, 0.3]}><sphereGeometry args={[1, 20, 16]} /></mesh>
                </group>
              ))}
            </group>
          )}
          {kind === 'hamster' && (
            <>
              {[-1, 1].map((s) => (
                <mesh key={s} material={mats.shell} position={[s * 0.62, -0.28, 0.3]}><sphereGeometry args={[0.3, 24, 16]} /></mesh>
              ))}
              {[-1, 1].map((s) => (
                <mesh key={`e${s}`} material={mats.trim} position={[s * 0.5, 0.62, -0.05]} scale={[1, 1, 0.5]}><sphereGeometry args={[0.18, 20, 14]} /></mesh>
              ))}
            </>
          )}
          {kind === 'parrot' && (
            <>
              <mesh material={mats.trim} position={[0, -0.3, 0.9]} rotation={[Math.PI / 2 + 0.3, 0, 0]}><coneGeometry args={[0.16, 0.42, 12]} /></mesh>
              {[-0.5, 0, 0.5].map((r, i) => (
                <group key={r} position={[0, 0.66, -0.1 - i * 0.12]} rotation={[-0.5 - i * 0.2, 0, r]}>
                  <mesh material={mats.shell} position={[0, 0.25, 0]}><coneGeometry args={[0.08, 0.5, 8]} /></mesh>
                  <mesh material={mats.light} position={[0, 0.5, 0]}><sphereGeometry args={[0.05, 12, 8]} /></mesh>
                </group>
              ))}
            </>
          )}
        </group>

        {/* Character parts on the body */}
        {kind === 'cat' && (
          <group ref={partB} position={[0, -0.3, -0.6]}>
            {Array.from({ length: 7 }, (_, i) => (
              <mesh key={i} material={i === 6 ? mats.light : mats.trim} position={[Math.sin(i * 0.5) * 0.15, i * 0.14, -i * 0.1]}>
                <sphereGeometry args={[i === 6 ? 0.08 : 0.06, 12, 8]} />
              </mesh>
            ))}
          </group>
        )}
        {kind === 'dog' && (
          <group ref={partB} position={[0, -0.1, -0.62]}>
            <mesh material={mats.shell} position={[0, 0.18, -0.12]} rotation={[-0.7, 0, 0]}><capsuleGeometry args={[0.07, 0.3, 6, 10]} /></mesh>
          </group>
        )}
        {kind === 'hamster' && (
          <group ref={partB} position={[0, -0.72, 0]}>
            {[-1, 1].map((s) => (
              <mesh key={s} material={mats.trim} position={[s * 0.28, 0, 0.15]}><sphereGeometry args={[0.13, 16, 12]} /></mesh>
            ))}
          </group>
        )}
        {kind === 'parrot' && (
          <group ref={partA}>
            {[-1, 1].map((s) => (
              <group key={s} position={[s * 0.62, 0.3, -0.05]}>
                <mesh material={mats.shell} position={[s * 0.18, -0.35, 0]} scale={[0.14, 0.55, 0.38]}><sphereGeometry args={[1, 24, 16]} /></mesh>
                <mesh material={mats.light} position={[s * 0.24, -0.62, 0]} scale={[0.05, 0.22, 0.2]}><sphereGeometry args={[1, 12, 8]} /></mesh>
              </group>
            ))}
          </group>
        )}
      </group>

      {/* Signature actions */}
      {kind === 'cat' && (
        <group ref={action} position={[1.75, 1.15, 0.4]} rotation={[0, -0.3, 0]}>
          <mesh><planeGeometry args={[1.3, 0.49]} /><meshBasicMaterial map={readout} transparent opacity={0.9} toneMapped={false} side={THREE.DoubleSide} depthWrite={false} /></mesh>
          <mesh ref={scan} material={mats.holo.clone()} position={[0, 0, 0.01]}><planeGeometry args={[0.06, 0.6]} /></mesh>
        </group>
      )}
      {kind === 'dog' && (
        <group ref={action}>
          <mesh material={mats.holo}><planeGeometry args={[0.42, 0.56]} /></mesh>
          {[0.14, 0.04, -0.06, -0.16].map((y) => (
            <mesh key={y} material={mats.light} position={[-0.03, y, 0.005]}><planeGeometry args={[y === 0.14 ? 0.22 : 0.3, 0.025]} /></mesh>
          ))}
          <Halo mats={mats} scale={1} position={[0, 0, -0.02]} />
        </group>
      )}
      {kind === 'hamster' && (
        <group position={[0, -0.25, -0.1]}>
          <group ref={action}>
            <mesh material={mats.holo}><torusGeometry args={[1.75, 0.035, 8, 64]} /></mesh>
            {Array.from({ length: 8 }, (_, i) => (
              <mesh key={i} material={mats.holo} rotation={[0, 0, (i / 8) * Math.PI]}><boxGeometry args={[3.5, 0.015, 0.015]} /></mesh>
            ))}
          </group>
          <mesh material={mats.holo} position={[0, 0, -0.4]}><torusGeometry args={[1.75, 0.02, 8, 64]} /></mesh>
        </group>
      )}
      {kind === 'parrot' && (
        <group ref={rings} position={[0, 1.0, 0]}>
          {ringMats.map((m, i) => (
            <mesh key={i} material={m}><torusGeometry args={[0.35, 0.018, 8, 40]} /></mesh>
          ))}
        </group>
      )}
    </group>
  )
}
