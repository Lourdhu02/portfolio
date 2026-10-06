export type BotKind = 'cat' | 'dog' | 'hamster' | 'parrot'

export interface Bot {
  name: string
  kind: BotKind
  // Short model line shown above the name, e.g. "Scanner unit"
  model: string
  // One line on what the robot does for its project, in its own voice
  job: string
  // The robot's signature glow
  glow: string
  project: { id: string; title: string; href: string; summary: string; tags: string[] }
}

// Where each robot stands on the shared stage, in scene units. The layout is deliberately
// uneven (heights and depths differ) so the camera path between them has some life.
export const STAGE_SPOTS: [number, number, number][] = [
  [-15, 0, 0],
  [-5, 0.5, -2.5],
  [5.2, -0.4, 0.6],
  [15.4, 0.7, -1.6],
]
