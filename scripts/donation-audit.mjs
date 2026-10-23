import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import { chromium } from 'playwright'
import AxeBuilder from '@axe-core/playwright'

const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true })
const base = process.env.BASE_URL || 'http://127.0.0.1:5173'
const checks = []
const errors = []
await mkdir('artifacts/qa', { recursive: true })

try {
  const context = await browser.newContext({ reducedMotion: 'reduce' })
  // Keep the unavailable-state cases deterministic even with a configured local API.
  await context.route('**/donation-config', route => route.fulfill({ status: 503, json: { enabled: false } }))
  const page = await context.newPage()
  page.on('pageerror', error => errors.push(error.message))
  for (const width of [320, 375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 950 })
    await page.goto(`${base}/donate`, { waitUntil: 'networkidle' })
    await page.getByText('Online donations are currently unavailable.', { exact: false }).waitFor()
    assert.equal(await page.title(), 'Donation | ByteBridge')
    assert.equal(await page.locator('meta[name="description"]').getAttribute('content'), 'Help bridge the digital divide through digital education, technology access, and community empowerment.')
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true)
    assert.equal(await page.getByRole('button', { name: 'Donate', exact: true }).isDisabled(), true)
    await page.screenshot({ path: `artifacts/qa/donate-${width}.png`, fullPage: true })
    if (width === 375 || width === 1440) {
      const scan = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
      assert.deepEqual(scan.violations.map(item => ({ id: item.id, nodes: item.nodes.map(node => node.target) })), [])
    }
  }
  checks.push('Donation layouts at 320/375/768/1024/1440px; unavailable payments disabled; desktop/mobile axe scans pass')
  await page.setViewportSize({ width: 375, height: 900 })
  await page.getByRole('button', { name: 'Open navigation menu' }).click()
  const mobile = page.getByRole('navigation', { name: 'Mobile navigation', exact: true })
  assert.equal(await mobile.getByRole('link', { name: 'Donation', exact: true }).getAttribute('aria-current'), 'page')
  await mobile.getByRole('link', { name: 'Home', exact: true }).click()
  await page.waitForURL(`${base}/`)
  await page.getByRole('button', { name: 'Open navigation menu' }).click()
  await mobile.getByRole('link', { name: 'Donation', exact: true }).click()
  await page.waitForURL(`${base}/donate`)
  assert.equal(await page.getByRole('button', { name: 'Open navigation menu' }).getAttribute('aria-expanded'), 'false')
  checks.push('Mobile Donation active state, navigation, and menu closing')
  await page.getByRole('button', { name: 'Choose a custom amount' }).click()
  const custom = page.getByLabel('Custom amount (PHP)')
  for (const value of ['0', '-1', '1e3', '250.999', '100001', '']) {
    await custom.fill(value)
    assert.equal(await custom.getAttribute('aria-invalid'), 'true')
  }
  await custom.fill('350.50')
  assert.equal(await custom.getAttribute('aria-invalid'), 'false')
  assert.match(await page.locator('.donation-total').innerText(), /350\.50/)
  checks.push('Custom amount rejects nonpositive, excessive, exponential, and sub-cent values; exact centavos displayed')
  await page.goto(`${base}/payment-success?redirect_status=succeeded`)
  await page.getByText('We could not verify a payment.', { exact: false }).waitFor()
  assert.equal(new URL(page.url()).search, '')
  checks.push('Unverified return URL cannot claim success; return query removed')

  // API and Stripe are simulated below. These checks do not make an actual payment.
  const mock = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' })
  await mock.addInitScript(() => {
    window.__paymentTest = { confirmations: 0, mismatch: false, status: 'succeeded', fail: false }
    window.__fakeStripe = {
      async retrievePaymentIntent(secret) {
        return { paymentIntent: { amount: Number(secret.split('_')[1]) + (window.__paymentTest.mismatch ? 1 : 0), currency: 'php', status: 'requires_payment_method' } }
      },
      async confirmPayment() {
        window.__paymentTest.confirmations++
        await new Promise(resolve => setTimeout(resolve, 150))
        return window.__paymentTest.fail ? { error: { message: 'Your test card was declined.' } } : { paymentIntent: { status: window.__paymentTest.status } }
      },
    }
  })
  let reactImport = '/node_modules/.vite/deps/react.js'
  let testMode = true
  await mock.route('**/src/**/*.tsx*', async route => {
    const response = await route.fetch()
    const source = await response.text()
    reactImport = source.match(/["'](\/node_modules\/\.vite\/deps\/react\.js\?[^"']*)["']/)?.[1] ?? reactImport
    await route.fulfill({ response, body: source.replace(/["']\/src\/lib\/payments\.ts(?:\?[^"']*)?["']/g, '"/test-payments"') })
  })
  await mock.route('**/test-payments', route => route.fulfill({ contentType: 'text/javascript', body: `
    export { formatAmount, parseAmount } from '/src/lib/payments.ts';
    export const paymentConfigured = true;
    export const paymentTestMode = ${testMode};
    export const apiUrl = '/test-api';
    export const getStripe = () => Promise.resolve(window.__fakeStripe);
  ` }))
  await mock.route('**/node_modules/.vite/deps/@stripe_react-stripe-js.js*', route => route.fulfill({ contentType: 'text/javascript', body: `
    import React from '${reactImport}';
    export const Elements = ({children}) => children;
    export const useStripe = () => window.__fakeStripe;
    export const useElements = () => ({});
    export function PaymentElement({onReady}) { React.useEffect(() => {onReady()}, []); return React.createElement('p', {}, 'Simulated Stripe PaymentElement'); }
  ` }))
  await mock.route('**/test-api/donation-config', route => route.fulfill({ json: { enabled: true, currency: 'php', minAmount: 10000, maxAmount: 10000000 } }))
  const requests = []
  let apiFailure = false
  await mock.route('**/test-api/create-payment-intent', async route => {
    const data = route.request().postDataJSON()
    requests.push(data)
    await new Promise(resolve => setTimeout(resolve, data.amount === 50000 ? 600 : 50))
    await route.fulfill(apiFailure ? { status: 503, json: {} } : { json: { amount: data.amount, currency: 'php', clientSecret: `test_${data.amount}`, reference: `pi_mock${data.amount}.${'a'.repeat(64)}` } })
  })
  await mock.route('**/test-api/donation-status', async route => {
    const { reference } = route.request().postDataJSON()
    if (!/^pi_mock\d+\.a{64}$/.test(reference ?? '')) return route.fulfill({ status: 400, json: {} })
    const status = await checkout.evaluate(() => window.__paymentTest.status)
    return route.fulfill({ json: { reference, status, currency: 'php', amount: status === 'succeeded' ? Number(reference.match(/pi_mock(\d+)/)[1]) : null } })
  })
  const checkout = await mock.newPage()
  checkout.on('pageerror', error => errors.push(error.message))
  await checkout.goto(`${base}/donate`, { waitUntil: 'networkidle' })
  if (errors.length) throw new Error(JSON.stringify(errors))
  const demoText = 'This is a demo, so no real money moves. Pay with the test card 4242 4242 4242 4242, any future date, and any CVC.'
  assert.equal(await checkout.locator('.donation-demo').innerText(), demoText)
  assert.equal(await checkout.locator('.donation-footnote + .donation-demo').count(), 1)
  await checkout.getByRole('button', { name: 'Donate', exact: true }).click()
  const donate = checkout.getByRole('button', { name: 'Donate Now', exact: true })
  await donate.waitFor()
  assert.equal(requests.length, 1)
  assert.equal(requests[0].amount, 25000)
  await checkout.getByRole('button', { name: '₱500', exact: true }).click()
  assert.equal(await donate.count(), 0)
  await checkout.waitForTimeout(400)
  await checkout.getByRole('button', { name: '₱1,000', exact: true }).click()
  await donate.waitFor()
  assert.match(await checkout.locator('.donation-payment .donation-total').innerText(), /1,000/)
  await checkout.waitForTimeout(650)
  assert.match(await checkout.locator('.donation-payment .donation-total').innerText(), /1,000/)
  assert.equal(requests.at(-1).amount, 100000)
  checks.push('Simulated API: initial amount sent once under StrictMode; changes unmount old form; late responses cannot restore stale totals')
  await checkout.evaluate(() => { window.__paymentTest.mismatch = true })
  await donate.click()
  await checkout.getByText('The payment total could not be verified.', { exact: false }).waitFor()
  assert.equal(await checkout.evaluate(() => window.__paymentTest.confirmations), 0)
  assert.equal(await checkout.getByRole('button', { name: '₱100', exact: true }).isDisabled(), true)
  checks.push('Simulated Stripe: mismatched actual intent amount blocks confirmation and locks checkout')

  await checkout.reload({ waitUntil: 'networkidle' })
  apiFailure = true
  await checkout.getByRole('button', { name: 'Donate', exact: true }).click()
  await checkout.getByText('Unable to prepare your donation.', { exact: false }).waitFor()
  const requestId = requests.at(-1).requestId
  apiFailure = false
  await checkout.getByRole('button', { name: 'Try again', exact: true }).click()
  await donate.waitFor()
  assert.equal(requests.at(-1).requestId, requestId)
  await checkout.evaluate(() => { window.__paymentTest.fail = true })
  await donate.click()
  await checkout.getByText('Your test card was declined.').waitFor()
  assert.equal(await donate.isEnabled(), true)
  await checkout.evaluate(() => { window.__paymentTest.fail = false })
  await donate.dblclick()
  await checkout.getByRole('heading', { name: 'Thank you!', exact: true }).waitFor()
  assert.equal(await checkout.evaluate(() => window.__paymentTest.confirmations), 2)
  assert.match(checkout.url(), /\/donation\/success\?reference=/)
  assert.match(await checkout.locator('.thank-you__amount').innerText(), /250/)
  const createdBeforeRefresh = requests.length
  await checkout.reload({ waitUntil: 'networkidle' })
  await checkout.getByRole('heading', { name: 'Thank you!', exact: true }).waitFor()
  assert.equal(requests.length, createdBeforeRefresh)
  checks.push('Simulated API/Stripe: retry keeps idempotency ID; decline allows correction; double submit confirms once; verified success redirects and refresh creates no payment')
  await checkout.goto(`${base}/donate`, { waitUntil: 'networkidle' })
  await checkout.getByRole('button', { name: 'Donate', exact: true }).click()
  await donate.waitFor()
  await checkout.evaluate(() => { window.__paymentTest.status = 'processing' })
  await donate.click()
  await checkout.getByText('Your payment is processing or awaiting confirmation.', { exact: false }).waitFor()
  assert.equal(await checkout.getByRole('button', { name: 'Payment status pending', exact: true }).isDisabled(), true)
  assert.equal(new URL(checkout.url()).pathname, '/donate')
  checks.push('Simulated Stripe: processing state locks checkout')
  assert.equal(await checkout.locator('.donation-demo').innerText(), demoText)
  for (const status of ['requires_payment_method', 'canceled']) {
    await checkout.goto(`${base}/donate`, { waitUntil: 'networkidle' })
    await checkout.getByRole('button', { name: 'Donate', exact: true }).click()
    await donate.waitFor()
    await checkout.evaluate(status => { window.__paymentTest.status = status }, status)
    await donate.click()
    await checkout.getByRole('alert').waitFor()
    assert.equal(new URL(checkout.url()).pathname, '/donate')
    if (status === 'requires_payment_method') assert.equal(await donate.isEnabled(), true)
    else assert.equal(await checkout.getByRole('button', { name: 'Payment status pending', exact: true }).isDisabled(), true)
  }
  checks.push('Simulated Stripe: incomplete payment permits correction; canceled payment shows error without success navigation')
  testMode = false
  await checkout.reload({ waitUntil: 'networkidle' })
  assert.equal(await checkout.locator('.donation-demo').count(), 0)
  assert.equal(await checkout.getByText('Payment details stay within Stripe.', { exact: false }).count(), 1)
  checks.push('Demo notice follows Stripe security text in test mode, persists through checkout, and is absent in live mode')
  assert.deepEqual(errors, [])
  await writeFile('artifacts/qa/donation-report.json', JSON.stringify({ checks, errors, actualPaymentTested: false }, null, 2))
  console.log(JSON.stringify({ passed: checks.length, checks, actualPaymentTested: false }, null, 2))
} finally {
  await browser.close()
}
