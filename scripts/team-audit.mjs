import { chromium } from 'playwright'
import { mkdir, writeFile } from 'node:fs/promises'

// Browser-only fixtures: the real team.ts remains empty and is never modified.
const outputDirectory = new URL('../artifacts/qa/', import.meta.url)
await mkdir(outputDirectory, { recursive: true })
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
})

const photo = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="480" height="480"><rect width="480" height="480" fill="#dfeaff"/><text x="240" y="240" text-anchor="middle" font-family="sans-serif" font-size="25" fill="#102440">QA image fixture</text></svg>')}`
const report = { productionTeamDataModified: false, cases: [], failures: [] }

try {
  for (const memberCount of [1, 2, 7]) {
    for (const width of [320, 768, 1440]) {
      const members = Array.from({ length: memberCount }, (_, index) => ({
        id: `qa-${index + 1}`,
        name: `QA Member ${index + 1}`,
        role: index === 6 ? 'Accessibility research and educational content coordination' : 'Browser test fixture',
        ...(index !== 1 && { image: index === 0 ? '/__qa_missing_portrait.jpg' : photo }),
        biography: 'Temporary browser-only fixture used to verify responsive layout. This person is not part of the website data.',
      }))
      const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' })
      await context.route('**/src/data/team.ts*', (route) => route.fulfill({
        status: 200,
        contentType: 'application/javascript',
        body: `export const teamMembers = ${JSON.stringify(members)};`,
      }))
      await context.route('**/__qa_missing_portrait.jpg', (route) => route.fulfill({ status: 404, body: '' }))
      const page = await context.newPage()
      const exceptions = []
      page.on('pageerror', (error) => exceptions.push(error.message))
      await page.goto(`${process.env.BASE_URL || 'http://127.0.0.1:5173'}/about`, { waitUntil: 'networkidle' })
      await page.locator('.team-card').first().scrollIntoViewIfNeeded()
      await page.locator('.team-card').first().locator('.team-card__initials').waitFor()
      // Each photograph is lazy-loaded. Bring every valid fixture image into view
      // before measuring its loading status rather than mistaking laziness for failure.
      const images = page.locator('.team-card__portrait img')
      for (let index = 0; index < await images.count(); index++) {
        await images.nth(index).scrollIntoViewIfNeeded()
        await images.nth(index).evaluate((image) => image.complete && image.naturalWidth > 0
          ? Promise.resolve()
          : new Promise((resolve, reject) => {
            image.addEventListener('load', resolve, { once: true })
            image.addEventListener('error', reject, { once: true })
          }))
      }
      const result = await page.evaluate(() => {
        const cards = [...document.querySelectorAll('.team-card')]
        const grid = document.querySelector('.team-grid')
        const rowPositions = cards.map((card) => Math.round(card.getBoundingClientRect().top))
        const photoImages = [...document.querySelectorAll('.team-card__portrait img')]
        return {
          cardCount: cards.length,
          columns: getComputedStyle(grid).gridTemplateColumns.split(' ').filter((track) => parseFloat(track) > 0).length,
          rowCount: new Set(rowPositions).size,
          hasHorizontalOverflow: document.documentElement.scrollWidth > window.innerWidth,
          overflowElements: [...document.querySelectorAll('main *')].filter((element) => {
            const bounds = element.getBoundingClientRect()
            return bounds.width > 0 && (bounds.left < -1 || bounds.right > window.innerWidth + 1)
          }).map((element) => `${element.tagName}.${element.className}`).slice(0, 12),
          initials: [...document.querySelectorAll('.team-card__initials')].map((element) => element.textContent),
          remainingPortraitImagesLoad: photoImages.every((image) => image.complete && image.naturalWidth > 0),
          introductionIsHidden: !document.querySelector('.team-introduction'),
          names: cards.map((card) => card.querySelector('h3').textContent),
        }
      })
      const failures = []
      if (result.cardCount !== memberCount) failures.push('Wrong number of member cards')
      if (result.hasHorizontalOverflow || result.overflowElements.length) failures.push('Horizontal overflow')
      if (!result.initials.includes('Q1')) failures.push('Failed photo did not produce initials')
      if (memberCount > 1 && !result.initials.includes('Q2')) failures.push('Omitted photo did not produce initials')
      if (!result.remainingPortraitImagesLoad) failures.push('Valid fixture photo did not load')
      if (!result.introductionIsHidden) failures.push('Empty introduction remained visible')
      if (exceptions.length) failures.push('Uncaught browser exception')
      report.cases.push({ memberCount, width, ...result, exceptions, passed: failures.length === 0 })
      if (failures.length) report.failures.push({ memberCount, width, failures })
      if (memberCount === 7 && width !== 768) {
        await page.locator('#team').screenshot({
          path: new URL(`team-fixtures-${width}.png`, outputDirectory).pathname.replace(/^\/(\w:)/, '$1'),
          style: 'header, .skip-link { visibility: hidden !important; }',
        })
      }
      await context.close()
    }
  }
} finally {
  await browser.close()
  await writeFile(new URL('team-report.json', outputDirectory), `${JSON.stringify(report, null, 2)}\n`)
}

console.log(JSON.stringify(report, null, 2))
if (report.failures.length) process.exitCode = 1
