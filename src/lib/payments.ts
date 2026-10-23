import { loadStripe } from '@stripe/stripe-js/pure'

const key = (import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ?? '').trim()
export const paymentConfigured = /^pk_(test|live)_/.test(key)
  && (!import.meta.env.DEV || key.startsWith('pk_test_'))
export const paymentTestMode = paymentConfigured && key.startsWith('pk_test_')
export const apiUrl = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')
let stripePromise: ReturnType<typeof loadStripe> | undefined

export function getStripe() {
  if (!paymentConfigured) return Promise.resolve(null)
  stripePromise ??= loadStripe(key)
  return stripePromise
}

export const formatAmount = (amount: number) => new Intl.NumberFormat('en-PH', {
  style: 'currency', currency: 'PHP', minimumFractionDigits: amount % 100 ? 2 : 0,
}).format(amount / 100)

export function parseAmount(value: string): number | null {
  if (!/^\d+(\.\d{1,2})?$/.test(value)) return null
  const [whole, fraction = ''] = value.split('.')
  const amount = Number(whole) * 100 + Number(fraction.padEnd(2, '0'))
  return Number.isSafeInteger(amount) && amount > 0 ? amount : null
}
