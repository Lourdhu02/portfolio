import { chromium } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs'
import assert from 'node:assert/strict'
const base = process.env.NEXT_PUBLIC_BASE_PATH || ''
const origin = 'http://localhost:3021'
mkdirSync('docs/screenshots', { recursive: true })
const browser = await chromium.launch({ channel: 'chrome', headless: true })
const report = { pages: [], screenshots: [], consoleErrors: [], networkFailures: [], lab: {} }
try {
  for (const theme of ['light', 'dark'])
    for (const width of [1920, 1440, 768, 390, 360]) {
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
      const response = await page.goto(`${origin}${base}/`, { waitUntil: 'networkidle' })
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
        JSON.stringify(violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) }))),
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
        const file = `docs/screenshots/iteration-2-${theme}-${width}.png`
        await page.screenshot({ path: file, fullPage: true })
        await page.screenshot({
          path: `docs/screenshots/iteration-2-preview-${theme}-${width}.png`,
        })
        report.screenshots.push(file)
      }
      await page.locator('#theme').selectOption(theme === 'dark' ? 'light' : 'dark')
      assert.equal(
        await page.locator('html').getAttribute('data-theme'),
        theme === 'dark' ? 'light' : 'dark',
      )
      await page.locator('#theme').selectOption('system')
      assert.equal(await page.locator('html').getAttribute('data-theme'), null)
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
    const response = await page.goto(origin + path, { waitUntil: 'networkidle' })
    assert.equal(response.status(), 200, path)
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
    await page.locator('#theme').selectOption('dark')
    const darkViolations = (
      await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
    ).violations
    assert.equal(
      darkViolations.length,
      0,
      `${path} dark: ${JSON.stringify(darkViolations.map((v) => v.id))}`,
    )
    report.pages.push({ path, width: 360, theme: 'dark', accessibility: 'passed' })
  }
  await page.goto(`${origin}${base}/lab/`, { waitUntil: 'networkidle' })
  await page.getByText('Model live on your device', { exact: true }).waitFor({ timeout: 30000 })
  await page.getByLabel('Reading on the meter').fill('4777.1')
  await page.waitForFunction(() =>
    document.querySelector('canvas[role="img"]')?.getAttribute('aria-label')?.includes('4777.1'),
  )
  await page.getByRole('button', { name: 'New meter', exact: true }).click()
  await page.getByRole('button', { name: 'Run 264 reads on this device' }).click()
  await page.getByRole('button', { name: /Stop/ }).waitFor()
  await page.getByRole('button', { name: /Stop/ }).click()
  await page.getByRole('button', { name: 'Run 264 reads on this device' }).waitFor()
  await page.getByRole('button', { name: 'Run 264 reads on this device' }).click()
  await page
    .getByRole('button', { name: 'Run 264 reads on this device' })
    .waitFor({ timeout: 120000 })
  assert.equal(await page.locator('.lab figure svg circle').count(), 22)
  await page.locator('input[type="range"]').first().focus()
  await page.locator('input[type="range"]').first().press('End')
  assert.equal(await page.locator('input[type="range"]').first().inputValue(), '1')
  report.lab = {
    model: 'loaded',
    reading: 'editable',
    newMeter: 'passed',
    sweepStartCancel: 'passed',
    fullSweep: '264 reads completed, 11 live points',
    keyboardStressControl: 'passed',
  }
  for (const asset of [
    '/LourdhuRaju_Resume.pdf',
    '/lab/meter-ctc.bin',
    '/lab/worker.js',
    '/og.png',
    '/icon.svg',
    '/robots.txt',
    '/sitemap.xml',
  ])
    assert.equal((await page.request.get(origin + base + asset)).status(), 200, asset)
  report.motionRuntimeEnabled = true
  await page.screenshot({ path: 'docs/screenshots/lab-360.png', fullPage: true })
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
      .locator('.site-nav a')
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
  console.log(JSON.stringify(report, null, 2))
} finally {
  writeFileSync('docs/verification.json', JSON.stringify(report, null, 2))
  await browser.close()
}
