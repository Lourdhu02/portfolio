import { chromium } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs'
import assert from 'node:assert/strict'
const base = process.env.NEXT_PUBLIC_BASE_PATH || ''
const origin = 'http://localhost:3021'
mkdirSync('docs/screenshots', { recursive: true })
const browser = await chromium.launch({ channel: 'chrome', headless: true })
const report = {
  pages: [],
  screenshots: [],
  consoleErrors: [],
  networkFailures: [],
  menu: {},
}
try {
  for (const theme of ['light', 'dark'])
    for (const width of [1920, 1440, 1024, 768, 390, 360, 320]) {
      const context = await browser.newContext({
        viewport: { width, height: 1000 },
        colorScheme: 'light',
        reducedMotion: 'reduce',
        permissions: ['clipboard-read', 'clipboard-write'],
      })
      await context.addInitScript((value) => localStorage.setItem('portfolio-theme', value), theme)
      const page = await context.newPage()
      page.on('pageerror', (error) => report.consoleErrors.push(error.message))
      page.on('response', (response) => {
        if (response.status() >= 400) report.networkFailures.push(response.url())
      })
      const response = await page.goto(`${origin}${base}/`, {
        waitUntil: 'networkidle',
      })
      assert.equal(response.status(), 200)
      assert.equal(await page.locator('html').getAttribute('data-theme'), theme)
      assert.equal((await page.locator('h1').innerText()).replace(/\.$/, ''), 'Lourdhu Raju')
      assert(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        `Home overflows at ${width}`,
      )
      const violations = (
        await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
      ).violations
      assert.equal(
        violations.length,
        0,
        JSON.stringify(
          violations.map((v) => ({
            id: v.id,
            nodes: v.nodes.map((n) => n.target),
          })),
        ),
      )
      const scripts = await page
        .locator('script[src]')
        .evaluateAll((elements) => elements.map((e) => e.src))
      assert(
        scripts.some((url) => url.includes('/_next/')),
        'Motion requires the hydrated runtime',
      )
      const javascriptBytes = await page.evaluate(() =>
        performance
          .getEntriesByType('resource')
          .filter((e) => e.initiatorType === 'script')
          .reduce((sum, e) => sum + e.encodedBodySize, 0),
      )
      if (width === 1440 || width === 390 || width === 1920) {
        const file = `docs/screenshots/iteration-3-${theme}-${width}.png`
        await page.screenshot({ path: file, fullPage: true })
        await page.screenshot({
          path: `docs/screenshots/iteration-3-preview-${theme}-${width}.png`,
        })
        report.screenshots.push(file)
      }
      await page.getByRole('button', { name: 'Dark mode', exact: true }).click()
      assert.equal(
        await page.locator('html').getAttribute('data-theme'),
        theme === 'dark' ? 'light' : 'dark',
      )
      assert.equal(
        await page.locator('#theme').getAttribute('aria-pressed'),
        String(theme === 'light'),
      )
      // Repeated toggles exercise the direct button rather than a hidden select.
      await page.locator('#theme').click()
      assert.equal(await page.locator('html').getAttribute('data-theme'), theme)
      assert.equal(await page.evaluate(() => localStorage.getItem('portfolio-theme')), theme)
      assert.equal(await page.locator('a[href*="reddit"],a[href$="/lab/"]').count(), 0)
      await page.getByRole('button', { name: 'Open navigation' }).click()
      await page.waitForFunction(() => document.querySelector('#site-menu').open)
      assert.equal(await page.evaluate(() => document.body.style.overflow), 'hidden')
      const menuViolations = (
        await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
      ).violations
      assert.equal(
        menuViolations.length,
        0,
        JSON.stringify(
          menuViolations.map((v) => ({
            id: v.id,
            nodes: v.nodes.map((n) => n.target),
          })),
        ),
      )
      assert(
        await page.locator('#site-menu').evaluate((el) => el.scrollWidth <= el.clientWidth),
        `Menu overflow at ${width}`,
      )
      if (width === 1440 || width === 390) {
        await page.screenshot({
          path: `docs/screenshots/iteration-3-menu-${theme}-${width}.png`,
        })
      }
      await page.getByRole('button', { name: 'Close navigation' }).focus()
      await page.keyboard.press('Shift+Tab')
      assert.equal(
        await page.evaluate(() => document.activeElement?.textContent?.includes('Get in touch')),
        true,
      )
      await page.keyboard.press('Tab')
      assert.equal(
        await page.evaluate(() => document.activeElement?.getAttribute('aria-label')),
        'Close navigation',
      )
      await page.keyboard.press('Escape')
      await page.waitForFunction(() => !document.querySelector('#site-menu').open)
      assert.equal(
        await page.evaluate(() => document.activeElement?.getAttribute('aria-label')),
        'Open navigation',
      )
      assert.equal(await page.evaluate(() => document.body.style.overflow), '')
      if (width === 1440 && theme === 'light') {
        await page.getByRole('button', { name: 'Copy email' }).click()
        assert.equal(
          await page.evaluate(() => navigator.clipboard.readText()),
          'b.lourdhuraju1234@gmail.com',
        )
        assert.equal(await page.getByRole('button', { name: 'Copied' }).innerText(), 'Copied')
      }
      report.pages.push({
        path: '/',
        theme,
        width,
        accessibility: 'passed',
        overflow: false,
        scripts,
        javascriptBytes,
      })
      await context.close()
    }
  const context = await browser.newContext({
    viewport: { width: 360, height: 900 },
    reducedMotion: 'reduce',
  })
  const page = await context.newPage()
  page.on('pageerror', (error) => report.consoleErrors.push(error.message))
  page.on('response', (response) => {
    if (response.status() >= 400) report.networkFailures.push(response.url())
  })
  const paths = [...readFileSync('out/sitemap.xml', 'utf8').matchAll(/<loc>(.*?)<\/loc>/g)].map(
    (m) => new URL(m[1]).pathname,
  )
  for (const path of paths) {
    const response = await page.goto(origin + path, {
      waitUntil: 'networkidle',
    })
    assert.equal(response.status(), 200, path)
    if ((await page.locator('html').getAttribute('data-theme')) !== 'light')
      await page.locator('#theme').click()
    assert(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      `Overflow: ${path}`,
    )
    const violations = (
      await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
    ).violations
    assert.equal(
      violations.length,
      0,
      `${path}: ${JSON.stringify(violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })))}`,
    )
    report.pages.push({ path, width: 360, accessibility: 'passed' })
    if ((await page.locator('html').getAttribute('data-theme')) !== 'dark')
      await page.locator('#theme').click()
    const darkViolations = (
      await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
    ).violations
    assert.equal(
      darkViolations.length,
      0,
      `${path} dark: ${JSON.stringify(darkViolations.map((v) => v.id))}`,
    )
    report.pages.push({
      path,
      width: 360,
      theme: 'dark',
      accessibility: 'passed',
    })
  }
  assert(!paths.some((path) => path.includes('/lab/')))
  for (const removed of ['/lab/', '/lab/meter-ctc.bin', '/lab/worker.js']) {
    assert.equal((await page.request.get(origin + base + removed)).status(), 404)
  }
  for (const asset of [
    '/LourdhuRaju_Resume.pdf',
    '/og.png',
    '/icon.svg',
    '/robots.txt',
    '/sitemap.xml',
  ])
    assert.equal((await page.request.get(origin + base + asset)).status(), 200, asset)
  report.motionRuntimeEnabled = true
  const noJs = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 900 },
  })
  const staticPage = await noJs.newPage()
  await staticPage.goto(`${origin}${base}/`)
  assert.equal((await staticPage.locator('h1').innerText()).replace(/\.$/, ''), 'Lourdhu Raju')
  await staticPage.getByRole('link', { name: 'About', exact: true }).click()
  assert((await staticPage.locator('h1').innerText()).includes('About'))
  report.withoutJavaScript = 'content and navigation passed'
  assert.equal((await page.request.get(`${origin}${base}/missing-page/`)).status(), 404)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  assert.equal(
    await page
      .locator('.menu-glyph i')
      .first()
      .evaluate((el) => getComputedStyle(el).transitionDuration),
    '0s',
  )
  const animated = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: 'no-preference',
  })
  const animatedPage = await animated.newPage()
  animatedPage.on('pageerror', (error) => report.consoleErrors.push(error.message))
  animatedPage.on('response', (response) => {
    if (response.status() >= 400) report.networkFailures.push(response.url())
  })
  await animatedPage.goto(`${origin}${base}/`, { waitUntil: 'networkidle' })
  await animatedPage.locator('#theme').click()
  await animatedPage.reload({ waitUntil: 'networkidle' })
  assert.equal(await animatedPage.locator('html').getAttribute('data-theme'), 'dark')
  assert.equal(await animatedPage.locator('#theme').getAttribute('aria-pressed'), 'true')
  await animatedPage.getByRole('button', { name: 'Open navigation' }).click()
  await animatedPage.getByRole('link', { name: /03 About/ }).click()
  await animatedPage.waitForURL('**/about/')
  await animatedPage.waitForFunction(() => !document.querySelector('#site-menu').open)
  assert.equal(await animatedPage.locator('html').getAttribute('data-theme'), 'dark')
  await animatedPage.locator('#theme').click()
  assert.equal(await animatedPage.locator('html').getAttribute('data-theme'), 'light')
  await animatedPage.getByRole('button', { name: 'Open navigation' }).click()
  await animatedPage.getByRole('link', { name: /01 Selected work/ }).click()
  await animatedPage.waitForURL('**/#work')
  await animatedPage.waitForFunction(() => !document.querySelector('#site-menu').open)
  await animatedPage.getByRole('button', { name: 'Open navigation' }).click()
  await animatedPage.getByRole('link', { name: /05 Get in touch/ }).click()
  await animatedPage.waitForURL('**/#contact')
  await animatedPage.waitForFunction(() => !document.querySelector('#site-menu').open)
  await animatedPage.goto(`${origin}${base}/`, { waitUntil: 'networkidle' })
  report.menu = {
    keyboardTrap: 'passed',
    escape: 'passed',
    focusRestore: 'passed',
    scrollLock: 'passed',
    routeAndHashNavigation: 'passed',
    themeAfterNavigation: 'passed',
    themeAfterReload: 'passed',
    mobileAndDesktopAxe: 'passed',
  }
  await animatedPage.waitForFunction(
    () => getComputedStyle(document.querySelector('[data-page-stage]')).opacity === '1',
  )
  await animatedPage.evaluate(() => {
    window.__portfolioNavigationMarker = 'same-document'
  })
  await animatedPage.locator('.featured-card').hover()
  await animatedPage.waitForFunction(
    () => getComputedStyle(document.querySelector('.featured-card')).transform !== 'none',
  )
  await animatedPage.getByRole('link', { name: 'View Meter OCR', exact: true }).click()
  await animatedPage.waitForURL('**/work/meter-ocr/')
  await animatedPage.waitForFunction(
    () => getComputedStyle(document.querySelector('[data-page-stage]')).opacity === '1',
  )
  assert.equal(await animatedPage.locator('h1').innerText(), 'Meter OCR')
  assert.equal(
    await animatedPage.evaluate(() => window.__portfolioNavigationMarker),
    'same-document',
  )
  await animatedPage.goBack()
  await animatedPage.waitForURL(`${origin}${base}/`)
  await animatedPage.waitForFunction(
    () => getComputedStyle(document.querySelector('[data-page-stage]')).opacity === '1',
  )
  report.motion = {
    cardHover: 'passed',
    routeExitEnter: 'passed',
    clientNavigation: 'passed',
    browserBack: 'passed',
    reducedMotion: 'passed',
  }
  assert.equal(report.consoleErrors.length, 0, report.consoleErrors.join('\n'))
  assert.equal(report.networkFailures.length, 0, report.networkFailures.join('\n'))
  console.log(JSON.stringify({ pagesChecked: report.pages.length, consoleErrors: report.consoleErrors, networkFailures: report.networkFailures, menu: report.menu, motion: report.motion }, null, 2))
} finally {
  writeFileSync('docs/verification.json', JSON.stringify(report, null, 2))
  await browser.close()
}
