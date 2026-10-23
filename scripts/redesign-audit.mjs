import { chromium } from 'playwright'
import AxeBuilder from '@axe-core/playwright'
import { mkdir, writeFile } from 'node:fs/promises'

const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true })
const layouts = []
const accessibility = []
const runtimeErrors = []
await mkdir('artifacts/qa', { recursive: true })
try {
  const context = await browser.newContext({ reducedMotion: 'reduce' })
  await context.route('**/donation-config', route => route.fulfill({ status: 503, json: { enabled: false } }))
  const page = await context.newPage()
  page.on('pageerror', error => runtimeErrors.push(error.message))
  for (const [name, path] of [['home', '/'], ['about', '/about'], ['donate', '/donate'], ['payment-status', '/payment-success']]) {
    for (const width of [320, 375, 430, 768, 1024, 1280, 1440, 1920]) {
      await page.setViewportSize({ width, height: 1000 })
      await page.goto(`${process.env.BASE_URL || 'http://127.0.0.1:5173'}${path}`, { waitUntil: 'networkidle' })
      const result = await page.evaluate(() => ({ overflow: document.documentElement.scrollWidth > innerWidth, headings: document.querySelectorAll('h1').length, background: getComputedStyle(document.documentElement).backgroundColor, brokenImages: [...document.images].filter(image => image.complete && image.naturalWidth === 0).length }))
      layouts.push({ name, width, ...result })
      if (width === 375 || width === 1440) {
        await page.screenshot({ path: `artifacts/qa/redesign-${name}-${width}.png`, fullPage: true })
        const scan = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
        accessibility.push({ name, width, violations: scan.violations.map(item => ({ id: item.id, nodes: item.nodes.map(node => ({ target: node.target, summary: node.failureSummary })) })) })
      }
    }
    console.log(`${name}: layouts inspected`)
  }
  await page.setViewportSize({ width: 375, height: 900 })
  await page.goto('http://127.0.0.1:5173/donate')
  await page.getByRole('button', { name: 'Open navigation menu' }).click()
  const menuScan = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
  accessibility.push({ name: 'mobile-menu', width: 375, violations: menuScan.violations.map(item => ({ id: item.id, nodes: item.nodes.map(node => ({ target: node.target, summary: node.failureSummary })) })) })
  const failures = layouts.filter(item => item.overflow || item.headings !== 1 || item.brokenImages || item.background !== 'rgb(13, 13, 13)')
  const violations = accessibility.filter(item => item.violations.length)
  await writeFile('artifacts/qa/redesign-report.json', JSON.stringify({ layouts, accessibility, runtimeErrors }, null, 2))
  console.log(JSON.stringify({ layouts: layouts.length, failures, accessibilityFailures: violations, runtimeErrors }, null, 2))
  if (failures.length || violations.length || runtimeErrors.length) process.exitCode = 1
} finally { await browser.close() }
