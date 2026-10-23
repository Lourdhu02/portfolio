# Iteration 3 — Cobalt and the animated index

The third iteration retains the square cards and asymmetric grid, introduces one cobalt accent, and replaces the header navigation with a full-screen numbered index. The seven bars in the blue panel reveal in sequence and change composition as links receive hover or keyboard focus. The mobile version puts the links first and compacts the graphic beneath them.

The direct theme button replaces the invisible select. React owns its events and observes the applied document theme, including the prepaint preference, cross-tab storage updates and an existing system preference. Clicking selects light or dark explicitly. Denied local storage does not prevent switching for the current visit.

The menu uses a native modal dialog: background content becomes inert, focus stays inside, Escape closes it, the page cannot scroll underneath, and focus returns to the trigger. Route and hash links close the menu. Reduced-motion users get immediate transitions; navigation and content have a no-JavaScript fallback.

Lab has been removed completely: page, components, model/inference implementation, training scripts, public weights and generated worker, sitemap entry, promotion card and case-study link. The unused esbuild development dependency is removed. Deleted source is recoverable through Git history. Reddit is removed from the profile cards, footer, identity data, JSON-LD and rel=me links. Historical review files describe older iterations only.

Additional refinements: sticky compact header, cobalt reading progress, spring card movement, consistent focus/hover accents, shorter mobile hero, and a rebalanced eight-profile grid. No rounded card corners or additional chromatic accents.

## Verification

- Lint, claims validation, production static build and TypeScript pass.
- Browser suite covers 320, 360, 390, 768, 1024, 1440 and 1920px in both themes, plus every public route on mobile. Zero horizontal overflow, automated WCAG A/AA findings, console errors or failed requests.
- Menu focus containment, Escape, focus return, scroll locking, animated navigation, browser back, reduced motion, theme switching after navigation and persistence after reload pass.
- Additional targeted checks pass for 844×390 landscape, actual hash target placement, cross-tab theme synchronization and switching when local storage throws.
- Removed Lab page, model and worker URLs return 404.
- Local mobile Lighthouse: performance 97, accessibility 100, best practices 100, SEO 100; LCP 2.6s, TBT 10ms, CLS 0. The full report is `lighthouse-iteration-3.json`. Scores vary by machine and run.
- Initial compressed JavaScript is approximately 183KB with the animated navigation and hydrated Next runtime.

Desktop and mobile screenshots, including the open menu, are in `screenshots/iteration-3-*`. Browser evidence is in `verification.json`.
