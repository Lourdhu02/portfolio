import { readdirSync, copyFileSync } from 'node:fs'
import { join, relative, sep } from 'node:path'

// Next 16.3's exporter passes Windows separators to a helper that only replaces
// forward slashes. Match the flat __next.*.txt URLs used by its client router.
// On Linux these names are already correct; no aliases are created.
const files = readdirSync('out', { recursive: true, withFileTypes: true })
for (const entry of files) {
  if (!entry.isFile() || !entry.name.endsWith('.txt')) continue
  const source = join(entry.parentPath, entry.name)
  const parts = relative('out', source).split(sep)
  const start = parts.findIndex((part) => part.startsWith('__next.'))
  if (start < 0 || start === parts.length - 1) continue
  const destination = join('out', ...parts.slice(0, start), parts.slice(start).join('.'))
  copyFileSync(source, destination)
}
