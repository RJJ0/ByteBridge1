import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import { chromium } from 'playwright'

const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
})
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' })
const page = await context.newPage()
const checks = []
const errors = []
page.on('pageerror', error => errors.push(error.message))
const base = process.env.BASE_URL || 'http://127.0.0.1:5173'

try {
  await page.goto(base, { waitUntil: 'networkidle' })
  await page.evaluate(() => { window.__bytebridgeNavigationMarker = 'same-document' })
  assert.equal(await page.locator('h1').count(), 1)
  assert.match(await page.title(), /Digital Skills for Everyone/)
  await page.getByRole('navigation', { name: 'Primary navigation', exact: true }).getByRole('link', { name: 'About Us', exact: true }).click()
  await page.waitForURL('**/about')
  assert.equal(await page.evaluate(() => window.__bytebridgeNavigationMarker), 'same-document')
  assert.match(await page.title(), /About Us/)
  assert.equal(await page.locator('main').evaluate(element => element === document.activeElement), true)
  checks.push('Client-side navigation preserves document, updates title, and focuses main')

  await page.reload({ waitUntil: 'networkidle' })
  assert.match(await page.locator('h1').innerText(), /Technology Connects Us/)
  checks.push('About direct navigation and refresh render correctly')

  await page.getByRole('link', { name: 'Back to Our Mission' }).click()
  await page.waitForURL('**/#mission')
  await page.waitForFunction(() => document.activeElement?.id === 'mission')
  const missionTop = await page.locator('#mission').evaluate(element => element.getBoundingClientRect().top)
  assert.ok(missionTop >= 85 && missionTop <= 120, `Mission heading position: ${missionTop}`)
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.getByRole('link', { name: 'Discover Our Mission' }).click()
  await page.waitForFunction(() => document.getElementById('mission').getBoundingClientRect().top < 125)
  checks.push('Cross-route and repeated mission links scroll and focus correctly below sticky navigation')

  for (const id of ['digital-literacy', 'online-safety', 'technology-opportunities']) {
    const card = page.locator(`#${id}`)
    const button = card.getByRole('button')
    await button.focus()
    await page.keyboard.press('Enter')
    assert.equal(await button.getAttribute('aria-expanded'), 'true')
    assert.equal(await card.locator('.program-tip').isVisible(), true)
    await page.keyboard.press('Space')
    assert.equal(await button.getAttribute('aria-expanded'), 'false')
    assert.equal(await card.locator('.program-tip').isVisible(), false)
  }
  checks.push('All three skill cards expand/collapse with Enter and Space')

  await page.setViewportSize({ width: 390, height: 844 })
  await page.evaluate(() => window.scrollTo(0, 0))
  const toggle = page.getByRole('button', { name: /navigation menu/ })
  await toggle.focus()
  await page.keyboard.press('Enter')
  assert.equal(await toggle.getAttribute('aria-expanded'), 'true')
  await page.keyboard.press('Tab')
  assert.equal(await page.evaluate(() => document.activeElement?.textContent?.trim()), 'Home')
  await page.keyboard.press('Escape')
  assert.equal(await toggle.getAttribute('aria-expanded'), 'false')
  assert.equal(await toggle.evaluate(element => element === document.activeElement), true)
  checks.push('Mobile menu opens by keyboard, exposes links, closes on Escape, and restores focus')

  await toggle.click()
  await page.getByRole('navigation', { name: 'Mobile navigation', exact: true }).getByRole('link', { name: 'About Us', exact: true }).click()
  await page.waitForURL('**/about')
  assert.equal(await toggle.getAttribute('aria-expanded'), 'false')
  assert.equal(await page.locator('main').evaluate(element => element === document.activeElement), true)
  assert.equal(await page.locator('.mobile-menu').getAttribute('inert'), '')
  checks.push('Selecting a mobile navigation link closes menu and focuses new page; closed links are inert')

  await toggle.click()
  const menuBottom = await page.locator('.mobile-menu').evaluate(element => element.getBoundingClientRect().bottom)
  await page.mouse.click(10, menuBottom + 25)
  assert.equal(await toggle.getAttribute('aria-expanded'), 'false')
  await toggle.click()
  await page.setViewportSize({ width: 1024, height: 768 })
  await page.waitForFunction(() => document.querySelector('.menu-toggle').getAttribute('aria-expanded') === 'false')
  await page.setViewportSize({ width: 390, height: 844 })
  assert.equal(await toggle.getAttribute('aria-expanded'), 'false')
  checks.push('Mobile menu closes on outside click and stays closed after desktop/mobile resizing')

  await page.goto(`${base}/`, { waitUntil: 'networkidle' })
  assert.equal(await page.locator('.hero-enter').first().evaluate(element => getComputedStyle(element).animationName), 'none')
  assert.equal(await page.locator('.gradient-drift').evaluate(element => getComputedStyle(element).animationName), 'none')
  checks.push('Reduced-motion mode disables hero and gradient animations')

  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await toggle.focus()
  await page.keyboard.press('Enter')
  await page.keyboard.press('Tab')
  assert.equal(await page.evaluate(() => document.activeElement?.textContent?.trim()), 'Home')
  await page.keyboard.press('Escape')
  checks.push('Immediate keyboard navigation also works with normal motion enabled')

  await page.evaluate(() => document.fonts.ready)
  assert.equal(await page.evaluate(() => document.fonts.check('400 16px Inter') && document.fonts.check('750 32px "Plus Jakarta Sans"')), true)
  checks.push('Both locally hosted variable font families load successfully')

  await page.goto(`${base}/unrecognized`, { waitUntil: 'networkidle' })
  await page.waitForURL(`${base}/`)
  checks.push('Unknown URLs recover to Home without creating an extra page')
  assert.deepEqual(errors, [])
  checks.push('No browser JavaScript errors during interactions')
  await mkdir('artifacts/qa', { recursive: true })
  await writeFile('artifacts/qa/interaction-report.json', JSON.stringify({ checks, errors }, null, 2))
  console.log(JSON.stringify({ passed: checks.length, checks }, null, 2))
} finally {
  await browser.close()
}
