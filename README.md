# Lourdhu Raju — portfolio

A white-first portfolio with a restrained cobalt accent, built with Next.js 16 App Router, React 19, Tailwind v4, Motion for React and Velite. Full-width asymmetric grids, square project cards, custom SVG diagrams and an animated full-screen index. The header button switches directly between light and dark, and remembers the preference.

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

## GitHub Pages

Select **GitHub Actions** as the repository's Pages source. `.github/workflows/deploy.yml` validates, builds, uploads `out/`, and deploys when main changes. It chooses an empty base path for an owner.github.io repository, and `/<repo>` otherwise. This repository publishes at `https://lourdhu02.github.io/portfolio/`.

```sh
# Match the project-site deployment locally (PowerShell)
$env:NEXT_PUBLIC_BASE_PATH='/portfolio'
pnpm build
```

`lib/path.ts` prefixes native links and public assets. Canonical URLs, sitemap and robots use the same base. `.nojekyll` preserves Next's `_next` directory. Serve the exported folder with a static file server; `next start` is not used for static exports.

## Checks

```sh
pnpm lint
pnpm check:claims
pnpm build
pnpm exec tsc --noEmit
```

The claims check validates bold numeric claims in MDX against the metric registry. Source receipts explain private measurements without fabricating public links. Build output and browser audits are the evidence for performance; a Lighthouse target is not a guaranteed score on every machine.

`components/MotionSystem.tsx` provides shared route exit/entry, viewport reveals, spring card interactions and reading progress. Internal links retain native anchor fallbacks and use Next client navigation after an exit animation. Content is pre-rendered to static HTML. `prefers-reduced-motion` disables movement, and noscript fallbacks retain content and navigation. `components/Navigation.tsx` uses a native modal dialog for focus containment, Escape dismissal and an inert background. Its cobalt shutters and numbered links animate with Motion. `components/ThemeToggle.tsx` owns theme interaction, observes the prepaint theme and synchronizes across tabs; `public/preferences.js` only handles the clock and email copying.

`scripts/fix-export-paths.mjs` creates flat RSC segment filename aliases on Windows for the URLs expected by Next 16.3's client router; Linux exports are unchanged. This is covered by browser navigation and failed-request checks.

To review the production export locally, run `pnpm start` with the same `NEXT_PUBLIC_BASE_PATH` used to build, then run `pnpm verify` in another terminal. The browser checks require Chrome and cover 320–1920px layouts, both themes, reduced motion, routing, menu focus/scroll behavior, theme persistence and accessibility. The Lab route, inference model, training code and public assets have been removed; the verification suite asserts their former URLs return 404.

Current screenshots are in `docs/screenshots/iteration-3-*`; current browser results are in `docs/verification.json`. Earlier iteration reviews are historical records.
