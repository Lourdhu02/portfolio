import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
// Native links and server-rendered controls need no React hydration. Keep the
// complete Next runtime on /lab, which owns the only React interactions.
// Do not run this on pages with other client components without updating the gate.
for (const entry of readdirSync('out', { recursive: true, withFileTypes: true })) {
  if (!entry.isFile() || !entry.name.endsWith('.html')) continue
  const file = join(entry.parentPath, entry.name)
  if (relative('out', file).split(sep)[0] === 'lab') continue
  const html = readFileSync(file, 'utf8')
    .replace(/<link\b[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g, (_, href) => {
      const asset = href.slice(href.indexOf('/_next/') + 1)
      const css = readFileSync(join('out', asset), 'utf8').replace(
        /url\((['"]?)(.*?)\1\)/g,
        (match, _quote, url) => {
          if (/^(data:|https?:|\/|#)/.test(url)) return match
          return `url("${new URL(url, `https://static.invalid${href}`).pathname}")`
        },
      )
      return `<style>${css}</style>`
    })
    .replace(/<script\b[^>]*\bsrc="[^"]*\/_next\/[^"]*"[^>]*><\/script>/g, '')
    .replace(/<script\b[^>]*>self\.__next_f[\s\S]*?<\/script>/g, '')
    .replace(/<link\b[^>]*\bas="script"[^>]*>/g, '')
  writeFileSync(file, html)
}
