"use client"
import { useRef, type RefObject } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { Robot, type StageState } from './Robots'
import { STAGE_SPOTS, type Bot } from './types'

// The desktop stage: one scene with all four robots and a camera that flies between them as
// the pinned section scrolls. Stop 0 is a wide establishing shot; stops 1–4 frame each robot
// on the right third so the copy can sit on the left.

const WIDE = { pos: new THREE.Vector3(0, 3, 44), look: new THREE.Vector3(0, -0.2, -0.5) }
const SHOTS = [WIDE, ...STAGE_SPOTS.map(([x, y, z]) => {
  const look = new THREE.Vector3(x - 2.2, y - 0.1, z)
  return { pos: look.clone().add(new THREE.Vector3(0.8, 0.9, 10.5)), look }
})]

const smooth = (x: number) => x * x * (3 - 2 * x)

// Soft studio reflections for the clearcoat, generated locally (no HDR download)
function setupEnvironment({ gl, scene }: { gl: THREE.WebGLRenderer; scene: THREE.Scene }) {
  const pmrem = new THREE.PMREMGenerator(gl)
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
  pmrem.dispose()
}

function CameraRig({ state }: { state: RefObject<StageState> }) {
  const rig = useRef({ pos: new THREE.Vector3(), look: new THREE.Vector3(), current: { pos: WIDE.pos.clone(), look: WIDE.look.clone() } })

  useFrame(({ camera }, dt) => {
    const { pos, look, current } = rig.current
    const st = state.current!
    const i = Math.min(SHOTS.length - 2, Math.floor(st.s))
    const f = smooth(Math.min(1, Math.max(0, st.s - i)))
    const a = SHOTS[i]
    const b = SHOTS[i + 1]
    pos.lerpVectors(a.pos, b.pos, f)
    look.lerpVectors(a.look, b.look, f)
    // Arc between robots: rise and pull back mid-flight, then settle in
    const arc = Math.sin(f * Math.PI) * (i === 0 ? 0 : 1)
    pos.y += arc * 1.6
    pos.z += arc * 3.5
    // A little pointer parallax so the shot never feels locked off
    pos.x += st.px * 0.5
    pos.y += -st.py * 0.3

    const k = 1 - Math.pow(0.0005, dt)
    current.pos.lerp(pos, k)
    current.look.lerp(look, k)
    camera.position.copy(current.pos)
    camera.lookAt(current.look)
  })
  return null
}

export default function RobotScene({ bots, state, active }: { bots: Bot[]; state: RefObject<StageState>; active: boolean }) {
  return (
    <Canvas
      camera={{ position: WIDE.pos.toArray(), fov: 32, near: 0.1, far: 80 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      frameloop={active ? 'always' : 'never'}
      resize={{ scroll: false }}
      style={{ pointerEvents: 'none' }}
      onCreated={setupEnvironment}
    >
      <hemisphereLight args={['#ffffff', '#30303a', 0.7]} />
      <directionalLight position={[4, 8, 6]} intensity={1.6} />
      <directionalLight position={[-6, 3, -8]} intensity={1.2} color="#9fdcff" />
      <CameraRig state={state} />
      {bots.map((bot, i) => (
        <Robot key={bot.name} kind={bot.kind} glow={bot.glow} index={i} position={STAGE_SPOTS[i]} state={state} />
      ))}
    </Canvas>
  )
}
