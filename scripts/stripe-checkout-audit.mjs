import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import { chromium } from 'playwright'

// Real Stripe test-mode form verification only. This never submits a payment.
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true })
const results = []
const prepared = []
let externalBlocked = false
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' })
  page.on('requestfailed', request => {
    if (!request.url().startsWith('http://127.0.0.1') && !request.url().startsWith('http://localhost')) externalBlocked = true
  })
  page.on('response', async response => {
    if (new URL(response.url()).pathname !== '/create-payment-intent' || !response.ok()) return
    const body = await response.json()
    // Never store or print a client secret.
    prepared.push({ amount: body.amount, currency: body.currency })
  })
  await page.goto(`${process.env.BASE_URL || 'http://127.0.0.1:5173'}/donate`)
  const next = page.getByRole('button', { name: 'Continue to payment' })
  await next.waitFor()
  await page.waitForFunction(() => !document.querySelector('.donation-continue')?.disabled, { timeout: 20000 })
  results.push('Continue to payment enabled against the real backend')
  await next.click()
  const donate = page.getByRole('button', { name: 'Donate Now', exact: true })
  await donate.waitFor({ timeout: 20000 }).catch(() => { throw new Error(`Stripe form did not load; externalRequestsBlocked=${externalBlocked}`) })
  await page.waitForFunction(() => !document.querySelector('.donation-payment button[type="submit"]')?.disabled)
  assert.ok(await page.locator('.donation-payment iframe').count() > 0)
  assert.deepEqual(prepared.at(-1), { amount: 25000, currency: 'php' })
  results.push('Real Stripe PaymentElement ready for the verified PHP 250 test intent')
  await page.getByRole('button', { name: 'Choose a custom amount' }).click()
  await page.getByLabel('Custom amount (PHP)').fill('350.50')
  await donate.waitFor({ timeout: 20000 })
  await page.waitForFunction(() => !document.querySelector('.donation-payment button[type="submit"]')?.disabled)
  assert.deepEqual(prepared.at(-1), { amount: 35050, currency: 'php' })
  assert.match(await page.locator('.donation-payment .donation-total').innerText(), /350\.50/)
  results.push('Custom PHP 350.50 creates a fresh matching intent and ready Stripe form')
  await mkdir('artifacts/qa', { recursive: true })
  await page.screenshot({ path: 'artifacts/qa/stripe-checkout-real.png', fullPage: true })
  await writeFile('artifacts/qa/stripe-checkout-report.json', JSON.stringify({ results, prepared, actualPaymentSubmitted: false }, null, 2))
  console.log(JSON.stringify({ results, prepared, actualPaymentSubmitted: false }, null, 2))
} finally {
  await browser.close()
}
