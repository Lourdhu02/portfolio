# Second iteration — asymmetric grids and Motion

The current design uses the full available viewport width with responsive gutters, square corners, thin rules and a wider typographic scale. A large name leads into a 6/4/2 introduction; the leading projects use a 7/5 grid. Project diagrams, writing cards, profile cards and a full-width contact section give the page a varied rhythm. The mobile introduction is shorter and omits the placeholder portrait.

## Screenshots

| Width | White | Dark |
| --- | --- | --- |
| 1920 px | [Preview](screenshots/iteration-2-preview-light-1920.png) · [Full page](screenshots/iteration-2-light-1920.png) | [Preview](screenshots/iteration-2-preview-dark-1920.png) · [Full page](screenshots/iteration-2-dark-1920.png) |
| 1440 px | [Preview](screenshots/iteration-2-preview-light-1440.png) · [Full page](screenshots/iteration-2-light-1440.png) | [Preview](screenshots/iteration-2-preview-dark-1440.png) · [Full page](screenshots/iteration-2-dark-1440.png) |
| 390 px | [Preview](screenshots/iteration-2-preview-light-390.png) · [Full page](screenshots/iteration-2-light-390.png) | [Preview](screenshots/iteration-2-preview-dark-390.png) · [Full page](screenshots/iteration-2-dark-390.png) |

For comparison, the [first white layout](screenshots/after-light-1440.png) and [original cinematic layout](screenshots/before-1440.png) are preserved.

## Motion and implementation

- Motion for React handles coordinated route exit/entry, viewport reveals and card lift. Native anchors remain functional without JavaScript. Browser Back and keyboard navigation are supported.
- Reduced-motion preferences disable movement and keep all content immediately visible. Above-the-fold name and main statement are visible in the server-rendered HTML, with transform-only entrance motion.
- Pages remain statically generated for GitHub Pages. The standard Next hydration runtime is retained to support the requested animations and client navigation. The earlier sub-50-KB total-client-JavaScript restriction is superseded by this iteration's motion requirement; the current cold load transfers approximately 177 KB of compressed JavaScript in the local browser measurement.
- Next 16.3 on Windows creates nested RSC segment files where its client expects flat filenames. A small post-export script adds the expected aliases. Linux exports are already correctly named and are unchanged.
- No production metric was changed. The meter visual is explicitly labelled as a synthetic specimen. All diagrams are code-native SVG/CSS and require no image downloads.

## Verification

`pnpm lint`, `pnpm check:claims`, `pnpm build` and `pnpm exec tsc --noEmit` passed.

The [browser report](verification.json) covers home at 360, 390, 768, 1440 and 1920 px in both themes, and every public route at 360 px in both themes. There were no horizontal overflows, axe WCAG 2.1 AA findings, browser exceptions or failed resource requests in the tested flows. Hover movement, client route transitions, browser Back, reduced motion, email copy, no-JavaScript navigation, public assets and 404 were checked. The OCR lab also completed its full 264-read sweep.

The [local mobile Lighthouse report](lighthouse-iteration-2.json) scored **100 performance, 100 accessibility, 100 best practices and 100 SEO**, with 1.1 s first contentful paint, 1.7 s largest contentful paint, 10 ms total blocking time and zero cumulative layout shift. These are local measurements of the compressed production export.
