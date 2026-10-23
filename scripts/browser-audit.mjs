import { chromium } from 'playwright'
import AxeBuilder from '@axe-core/playwright'
import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

// Optional QA tools: npm install --no-save --package-lock=false playwright @axe-core/playwright
// Start Vite, then: node scripts/browser-audit.mjs
const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:5173'
const outputDir = resolve('artifacts/qa')
await mkdir(outputDir, { recursive: true })
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
})
const report = { baseUrl, generatedAt: new Date().toISOString(), layouts: [], accessibility: [], reducedMotion: [], runtimeErrors: [], externalFontFailures: [], requestFailures: [] }
const viewports = [320, 375, 390, 768, 1024, 1440].map(width => ({ width, height: 900 }))
viewports.push({ width: 844, height: 390 })
const routes = [{ path: '/', name: 'home' }, { path: '/about', name: 'about' }]
const isFont = url => /fonts\.(googleapis|gstatic)\.com|\.(woff2?|ttf)(\?|$)/i.test(url)

function recordErrors(page, label) {
  page.on('pageerror', error => report.runtimeErrors.push({ label, type: 'pageerror', message: error.message }))
  page.on('console', message => {
    if (message.type() !== 'error') return
    const item = { label, type: 'console', message: message.text(), url: message.location().url }
    if (isFont(item.url || '') || isFont(item.message)) report.externalFontFailures.push(item)
    else report.runtimeErrors.push(item)
  })
  page.on('requestfailed', request => {
    const item = { label, url: request.url(), failure: request.failure()?.errorText }
    if (isFont(item.url)) report.externalFontFailures.push(item)
    else report.requestFailures.push(item)
  })
}

async function preparePage(page, route) {
  await page.goto(new URL(route.path, baseUrl).href, { waitUntil: 'networkidle' })
  await page.evaluate(async () => {
    for (let offset = 0; offset < document.documentElement.scrollHeight; offset += window.innerHeight) {
      window.scrollTo(0, offset)
      await new Promise(resolve => setTimeout(resolve, 60))
    }
    await Promise.all(Array.from(document.images).map(image => image.decode().catch(() => {})))
    window.scrollTo(0, 0)
  })
  await page.waitForTimeout(750)
}

async function layoutResult(page) {
  return page.evaluate(() => {
    const innerWidth = window.innerWidth
    const scrollWidth = document.documentElement.scrollWidth
    return {
      title: document.title,
      innerWidth,
      scrollWidth,
      horizontalOverflow: scrollWidth > innerWidth,
      bodyScrollWidth: document.body.scrollWidth,
      brokenImages: Array.from(document.images).filter(image => !image.complete || image.naturalWidth === 0).map(image => ({ src: image.currentSrc, alt: image.alt })),
      overflowingElements: scrollWidth > innerWidth ? Array.from(document.querySelectorAll('body *')).filter(element => {
        const box = element.getBoundingClientRect()
        return box.width && (box.left < -1 || box.right > innerWidth + 1)
      }).map(element => ({ tag: element.tagName, class: element.className?.baseVal ?? element.className, x: element.getBoundingClientRect().x, width: element.getBoundingClientRect().width })).slice(0, 25) : [],
    }
  })
}

async function scanAccessibility(page, label) {
  const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
  const violations = result.violations.map(({ id, impact, description, help, helpUrl, nodes }) => ({ id, impact, description, help, helpUrl, nodes: nodes.map(({ target, failureSummary, html }) => ({ target, failureSummary, html })) }))
  report.accessibility.push({ label, violations, incomplete: result.incomplete.map(({ id, nodes }) => ({ id, targets: nodes.map(node => node.target) })) })
  console.log(`${label}: ${violations.length} axe violations`)
}

try {
  for (const route of routes) {
    for (const viewport of viewports) {
      const label = `${route.name}-${viewport.width}x${viewport.height}`
      const context = await browser.newContext({ viewport })
      const page = await context.newPage()
      recordErrors(page, label)
      await preparePage(page, route)
      const layout = await layoutResult(page)
      report.layouts.push({ label, ...layout })
      console.log(`${label}: overflow=${layout.horizontalOverflow}, brokenImages=${layout.brokenImages.length}`)
      if ([390, 1440].includes(viewport.width)) {
        await page.screenshot({ path: resolve(outputDir, `${route.name}-${viewport.width === 390 ? 'mobile' : 'desktop'}.png`), fullPage: true, animations: 'disabled' })
        await scanAccessibility(page, label)
        if (viewport.width === 390) {
          await page.getByRole('button', { name: 'Open navigation menu' }).click()
          await page.waitForTimeout(400)
          await scanAccessibility(page, `${label}-menu-open`)
          report.layouts.push({ label: `${label}-menu-open`, ...await layoutResult(page) })
        }
      }
      await context.close()
    }
    const context = await browser.newContext({ viewport: { width: 390, height: 900 }, reducedMotion: 'reduce' })
    const page = await context.newPage()
    recordErrors(page, `${route.name}-reduced-motion`)
    await preparePage(page, route)
    const motion = await page.evaluate(() => {
      const headings = Array.from(document.querySelectorAll('main h1, main h2')).map(element => {
        let visible = true
        for (let ancestor = element; ancestor; ancestor = ancestor.parentElement) {
          const style = getComputedStyle(ancestor)
          if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) visible = false
        }
        return { text: element.textContent, visible: visible && element.getBoundingClientRect().height > 0 }
      })
      const significantAnimations = Array.from(document.querySelectorAll('body *')).filter(element => {
        const style = getComputedStyle(element)
        return style.animationName !== 'none' && style.animationDuration.split(',').some(duration => parseFloat(duration) > 0.01)
      }).map(element => ({ tag: element.tagName, class: element.className?.baseVal ?? element.className, animation: getComputedStyle(element).animationName, duration: getComputedStyle(element).animationDuration }))
      return { preferenceMatches: matchMedia('(prefers-reduced-motion: reduce)').matches, headings, significantAnimations, scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior }
    })
    report.reducedMotion.push({ route: route.path, ...motion })
    await context.close()
  }
} finally {
  await browser.close()
  report.summary = {
    layoutsChecked: report.layouts.length,
    overflowFailures: report.layouts.filter(item => item.horizontalOverflow).length,
    brokenImageFailures: report.layouts.filter(item => item.brokenImages.length).length,
    accessibilityViolations: report.accessibility.reduce((count, item) => count + item.violations.length, 0),
    reducedMotionFailures: report.reducedMotion.filter(item => !item.preferenceMatches || item.headings.some(heading => !heading.visible) || item.significantAnimations.length).length,
    runtimeErrors: report.runtimeErrors.length,
    requestFailures: report.requestFailures.length,
    externalFontFailures: report.externalFontFailures.length,
  }
  await writeFile(resolve(outputDir, 'audit-report.json'), `${JSON.stringify(report, null, 2)}\n`)
  console.log(JSON.stringify(report.summary, null, 2))
  if (report.summary.overflowFailures || report.summary.brokenImageFailures || report.summary.accessibilityViolations || report.summary.reducedMotionFailures || report.summary.runtimeErrors || report.summary.requestFailures) process.exitCode = 1
}
