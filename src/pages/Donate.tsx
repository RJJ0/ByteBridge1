import { useEffect, useState } from 'react'
import { Elements } from '@stripe/react-stripe-js'
import { ArrowRight, BookOpen, Heart, Monitor, ShieldCheck, UsersRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import Donation from '../components/Donation'
import ScrollReveal from '../components/ScrollReveal'
import { apiUrl, formatAmount, getStripe, parseAmount, paymentConfigured } from '../lib/payments'
import '../styles/donate.css'

interface DonationConfig { currency: 'php'; minAmount: number; maxAmount: number }
interface IntentRequest { amount: number; requestId: string }

const impacts = [
  { icon: BookOpen, title: 'Digital Education', description: 'Support accessible digital literacy learning, one useful skill at a time.' },
  { icon: Monitor, title: 'Technology Access', description: 'Help communities access essential technology resources and explore new possibilities.' },
  { icon: UsersRound, title: 'Community Empowerment', description: 'Support opportunities to build practical digital skills and move forward with confidence.' },
]

function IntentCheckout({ request, onLock }: { request: IntentRequest; onLock: (locked: boolean) => void }) {
  const [clientSecret, setClientSecret] = useState('')
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    // Debounce typing and avoid duplicate StrictMode requests. The backend must also honor requestId.
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`${apiUrl}/create-payment-intent`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: request.amount, currency: 'php', requestId: request.requestId }),
          signal: AbortSignal.any([controller.signal, AbortSignal.timeout(15000)]),
        })
        if (!response.ok) throw new Error('Unable to prepare your donation. Please try again.')
        const data = await response.json()
        if (typeof data.clientSecret !== 'string' || data.amount !== request.amount || data.currency !== 'php') {
          throw new Error('The payment total could not be verified. No payment has been submitted.')
        }
        const stripe = await getStripe()
        if (!stripe) throw new Error('Secure payments are currently unavailable.')
        const result = await stripe.retrievePaymentIntent(data.clientSecret)
        if (result.error || result.paymentIntent?.amount !== request.amount || result.paymentIntent.currency !== 'php'
          || !['requires_payment_method', 'requires_confirmation'].includes(result.paymentIntent.status)) {
          throw new Error('The payment total or status could not be verified. No payment has been submitted.')
        }
        if (!controller.signal.aborted) setClientSecret(data.clientSecret)
      } catch (failure) {
        if (!controller.signal.aborted) setError(failure instanceof Error ? failure.message : 'Unable to load secure payments. Please try again.')
      }
    }, 350)
    return () => { window.clearTimeout(timer); controller.abort() }
  }, [request, attempt])

  if (error) return <div className="donation-notice"><p className="donation-error" role="alert">{error}</p><button className="button button-secondary" onClick={() => { setError(''); setAttempt(value => value + 1) }}>Try again</button></div>
  if (!clientSecret) return <p className="donation-notice" role="status">Preparing secure payment for {formatAmount(request.amount)}…</p>
  return <Elements key={clientSecret} stripe={getStripe()} options={{ clientSecret, appearance: {
    theme: 'stripe', variables: { colorPrimary: '#2563eb', colorText: '#102440', borderRadius: '8px', fontFamily: 'system-ui, sans-serif' },
  } }}><Donation amount={request.amount} clientSecret={clientSecret} onLock={onLock} /></Elements>
}

export default function Donate() {
  const [config, setConfig] = useState<DonationConfig | null>(null)
  const [configState, setConfigState] = useState<'loading' | 'ready' | 'unavailable'>('loading')
  const [selection, setSelection] = useState<number | 'custom'>(25000)
  const [custom, setCustom] = useState('')
  const [started, setStarted] = useState(false)
  const [locked, setLocked] = useState(false)
  const [request, setRequest] = useState<IntentRequest | null>(null)
  const [configAttempt, setConfigAttempt] = useState(0)
  const amount = selection === 'custom' ? parseAmount(custom) : selection
  const valid = amount !== null && amount >= (config?.minAmount ?? 10000) && amount <= (config?.maxAmount ?? 10000000)

  useEffect(() => {
    const controller = new AbortController()
    async function loadConfig() {
      try {
        if (!apiUrl || !paymentConfigured) throw new Error('Not configured')
        const response = await fetch(`${apiUrl}/donation-config`, { signal: AbortSignal.any([controller.signal, AbortSignal.timeout(15000)]) })
        if (!response.ok) throw new Error('Unavailable')
        const data = await response.json()
        if (data.enabled !== true || data.currency !== 'php' || !Number.isSafeInteger(data.minAmount)
          || !Number.isSafeInteger(data.maxAmount) || data.minAmount <= 0 || data.maxAmount < data.minAmount
          || data.maxAmount > 99999999) throw new Error('Unsupported payment configuration')
        if (!controller.signal.aborted) { setConfig(data); setConfigState('ready') }
      } catch {
        if (!controller.signal.aborted) setConfigState('unavailable')
      }
    }
    void loadConfig()
    return () => controller.abort()
  }, [configAttempt])

  function changeAmount(nextSelection: number | 'custom', nextCustom = custom) {
    if (nextSelection === selection && nextCustom === custom) return
    setSelection(nextSelection)
    setCustom(nextCustom)
    const nextAmount = nextSelection === 'custom' ? parseAmount(nextCustom) : nextSelection
    // Clear the old Elements tree in the same render as the changed displayed amount.
    setRequest(started && config && nextAmount !== null && nextAmount >= config.minAmount && nextAmount <= config.maxAmount
      ? { amount: nextAmount, requestId: crypto.randomUUID() } : null)
  }

  return <>
    <section className="donate-hero" aria-labelledby="donate-heading">
      <div className="container donate-hero__grid">
        <div className="hero-enter"><p className="eyebrow">Small steps. Shared possibilities.</p>
          <h1 id="donate-heading">Help Bridge the <span>Digital Divide</span></h1>
          <p className="donate-hero__subtitle">Your support helps ByteBridge make digital knowledge, tools, and opportunities more accessible to everyone.</p>
          <p>Access to learning can open doors. Your generosity can help more people take their next step toward digital confidence.</p>
          <Link className="button button-primary" to="/donate#give">Make a Donation <ArrowRight aria-hidden="true" /></Link>
        </div>
        <div className="donate-hero__art hero-enter" aria-hidden="true"><span className="donate-orbit" /><span className="donate-heart"><Heart size={58} strokeWidth={1.5} /></span><p>A little generosity.<br /><strong>A world of possibility.</strong></p></div>
      </div>
    </section>

    <section className="section donate-impact" aria-labelledby="impact-heading"><div className="container">
      <ScrollReveal><p className="eyebrow">What your support can make possible</p><h2 id="impact-heading">More access. More opportunity.</h2><p className="donate-section-description">Three ways to help build a more inclusive digital future.</p></ScrollReveal>
      <div className="donate-impact__grid">{impacts.map(({ icon: Icon, title, description }, index) => <ScrollReveal key={title} delay={index * 80}><article className="donate-impact__card"><span className="donate-impact__icon"><Icon size={26} aria-hidden="true" /></span><h3>{title}</h3><p>{description}</p></article></ScrollReveal>)}</div>
    </div></section>

    <section className="section donate-give" id="give" tabIndex={-1} aria-labelledby="give-heading"><div className="container donate-give__grid">
      <ScrollReveal className="donate-give__copy"><p className="eyebrow">Give with purpose</p><h2 id="give-heading">Make a Donation</h2><p>Choose an amount that feels right for you. Every contribution is a step toward making digital learning more accessible.</p><div className="donate-security"><ShieldCheck size={26} aria-hidden="true" /><div><h3>Secure payments through Stripe</h3><p>Payments are securely processed through Stripe. ByteBridge does not directly store your card details.</p></div></div><p className="donate-concept">ByteBridge is a student-created nonprofit concept. Online donations are available only when payment processing has been configured.</p></ScrollReveal>
      <div className="donation-panel">
        <p className="eyebrow">A one-time contribution</p>
        <fieldset disabled={locked} className="donation-amounts"><legend>Choose your donation amount</legend>
          <div className="donation-presets">{[10000, 25000, 50000, 100000].map(value => <button type="button" key={value} aria-pressed={selection === value} disabled={Boolean(config && (value < config.minAmount || value > config.maxAmount))} onClick={() => changeAmount(value)}>{formatAmount(value)}</button>)}</div>
          <button type="button" className="donation-custom-toggle" aria-pressed={selection === 'custom'} onClick={() => changeAmount('custom')}>Choose a custom amount</button>
          {selection === 'custom' && <div className="donation-custom"><label htmlFor="custom-amount">Custom amount (PHP)</label><input id="custom-amount" type="text" inputMode="decimal" value={custom} onChange={event => changeAmount('custom', event.target.value)} aria-describedby={valid ? 'amount-help' : 'amount-help amount-error'} aria-invalid={!valid} placeholder="e.g. 350.50" /></div>}
          <p id="amount-help" className="donation-help">{config ? `${formatAmount(config.minAmount)}–${formatAmount(config.maxAmount)}. ` : ''}Amounts are in Philippine pesos. Up to two decimal places.</p>
          {!valid && <p id="amount-error" className="donation-error" role="alert">{config ? `Enter an amount from ${formatAmount(config.minAmount)} to ${formatAmount(config.maxAmount)}.` : 'Enter an amount from ₱100 to ₱100,000.'}</p>}
        </fieldset>
        <p className="donation-total">Selected amount <strong>{valid && amount !== null ? formatAmount(amount) : '—'}</strong></p>
        {configState === 'loading' && <p role="status" className="donation-notice">Checking payment availability…</p>}
        {configState === 'unavailable' && <div className="donation-notice" role="status"><p>Online donations are currently unavailable. Please check back soon.</p><button type="button" className="text-link" onClick={() => { setConfigState('loading'); setConfigAttempt(value => value + 1) }}>Check availability again</button></div>}
        {!request && <button type="button" className="button button-primary donation-continue" disabled={!config || !valid || locked} onClick={() => {
          if (amount !== null) { setStarted(true); setRequest({ amount, requestId: crypto.randomUUID() }) }
        }}>Continue to payment <ArrowRight aria-hidden="true" /></button>}
        {request && <IntentCheckout key={request.requestId} request={request} onLock={setLocked} />}
        <p className="donation-help donation-footnote"><ShieldCheck size={15} aria-hidden="true" /> Payment details stay within Stripe.</p>
      </div>
    </div></section>

    <section className="donate-closing" aria-labelledby="closing-heading"><div className="container"><ScrollReveal><p className="eyebrow">Together, we can open doors</p><h2 id="closing-heading">Every Contribution Makes a Difference.</h2><p>Help build a future where everyone has the chance to learn, connect, and grow through technology.</p><Link to="/about" className="button button-secondary">Meet the purpose behind ByteBridge <ArrowRight aria-hidden="true" /></Link></ScrollReveal></div></section>
  </>
}
