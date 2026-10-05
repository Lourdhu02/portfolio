/**
 * Fails when a post states a figure that content/truth.ts does not hold.
 *
 * Posts are Markdown, so they cannot import the numbers. Instead, every bold
 * span (**...**) that contains a number is treated as a claim, and each number
 * in it must equal a value, baseline or improvement factor in METRICS.
 * Run: node --experimental-strip-types scripts/check-claims.mjs
 */
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { METRICS, factor } from '../content/truth.ts'

const known = new Set()
for (const group of Object.values(METRICS)) {
  for (const m of Object.values(group)) {
    known.add(m.value)
    if (m.before !== undefined) {
      known.add(m.before)
      if (m.before !== 0) known.add(Math.round(factor(m)))
    }
  }
}

const dir = join(import.meta.dirname, '..', 'content', 'writing')
const failures = []
for (const file of readdirSync(dir).filter((f) => f.endsWith('.mdx'))) {
  const body = readFileSync(join(dir, file), 'utf8').split(/^---$/m).slice(2).join('---')
  for (const [, span] of body.matchAll(/\*\*([^*]+)\*\*/g)) {
    for (const [raw] of span.matchAll(/(?<![\w.])\d[\d,]*(?:\.\d+)?/g)) {
      const n = Number(raw.replace(/,/g, ''))
      if (!known.has(n)) failures.push(`${file}: "**${span}**" states ${raw}, which is not in content/truth.ts`)
    }
  }
}

if (failures.length) {
  console.error(failures.join('\n'))
  process.exit(1)
}
console.log('Every bold figure in content/writing is backed by content/truth.ts.')
