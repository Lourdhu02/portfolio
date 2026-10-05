"use client"
import { useEffect, useRef } from 'react'
import { useScroll } from 'motion/react'
import { vertexShader, fragmentShader } from './shaders/particle'
import { buildParticles, NO_SHOCK } from './particleData'
import { PARTICLE_COUNT, usePrefersReducedMotion } from './tiers'
import type { ParticleNameProps } from './ParticleScene'
import { color } from '@/lib/tokens'

// The low-tier hero: ParticleSystem's shaders, buffers and frame logic drawn with plain WebGL.
// three.js + R3F + postprocessing are ~270KB gzipped and one points draw call needs almost none of
// it, so phones skip them (and the bloom pass, which is several full-screen passes per frame).
// Keep this in step with ParticleScene/ParticleSystem: same camera (z=15, fov 45), the group's
// fit scale and offset, pointer repulsion, click shockwave and scroll dissolve.

const FOV = 45
const CAMERA_Z = 15
const NEAR = 0.1
const FAR = 1000
const MAX_DPR = 1.75

// What three's ShaderMaterial declares ahead of the shader source.
const VERTEX_PREFIX = `precision highp float;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
attribute vec3 position;
`
const FRAGMENT_PREFIX = 'precision highp float;\n'

// three.Color converts hex from sRGB to linear before it reaches the shader; match it.
function linearRGB(hex: string): [number, number, number] {
  const channel = (i: number) => {
    const c = parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16) / 255
    return c < 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  }
  return [channel(0), channel(1), channel(2)]
}

// Column-major, as WebGL expects
function perspective(aspect: number) {
  const f = 1 / Math.tan((FOV * Math.PI) / 360)
  const nf = 1 / (NEAR - FAR)
  return new Float32Array([
    f / aspect, 0, 0, 0,
    0, f, 0, 0,
    0, 0, (FAR + NEAR) * nf, -1,
    0, 0, 2 * FAR * NEAR * nf, 0,
  ])
}

// Camera at (0, 0, 15) looking down -z; the group is scaled by `fit` and lifted by `liftY`.
function modelView(fit: number, liftY: number) {
  return new Float32Array([fit, 0, 0, 0, 0, fit, 0, 0, 0, 0, fit, 0, 0, liftY, -CAMERA_Z, 1])
}

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)!
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  return shader
}

export default function LiteParticles({ lines, className = 'absolute inset-0', scrollDissolve = false, scrollTarget, fitHeight = 0.55, offsetY = 0, onReady }: ParticleNameProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reducedMotion = usePrefersReducedMotion()
  const { scrollYProgress } = useScroll({
    target: scrollTarget ?? containerRef,
    offset: ['start start', 'end start'],
  })

  // The render loop reads these through refs so a prop change never rebuilds the GL state
  const live = useRef({ scrollDissolve, scrollYProgress, onReady })
  useEffect(() => {
    live.current = { scrollDissolve, scrollYProgress, onReady }
  })

  const linesKey = lines.join('\n')

  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return
    let disposed = false
    let teardown = () => {}

    // Particle targets are sampled from canvas text, so the display font must be loaded first
    const fontFamily = getComputedStyle(document.documentElement).getPropertyValue('--font-big-shoulders').trim() || '"Arial Narrow", sans-serif'
    const start = () => {
      if (!disposed) teardown = setup(container, canvas)
    }
    document.fonts.load(`900 100px ${fontFamily}`).then(start, start)

    function setup(container: HTMLDivElement, canvas: HTMLCanvasElement) {
      const gl = canvas.getContext('webgl', { alpha: true, antialias: false, depth: false, premultipliedAlpha: true })
      if (!gl) return () => {}

      const vs = compile(gl, gl.VERTEX_SHADER, VERTEX_PREFIX + vertexShader)
      const fs = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT_PREFIX + fragmentShader)
      const program = gl.createProgram()!
      gl.attachShader(program, vs)
      gl.attachShader(program, fs)
      gl.linkProgram(program)
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return () => {}
      gl.useProgram(program)

      const count = PARTICLE_COUNT.low
      const data = buildParticles(count, linesKey.split('\n'))
      const buffers = ([
        ['position', data.positions, 3],
        ['target', data.targets, 3],
        ['seed', data.seeds, 1],
        ['size', data.sizes, 1],
        ['isAccent', data.accents, 1],
      ] as const).map(([name, array, itemSize]) => {
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
      const loc = {
        time: u('uTime'), progress: u('uProgress'), mouse: u('uMouse'), mouseForce: u('uMouseForce'),
        mouseRadius: u('uMouseRadius'), shockOrigin: u('uShockOrigin'), shockAge: u('uShockAge'),
        scatter: u('uScatter'), pointScale: u('uPointScale'), projection: u('projectionMatrix'), modelView: u('modelViewMatrix'),
      }
      gl.uniform3fv(u('uColor'), linearRGB(color.text))
      gl.uniform3fv(u('uAccent'), linearRGB(color.accent))
      gl.uniform3f(loc.shockOrigin, 0, 0, 0)

      // three's AdditiveBlending for a non-premultiplied material, no depth writes
      gl.disable(gl.DEPTH_TEST)
      gl.enable(gl.BLEND)
      gl.blendEquation(gl.FUNC_ADD)
      gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE, gl.ONE, gl.ONE)
      gl.clearColor(0, 0, 0, 0)

      // Viewport of the z=0 plane in world units, like R3F's `viewport`, and the fit scale
      let viewW = 1
      let viewH = 1
      let fit = 1
      function resize() {
        const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)
        const { width, height } = container.getBoundingClientRect()
        canvas.width = Math.max(1, Math.round(width * dpr))
        canvas.height = Math.max(1, Math.round(height * dpr))
        gl!.viewport(0, 0, canvas.width, canvas.height)
        const aspect = width / Math.max(1, height)
        viewH = 2 * Math.tan((FOV * Math.PI) / 360) * CAMERA_Z
        viewW = viewH * aspect
        fit = Math.min(1, (viewW * 0.88) / data.textWidth, (viewH * fitHeight) / data.textHeight)
        gl!.uniformMatrix4fv(loc.projection, false, perspective(aspect))
        gl!.uniformMatrix4fv(loc.modelView, false, modelView(fit, viewH * offsetY))
        gl!.uniform1f(loc.pointScale, (height * dpr) / (2 * Math.tan((FOV * Math.PI) / 360)))
        if (!running) draw(performance.now())
      }

      // Pointer in [-1, 1] over the canvas, read from the whole page like ParticleScene's eventSource
      const pointer = { x: 0, y: 0 }
      const lastPointer = { x: 0, y: 0 }
      function onPointerMove(e: PointerEvent) {
        const rect = canvas.getBoundingClientRect()
        pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
        pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
      }

      const t0 = performance.now()
      const elapsed = (now: number) => (now - t0) / 1000
      let shockStart = -NO_SHOCK
      // A click or tap sends a shockwave ring from that point
      function onPointerDown(e: PointerEvent) {
        if (window.scrollY > window.innerHeight * 0.5) return
        const rect = canvas.getBoundingClientRect()
        const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1
        const ny = -((e.clientY - rect.top) / rect.height) * 2 + 1
        gl!.uniform3f(loc.shockOrigin, (nx * viewW) / 2 / fit, (ny * viewH) / 2 / fit, 0)
        shockStart = elapsed(performance.now())
      }

      const mouse = { x: 1e3, y: 1e3 }
      let mouseForce = 0
      let progress = reducedMotion ? 1 : 0
      let last = performance.now()
      let frame = 0
      let running = false
      let readySent = false

      function draw(now: number) {
        const delta = Math.min((now - last) / 1000, 0.1)
        last = now
        const time = elapsed(now)
        gl!.uniform1f(loc.time, time)

        // Converge over ~1.8 s; per-particle stagger lives in the shader
        if (progress < 1) progress = Math.min(1, progress + delta * 0.55)
        gl!.uniform1f(loc.progress, progress)

        const { scrollDissolve, scrollYProgress } = live.current
        if (scrollDissolve && !reducedMotion) {
          // The hero fades out by ~0.75 of its own scroll-out, so finish scattering before it goes
          gl!.uniform1f(loc.scatter, Math.min(1, Math.max(0, scrollYProgress.get() / 0.6)))
        }

        if (!reducedMotion) {
          gl!.uniform1f(loc.shockAge, time - shockStart)
          // Repulsion radius is ~12% of the viewport width, in the group's (unscaled) units
          gl!.uniform1f(loc.mouseRadius, Math.max(1.2, viewW * 0.12) / fit)
          const tx = (pointer.x * viewW) / 2 / fit
          const ty = (pointer.y * viewH) / 2 / fit
          // Frame-rate independent smoothing; snap when the pointer arrives so it never sweeps in from afar
          if (mouseForce < 0.05) {
            mouse.x = tx
            mouse.y = ty
          } else {
            const k = 1 - Math.exp(-delta * 12)
            mouse.x += (tx - mouse.x) * k
            mouse.y += (ty - mouse.y) * k
          }
          // Force rises while the pointer moves and eases off when it rests
          const moved = pointer.x !== lastPointer.x || pointer.y !== lastPointer.y
          lastPointer.x = pointer.x
          lastPointer.y = pointer.y
          mouseForce += ((moved ? 1 : 0) - mouseForce) * (1 - Math.exp(-delta * (moved ? 14 : 1.5)))
        } else {
          gl!.uniform1f(loc.shockAge, NO_SHOCK)
          gl!.uniform1f(loc.mouseRadius, 1)
        }
        gl!.uniform3f(loc.mouse, mouse.x, mouse.y, 0)
        gl!.uniform1f(loc.mouseForce, mouseForce)

        gl!.clear(gl!.COLOR_BUFFER_BIT)
        gl!.drawArrays(gl!.POINTS, 0, count)

        // Hand over from the page's heading once the name has mostly formed, not on the first
        // (still scattered) frame; this also keeps the heading painted long enough to count as LCP.
        if (!readySent && progress >= 0.5) {
          readySent = true
          live.current.onReady?.()
        }
      }

      function tick(now: number) {
        frame = requestAnimationFrame(tick)
        draw(now)
      }
      function play() {
        // Reduced motion draws a single settled frame, like frameloop="never"
        if (running || reducedMotion) return
        running = true
        last = performance.now()
        frame = requestAnimationFrame(tick)
      }
      function pause() {
        running = false
        cancelAnimationFrame(frame)
      }

      resize()
      const resizeObserver = new ResizeObserver(resize)
      resizeObserver.observe(container)
      // Pause rendering when the hero is off screen
      const visibility = new IntersectionObserver(([entry]) => (entry.isIntersecting ? play() : pause()))
      visibility.observe(container)
      window.addEventListener('pointermove', onPointerMove, { passive: true })
      if (!reducedMotion) window.addEventListener('pointerdown', onPointerDown)
      const onContextLost = (e: Event) => {
        e.preventDefault()
        pause()
      }
      canvas.addEventListener('webglcontextlost', onContextLost)

      return () => {
        pause()
        visibility.disconnect()
        resizeObserver.disconnect()
        window.removeEventListener('pointermove', onPointerMove)
        window.removeEventListener('pointerdown', onPointerDown)
        canvas.removeEventListener('webglcontextlost', onContextLost)
        buffers.forEach((buffer) => gl.deleteBuffer(buffer))
        gl.deleteProgram(program)
        gl.deleteShader(vs)
        gl.deleteShader(fs)
      }
    }

    return () => {
      disposed = true
      teardown()
    }
  }, [linesKey, fitHeight, offsetY, reducedMotion])

  return (
    <div ref={containerRef} aria-hidden="true" className={`${className} z-0 pointer-events-none`}>
      {/* No bloom pass here; a compositor-side brightness lift stands in for its glow at no per-pixel shader cost */}
      <canvas ref={canvasRef} className="block h-full w-full" style={{ filter: 'brightness(1.35)' }} />
    </div>
  )
}
