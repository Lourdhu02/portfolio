"use client"
import { useEffect, useRef } from 'react'
import { vertexShader, fragmentShader } from './shaders/particle'
import { buildParticles, PARTICLE_ACCENT, PARTICLE_COLOR } from './particleData'
import type { Tier } from './tiers'

// The phone hero: the same shaders and particle data as ParticleSystem, drawn with plain WebGL.
// three.js + R3F are ~270KB gzipped and most of that is never used by one points draw call,
// so phones skip them. It mirrors what ParticleCanvas sets up: camera at z=15, fov 45,
// transparent canvas, additive blending, no post-processing.

const FOV = 45
const CAMERA_Z = 15
const NEAR = 0.1
const FAR = 1000
const MAX_DPR = 1.5

// What three's ShaderMaterial declares in front of the shader source.
const VERTEX_PREFIX = `precision highp float;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
attribute vec3 position;
`
const FRAGMENT_PREFIX = 'precision highp float;\n'

// three converts hex colors from sRGB to linear before they reach the shader; do the same so phones match desktop.
function linearRGB(hex: string): [number, number, number] {
  const channel = (i: number) => {
    const c = parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16) / 255
    return c < 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  }
  return [channel(0), channel(1), channel(2)]
}

function perspective(fovDeg: number, aspect: number, near: number, far: number) {
  const f = 1 / Math.tan((fovDeg * Math.PI) / 360)
  const nf = 1 / (near - far)
  // Column-major, as WebGL expects.
  return new Float32Array([
    f / aspect, 0, 0, 0,
    0, f, 0, 0,
    0, 0, (far + near) * nf, -1,
    0, 0, 2 * far * near * nf, 0,
  ])
}

// Camera at (0, 0, CAMERA_Z) looking down -z, object at the origin: a plain translation.
const MODEL_VIEW = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, -CAMERA_Z, 1])

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)!
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  return shader
}

interface LiteParticlesProps {
  count: number
  onTierChange: (tier: Tier) => void
}

export default function LiteParticles({ count, onTierChange }: LiteParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  // Read through a ref so a new callback identity never restarts the GL setup.
  const onTierChangeRef = useRef(onTierChange)
  useEffect(() => {
    onTierChangeRef.current = onTierChange
  })

  useEffect(() => {
    const canvas = canvasRef.current
    const container = canvas?.parentElement
    if (!canvas || !container) return

    const gl = canvas.getContext('webgl', { alpha: true, antialias: false, depth: false, premultipliedAlpha: true, powerPreference: 'default' })
    if (!gl) {
      onTierChangeRef.current('static')
      return
    }

    const vs = compile(gl, gl.VERTEX_SHADER, VERTEX_PREFIX + vertexShader)
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT_PREFIX + fragmentShader)
    const program = gl.createProgram()!
    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      onTierChangeRef.current('static')
      return
    }
    gl.useProgram(program)

    const data = buildParticles(count)
    const attributes: Array<[string, Float32Array, number]> = [
      ['position', data.positions, 3],
      ['target', data.targets, 3],
      ['seed', data.seeds, 1],
      ['size', data.sizes, 1],
      ['isAccent', data.accents, 1],
    ]
    const buffers = attributes.map(([name, array, itemSize]) => {
      const buffer = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
      gl.bufferData(gl.ARRAY_BUFFER, array, gl.STATIC_DRAW)
      const location = gl.getAttribLocation(program, name)
      if (location >= 0) {
        gl.enableVertexAttribArray(location)
        gl.vertexAttribPointer(location, itemSize, gl.FLOAT, false, 0, 0)
      }
      return buffer
    })

    const u = (name: string) => gl.getUniformLocation(program, name)
    const uTime = u('uTime')
    const uProgress = u('uProgress')
    const uMouse = u('uMouse')
    const uMouseForce = u('uMouseForce')
    const uProjection = u('projectionMatrix')
    gl.uniformMatrix4fv(u('modelViewMatrix'), false, MODEL_VIEW)
    gl.uniform3fv(u('uColor'), linearRGB(PARTICLE_COLOR))
    gl.uniform3fv(u('uAccent'), linearRGB(PARTICLE_ACCENT))

    // three's AdditiveBlending for a non-premultiplied material; no depth writes.
    gl.disable(gl.DEPTH_TEST)
    gl.enable(gl.BLEND)
    gl.blendEquation(gl.FUNC_ADD)
    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE, gl.ONE, gl.ONE)
    gl.clearColor(0, 0, 0, 0)

    // World-space size of the z=0 plane, for mapping the pointer like R3F's viewport does.
    let viewWidth = 1
    let viewHeight = 1
    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)
      const { width, height } = container!.getBoundingClientRect()
      canvas!.width = Math.max(1, Math.round(width * dpr))
      canvas!.height = Math.max(1, Math.round(height * dpr))
      gl!.viewport(0, 0, canvas!.width, canvas!.height)
      const aspect = width / Math.max(1, height)
      gl!.uniformMatrix4fv(uProjection, false, perspective(FOV, aspect, NEAR, FAR))
      viewHeight = 2 * Math.tan((FOV * Math.PI) / 360) * CAMERA_Z
      viewWidth = viewHeight * aspect
    }
    resize()
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(container)

    // Normalized pointer in [-1, 1], like R3F's state.pointer.
    const pointer = { x: 0, y: 0 }
    function onPointerMove(e: PointerEvent) {
      const rect = container!.getBoundingClientRect()
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
    }
    container.addEventListener('pointermove', onPointerMove, { passive: true })

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const mouse = { x: 0, y: 0 }
    let mouseForce = 0
    let progress = 0
    const start = performance.now()
    let last = start
    let frame = 0
    let running = false

    // A light stand-in for PerformanceMonitor: if the phone cannot hold ~30fps once warmed up, show the static hero.
    let slowFrames = 0
    let sampledFrames = 0

    function tick(now: number) {
      frame = requestAnimationFrame(tick)
      const delta = Math.min((now - last) / 1000, 0.1)
      last = now

      if (now - start > 1500 && sampledFrames < 90) {
        sampledFrames++
        if (delta > 1 / 30) slowFrames++
        if (sampledFrames === 90 && slowFrames > 60) {
          onTierChangeRef.current('static')
          return
        }
      }

      if (progress < 1) {
        progress = reducedMotion ? 1 : Math.min(1, progress + delta * 0.55)
      }
      if (!reducedMotion) {
        const targetX = (pointer.x * viewWidth) / 2
        const targetY = (pointer.y * viewHeight) / 2
        mouse.x += (targetX - mouse.x) * 0.1
        mouse.y += (targetY - mouse.y) * 0.1
        const moving = Math.abs(pointer.x) > 0.01 || Math.abs(pointer.y) > 0.01
        mouseForce += ((moving ? 1 : 0) - mouseForce) * (moving ? 0.1 : 0.05)
      }

      gl!.uniform1f(uTime, (now - start) / 1000)
      gl!.uniform1f(uProgress, progress)
      gl!.uniform3f(uMouse, mouse.x, mouse.y, 0)
      gl!.uniform1f(uMouseForce, mouseForce)
      gl!.clear(gl!.COLOR_BUFFER_BIT)
      gl!.drawArrays(gl!.POINTS, 0, count)
    }

    function play() {
      if (running) return
      running = true
      last = performance.now()
      frame = requestAnimationFrame(tick)
    }
    function pause() {
      running = false
      cancelAnimationFrame(frame)
    }

    // Stop drawing once the hero is well off screen.
    const visibility = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? play() : pause()),
      { rootMargin: '200px' }
    )
    visibility.observe(container)

    function onContextLost(e: Event) {
      e.preventDefault()
      pause()
      onTierChangeRef.current('static')
    }
    canvas.addEventListener('webglcontextlost', onContextLost)

    return () => {
      pause()
      visibility.disconnect()
      resizeObserver.disconnect()
      container.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('webglcontextlost', onContextLost)
      buffers.forEach((buffer) => gl.deleteBuffer(buffer))
      gl.deleteProgram(program)
      gl.deleteShader(vs)
      gl.deleteShader(fs)
    }
  }, [count])

  return <canvas ref={canvasRef} className="block h-full w-full" aria-hidden="true" />
}
