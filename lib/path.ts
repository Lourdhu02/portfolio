export const basePath = (process.env.NEXT_PUBLIC_BASE_PATH || '').replace(/\/$/, '')
/** Prefix native links and public assets for GitHub Pages project sites. */
export function withBase(path: string): string {
  if (!path.startsWith('/') || path.startsWith('//')) return path
  if (basePath && (path === basePath || path.startsWith(`${basePath}/`))) return path
  return `${basePath}${path}`
}
