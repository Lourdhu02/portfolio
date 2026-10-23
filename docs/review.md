# First iteration design review (historical)

The current design and audit results are documented in [the second iteration review](iteration-2.md). The measurements and screenshots below describe the earlier static index layout.

White is the default on a new visit. The header also offers dark and system themes. The layout uses paper, ink, rules and Geist typography throughout the home, writing, case studies, About, Now and OCR lab pages.

## Screenshots

The original site only offered a dark theme. Before screenshots preserve that original appearance.

| Viewport | Before | White theme | Dark theme |
| --- | --- | --- | --- |
| 1440 px | [Original](screenshots/before-1440.png) | [Preview](screenshots/preview-light-1440.png) · [Full page](screenshots/after-light-1440.png) | [Preview](screenshots/preview-dark-1440.png) · [Full page](screenshots/after-dark-1440.png) |
| 390 px | [Original](screenshots/before-390.png) | [Preview](screenshots/preview-light-390.png) · [Full page](screenshots/after-light-390.png) | [Preview](screenshots/preview-dark-390.png) · [Full page](screenshots/after-dark-390.png) |

## Verification

- `pnpm lint`, `pnpm check:claims`, `pnpm build` and `pnpm exec tsc --noEmit` passed.
- [Local mobile Lighthouse report](lighthouse.json): performance 100, accessibility 100, best practices 100, SEO 100. Audited against the compressed static export, not a dev server.
- [Browser report](verification.json): every public route checked at 360 px in both themes; home additionally checked at 390 px and 1440 px. No horizontal overflow, axe WCAG 2.1 AA findings, browser exceptions or failed resource requests in the tested flows.
- Theme choices, email copying, native navigation without JavaScript, reduced motion, résumé, model, worker, OG image, favicon, sitemap, robots and 404 checked under `/portfolio`.
- The lab loaded the model, accepted edited readings, generated a new meter, started and cancelled a sweep, completed a fresh 264-read sweep with eleven plotted points, and accepted keyboard slider input.
- Non-lab external JavaScript: 1,363 uncompressed bytes, plus a small inline theme initialization script. No Next hydration is loaded on those pages. The lab retains React.

## Deployment

The Pages workflow builds `out/` with a repository-derived base path and deploys on changes to main. Set the repository's Pages source to GitHub Actions before merging. The PR does not change the live site or merge itself.

## Maintenance notes

`scripts/finish-export.mjs` deliberately removes unused hydration from pages outside `/lab` and inlines their CSS with rebased font URLs. If another route gains a React client component, update that gate and the browser verification. The optional portrait is absent, so the server renders the initials block. Existing production metrics are preserved; public profile snapshots are separately sourced.
