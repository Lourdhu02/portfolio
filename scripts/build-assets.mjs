import { createRequire } from 'node:module'
import { readFileSync } from 'node:fs'
import { TRUTH } from '../content/truth.ts'
const require = createRequire(import.meta.url)
const sharp = createRequire(require.resolve('next/package.json'))('sharp')
const css = readFileSync('app/globals.css', 'utf8')
const paper = css.match(/--color-paper:\s*(#[\da-f]+)/i)[1]
const ink = css.match(/--color-ink:\s*(#[\da-f]+)/i)[1]
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="${paper}"/><g fill="${ink}" font-family="Arial,sans-serif"><text x="72" y="110" font-size="24">Bengaluru, India</text><text x="66" y="330" font-size="108" letter-spacing="-7">${TRUTH.identity.name}</text><text x="72" y="394" font-size="30">${TRUTH.identity.role}</text><text x="72" y="550" font-size="24">Vision models. Production discipline.</text></g></svg>`
await sharp(Buffer.from(svg)).png().toFile('public/og.png')
