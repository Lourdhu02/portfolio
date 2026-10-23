import { cache } from 'react'
import { SOCIAL_FALLBACK } from '@/content/truth'
async function getJson(url: string) {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(5000),
    headers: { 'User-Agent': 'lourdhu-portfolio', Accept: 'application/json' },
    cache: 'force-cache',
  })
  if (!response.ok) throw new Error(`Stats request: ${response.status}`)
  return response.json()
}
/** Build-only; failed requests use the last verified snapshot. */
export const getStats = cache(async () => {
  const [github, huggingface] = await Promise.allSettled([
    getJson('https://api.github.com/users/Lourdhu02'),
    getJson('https://huggingface.co/api/models?author=lourdhu02'),
  ])
  const g = github.status === 'fulfilled' ? github.value : null
  const h = huggingface.status === 'fulfilled' ? huggingface.value : null
  return {
    repos: typeof g?.public_repos === 'number' ? g.public_repos : SOCIAL_FALLBACK.repos,
    followers: typeof g?.followers === 'number' ? g.followers : SOCIAL_FALLBACK.followers,
    models: Array.isArray(h) ? h.length : SOCIAL_FALLBACK.models,
    githubFallback: !g,
    huggingfaceFallback: !Array.isArray(h),
  }
})
