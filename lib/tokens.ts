// Design tokens shared by Motion and three.js. CSS colours live in app/globals.css @theme;
// keep the two in sync.

export const color = {
  bg: '#050507',
  surface: '#0B0B0F',
  raised: '#111117',
  line: '#1C1C22',
  text: '#EDEDF0',
  muted: '#8A8A96',
  accent: '#FF4655',
  accentDim: '#8C1D27',
  detect: '#2DE2E6',
  success: '#3DDC97',
  jinx: '#FF4FA3',
} as const

// Durations in seconds (Motion's unit)
export const duration = {
  micro: 0.14,
  ui: 0.26,
  reveal: 0.7,
  hero: 2.4,
} as const

export const ease = {
  out: [0.22, 1, 0.36, 1],
  inOut: [0.65, 0, 0.35, 1],
} as const

export const spring = {
  ui: { stiffness: 320, damping: 30 },
  magnetic: { stiffness: 140, damping: 18 },
} as const
