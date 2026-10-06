import { TRUTH } from '@/content/truth'

export type CommandAction = 'copy-email' | 'toggle-jinx' | 'toggle-theme'

export interface CommandDef {
  id: string
  label: string
  group: 'Navigate' | 'Work' | 'Lab' | 'Writing' | 'Actions' | 'Elsewhere'
  hint?: string
  keywords?: string[]
  // Key sequence shown beside the item, e.g. ['g', 'w']
  shortcut?: string[]
  href?: string
  external?: boolean
  action?: CommandAction
}

export interface PostSummary {
  slug: string
  title: string
}

const { links, email } = TRUTH.identity

// `g` then a letter jumps straight to a page; the palette shows the same keys.
export const GO_SHORTCUTS: Record<string, { href: string; label: string }> = {
  h: { href: '/', label: 'Home' },
  w: { href: '/#work', label: 'Work' },
  l: { href: '/lab', label: 'Lab' },
  r: { href: '/writing', label: 'Writing' },
  a: { href: '/about', label: 'About' },
}

export const COMMANDS: CommandDef[] = [
  ...Object.entries(GO_SHORTCUTS).map(([key, { href, label }]) => ({
    id: `go-${key}`,
    label,
    group: 'Navigate' as const,
    href,
    shortcut: ['g', key],
  })),

  { id: 'work-meter-ocr', label: 'Meter OCR', group: 'Work', hint: 'Flagship pipeline', href: '/work/meter-ocr', keywords: ['tensorrt', 'triton', 'ocr', 'yolo'] },
  { id: 'work-svtrv2-ard', label: 'SVTRv2-ARD', group: 'Work', hint: 'Research', href: '/work/svtrv2-ard', keywords: ['attention', 'sdpa', 'training'] },
  { id: 'work-echome', label: 'ECHOME', group: 'Work', hint: 'Local-first agent', href: '/work/echome', keywords: ['langgraph', 'qdrant', 'memory'] },
  { id: 'work-finsentinel', label: 'FinSentinelAI', group: 'Work', hint: 'Private RAG', href: '/work/finsentinel', keywords: ['rag', 'bm25', 'ollama'] },

  { id: 'lab-ocr', label: 'Read the meter yourself', group: 'Lab', hint: 'Live CTC model', href: '/lab', keywords: ['demo', 'ocr', 'ctc', 'model', 'benchmark'] },
  { id: 'lab-pipeline', label: 'Pipeline diagram', group: 'Lab', hint: 'Interactive', href: '/work/meter-ocr', keywords: ['diagram', 'architecture'] },

  { id: 'copy-email', label: 'Copy email address', group: 'Actions', hint: email, action: 'copy-email', keywords: ['contact', 'mail', 'hire'] },
  { id: 'resume', label: 'Open résumé (PDF)', group: 'Actions', href: links.resume, external: true, keywords: ['cv', 'resume'] },
  { id: 'theme', label: 'Switch light / dark theme', group: 'Actions', action: 'toggle-theme', keywords: ['theme', 'light', 'dark', 'mode'] },
  { id: 'jinx', label: 'Toggle Jinx mode', group: 'Actions', hint: 'or type “jinx”', action: 'toggle-jinx', keywords: ['theme', 'easter egg', 'pink'] },

  { id: 'github', label: 'GitHub', group: 'Elsewhere', href: links.github, external: true },
  { id: 'linkedin', label: 'LinkedIn', group: 'Elsewhere', href: links.linkedin, external: true },
  { id: 'kaggle', label: 'Kaggle', group: 'Elsewhere', href: links.kaggle, external: true },
  { id: 'studio', label: 'spacedrift.in', group: 'Elsewhere', href: links.studio, external: true, keywords: ['studio'] },
  { id: 'preprint', label: 'PhilArchive preprint', group: 'Elsewhere', href: links.preprint, external: true, keywords: ['paper'] },
]

export function postCommands(posts: PostSummary[]): CommandDef[] {
  return posts.map((p) => ({ id: `post-${p.slug}`, label: p.title, group: 'Writing', href: `/writing/${p.slug}` }))
}
