"use client"
import { useEffect } from 'react'

// Liquid Glass for every .glass panel, after Apple's iOS 26 material and kube.io's web recreation
// (https://kube.io/blog/liquid-glass-css-svg/). The centre of a panel stays clear; light bends in
// a rim along its edges, the way a slab of glass with a rounded-off (squircle) bezel would bend it.
//
// For each panel size we ray-trace one bezel profile with Snell's law (air → glass, n = 1.5),
// encode the per-pixel offsets in a displacement map (R = x, G = y, 128 = no shift) and build an
// SVG filter: displace the backdrop, split it slightly per colour channel at the rim, then lay a
// specular rim light on top. The filter is applied with backdrop-filter: url(), which only
// Chromium supports, so this runs only under html.glass-lens; elsewhere .glass keeps its blur.
//
// A cursor-following glint on the edge (CSS, every browser) is driven from here as well.

const N_GLASS = 1.5
const SAMPLES = 96
const SVG_NS = 'http://www.w3.org/2000/svg'

// Convex squircle height: flat in the middle, rolling off smoothly to the edge (x: 0 edge → 1 inside)
const height = (x: number) => Math.pow(1 - Math.pow(1 - x, 4), 0.25)

// Lateral shift, in units of the bezel width, for a ray that enters the bezel at x
function profile() {
  const out = new Float32Array(SAMPLES)
  const thickness = 0.6 // glass height at the flat part, relative to the bezel width
  for (let i = 0; i < SAMPLES; i++) {
    const x = (i + 0.5) / SAMPLES
    const dx = 0.5 / SAMPLES
    const slope = ((height(Math.min(1, x + dx)) - height(Math.max(0, x - dx))) / (2 * dx)) * thickness
    const t1 = Math.atan(slope) // angle between the vertical view ray and the surface normal
    const t2 = Math.asin(Math.sin(t1) / N_GLASS)
    out[i] = Math.tan(t1 - t2) * (height(x) * thickness + 0.25)
  }
  return out
}
const PROFILE = profile()
const PROFILE_MAX = PROFILE.reduce((m, v) => Math.max(m, v), 0)
const shift = (d: number, bezel: number) => (d >= bezel ? 0 : PROFILE[Math.min(SAMPLES - 1, Math.floor((d / bezel) * SAMPLES))] / PROFILE_MAX)
// Rim light: a thin bright line hugging the edge, gone by a third of the way into the bezel
const rim = (d: number, bezel: number) => (d >= bezel * 0.35 ? 0 : Math.pow(1 - d / (bezel * 0.35), 2.2))

function buildMaps(w: number, h: number, bezel: number) {
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!
  const disp = ctx.createImageData(w, h)
  const spec = ctx.createImageData(w, h)
  const sx = new Float32Array(w), rx = new Float32Array(w)
  const sy = new Float32Array(h), ry = new Float32Array(h)
  for (let x = 0; x < w; x++) { sx[x] = shift(x, bezel) - shift(w - 1 - x, bezel); rx[x] = rim(w - 1 - x, bezel) - rim(x, bezel) }
  for (let y = 0; y < h; y++) { sy[y] = shift(y, bezel) - shift(h - 1 - y, bezel); ry[y] = rim(h - 1 - y, bezel) - rim(y, bezel) }
  // Light from the upper left; the opposite rim catches a weaker bounce, as on iOS
  const lx = -0.55, ly = -0.83
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4
      disp.data[i] = 128 + Math.max(-1, Math.min(1, sx[x])) * 127
      disp.data[i + 1] = 128 + Math.max(-1, Math.min(1, sy[y])) * 127
      disp.data[i + 2] = 128
      disp.data[i + 3] = 255
      const nx = rx[x], ny = ry[y]
      const facing = nx * lx + ny * ly
      const a = Math.max(0, facing) * 0.6 + Math.max(0, -facing) * 0.22 + Math.hypot(nx, ny) * 0.03
      spec.data[i] = spec.data[i + 1] = spec.data[i + 2] = 255
      spec.data[i + 3] = Math.min(255, a * 255)
    }
  }
  ctx.putImageData(disp, 0, 0)
  const dispUrl = canvas.toDataURL()
  ctx.putImageData(spec, 0, 0)
  const specUrl = canvas.toDataURL()
  return { dispUrl, specUrl }
}

function el<K extends keyof SVGElementTagNameMap>(name: K, attrs: Record<string, string | number>, parent?: Element) {
  const node = document.createElementNS(SVG_NS, name)
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, String(v))
  parent?.appendChild(node)
  return node
}

function buildFilter(defs: SVGDefsElement, id: string, w: number, h: number, bezel: number) {
  const { dispUrl, specUrl } = buildMaps(w, h, bezel)
  const scale = Math.round(bezel * 1.1)
  const f = el('filter', { id, x: 0, y: 0, width: w, height: h, filterUnits: 'userSpaceOnUse', 'color-interpolation-filters': 'sRGB' }, defs)
  el('feImage', { href: dispUrl, x: 0, y: 0, width: w, height: h, preserveAspectRatio: 'none', result: 'map' }, f)
  // One displacement per colour channel, a touch apart: a faint prism fringe at the rim
  ;([['r', 1.08, '1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0'], ['g', 1, '0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0'], ['b', 0.92, '0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0']] as const).forEach(([c, k, m]) => {
    el('feDisplacementMap', { in: 'SourceGraphic', in2: 'map', scale: Math.round(scale * k), xChannelSelector: 'R', yChannelSelector: 'G', result: `d${c}` }, f)
    el('feColorMatrix', { in: `d${c}`, type: 'matrix', values: m, result: c }, f)
  })
  el('feComposite', { in: 'r', in2: 'g', operator: 'arithmetic', k2: 1, k3: 1, result: 'rg' }, f)
  el('feComposite', { in: 'rg', in2: 'b', operator: 'arithmetic', k2: 1, k3: 1, result: 'bent' }, f)
  el('feImage', { href: specUrl, x: 0, y: 0, width: w, height: h, preserveAspectRatio: 'none', result: 'spec' }, f)
  el('feComposite', { in: 'spec', in2: 'bent', operator: 'over' }, f)
}

export function LiquidGlass() {
  useEffect(() => {
    const root = document.documentElement
    const lens = root.classList.contains('glass-lens') && !matchMedia('(prefers-reduced-transparency: reduce)').matches
    const fine = matchMedia('(hover: hover) and (pointer: fine)').matches

    const svg = el('svg', { width: 0, height: 0, 'aria-hidden': 'true', style: 'position:absolute' })
    const defs = el('defs', {}, svg)
    document.body.appendChild(svg)
    const built = new Set<string>()
    const seen = new WeakSet<Element>()

    // Map building is a few ms of pixel work per new panel size, so it waits for idle time
    const queue = new Map<HTMLElement, [number, number]>()
    let idle = 0
    const ric = (cb: () => void) => (typeof requestIdleCallback === 'function' ? requestIdleCallback(cb, { timeout: 1500 }) : setTimeout(cb, 200) as unknown as number)
    const flush = () => {
      idle = 0
      for (const [t, [w, h]] of queue) {
        const bezel = Math.max(8, Math.min(26, Math.floor(Math.min(w, h) / 3)))
        const id = `lg-${w}x${h}`
        if (!built.has(id)) { buildFilter(defs, id, w, h, bezel); built.add(id) }
        t.style.setProperty('--lg', `url(#${id})`)
      }
      queue.clear()
    }
    const resize = lens ? new ResizeObserver((entries) => {
      for (const e of entries) {
        const t = e.target as HTMLElement
        const box = e.borderBoxSize?.[0]
        const w = Math.round(box ? box.inlineSize : t.offsetWidth)
        const h = Math.round(box ? box.blockSize : t.offsetHeight)
        if (w < 8 || h < 8) continue
        queue.set(t, [w, h])
      }
      if (queue.size && !idle) idle = ric(flush)
    }) : null

    const panels: HTMLElement[] = []
    const scan = () => {
      document.querySelectorAll<HTMLElement>('.glass').forEach((p) => {
        if (seen.has(p)) return
        seen.add(p)
        panels.push(p)
        resize?.observe(p)
      })
      for (let i = panels.length - 1; i >= 0; i--) if (!panels[i].isConnected) { resize?.unobserve(panels[i]); panels.splice(i, 1) }
    }
    scan()
    let pending = 0
    const mo = new MutationObserver(() => { if (!pending) pending = requestAnimationFrame(() => { pending = 0; scan() }) })
    mo.observe(document.body, { childList: true, subtree: true })

    // Edge glint that follows the cursor across every panel near it
    let frame = 0, px = 0, py = 0
    const glint = () => {
      frame = 0
      for (const p of panels) {
        const r = p.getBoundingClientRect()
        if (r.bottom < -200 || r.top > innerHeight + 200) continue
        p.style.setProperty('--gx', `${px - r.left}px`)
        p.style.setProperty('--gy', `${py - r.top}px`)
      }
    }
    const onMove = (e: PointerEvent) => { px = e.clientX; py = e.clientY; if (!frame) frame = requestAnimationFrame(glint) }
    if (fine) window.addEventListener('pointermove', onMove, { passive: true })

    return () => {
      mo.disconnect()
      resize?.disconnect()
      cancelAnimationFrame(frame)
      cancelAnimationFrame(pending)
      window.removeEventListener('pointermove', onMove)
      svg.remove()
    }
  }, [])
  return null
}
