// Design tokens for Motion and canvas code. CSS colours live in app/globals.css @theme;
// keep the two in sync.

export const color = {
  bg: '#000000',
  surface: '#0A0A0A',
  raised: '#121212',
  line: '#222222',
  text: '#FFFFFF',
  muted: '#8C8C8C',
  accent: '#8B5CF6',
  accentDim: '#3B2470',
  detect: '#FFFFFF',
  success: '#8B5CF6',
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
  expo: [0.16, 1, 0.3, 1],
} as const

export const spring = {
  ui: { stiffness: 320, damping: 30 },
  magnetic: { stiffness: 140, damping: 18 },
  scroll: { stiffness: 220, damping: 40, restDelta: 0.0005 },
} as const
