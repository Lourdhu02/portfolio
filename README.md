# Lourdhu Raju — portfolio

A white-first, monochrome portfolio built with Next.js 16 App Router, React 19, Tailwind v4 and Velite. Geist for text, Geist Mono for metadata. Static HTML, no analytics, no scroll animation. Light, dark and system themes are available in the header.

## Run locally

Use Node.js 22 and the pnpm version declared in package.json.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

## Content

- `content/truth.ts`: identity, public links, career, metrics, measurement context and source records. Update numbers here; preserve their provenance.
- `content/writing/*.mdx`: articles compiled to HTML by Velite. Drafts are excluded from public routes.
- `content/now.ts`: dated notes about current work.
- `public/me.jpg`: optional portrait. Without it, the server renders a typographic LR block.
- `public/LourdhuRaju_Resume.pdf`: résumé.
- `lib/stats.ts`: build-time GitHub and Hugging Face requests, each with a five-second timeout. Verified fallbacks and sources live in truth.ts.
- `lib/lab/model-card.json`: public synthetic OCR model measurements, re-exported through truth.ts. The lab uses a Web Worker and hand-written JS inference. It does not contain the private production pipeline.

## GitHub Pages

Select **GitHub Actions** as the repository's Pages source. `.github/workflows/deploy.yml` validates, builds, uploads `out/`, and deploys when main changes. It chooses an empty base path for an owner.github.io repository, and `/<repo>` otherwise. This repository publishes at `https://lourdhu02.github.io/portfolio/`.

```sh
# Match the project-site deployment locally (PowerShell)
$env:NEXT_PUBLIC_BASE_PATH='/portfolio'
pnpm build
```

`lib/path.ts` prefixes native links and public assets, including the worker's model URL. Canonical URLs, sitemap and robots use the same base. `.nojekyll` preserves Next's `_next` directory. Serve the exported folder with a static file server; `next start` is not used for static exports.

## Checks

```sh
pnpm lint
pnpm check:claims
pnpm build
pnpm exec tsc --noEmit
```

The claims check validates bold numeric claims in MDX against the metric registry. Source receipts explain private measurements without fabricating public links. Build output and browser audits are the evidence for performance; a Lighthouse target is not a guaranteed score on every machine.

`scripts/finish-export.mjs` removes unused Next hydration and Flight scripts from the exported HTML outside `/lab`. These pages use native document navigation (with a 150 ms CSS View Transition where supported); `public/preferences.js` enhances the server-rendered clock, theme selector and email copy button. The lab retains full React hydration. If you add another client component, update the export gate and browser checks before publishing.
