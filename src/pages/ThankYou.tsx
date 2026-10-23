import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import thankYouImage from '../../thankyou.jpg'
import { apiUrl, formatAmount } from '../lib/payments'
import '../styles/thank-you.css'

interface PaymentStatus { status: string; amount: number | null }

export default function ThankYou() {
  const navigate = useNavigate()
  const [credentials] = useState(() => {
    const params = new URLSearchParams(window.location.search)
    const reference = params.get('reference')
    return reference ? { reference } : { clientSecret: params.get('payment_intent_client_secret') }
  })
  const [result, setResult] = useState<PaymentStatus | null>(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    // Remove Stripe return secrets and claimed statuses before any subsequent navigation.
    const safeQuery = credentials.reference ? `?reference=${encodeURIComponent(credentials.reference)}` : ''
    window.history.replaceState(window.history.state, '', `${window.location.pathname}${safeQuery}`)
    async function verify() {
      try {
        if (!apiUrl || (!credentials.reference && !credentials.clientSecret)) throw new Error('Missing reference')
        const response = await fetch(`${apiUrl}/donation-status`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(credentials),
          signal: AbortSignal.any([controller.signal, AbortSignal.timeout(15000)]),
        })
        if (!response.ok) throw new Error('Unverified')
        const data = await response.json()
        if (data.currency !== 'php' || typeof data.status !== 'string'
          || typeof data.reference !== 'string' || !/^pi_[A-Za-z0-9]+\.[a-f0-9]{64}$/.test(data.reference)
          || (data.status === 'succeeded' && (!Number.isSafeInteger(data.amount) || data.amount <= 0 || data.amount > 99999999))) {
          throw new Error('Invalid verification')
        }
        if (!controller.signal.aborted) {
          setResult({ status: data.status, amount: data.status === 'succeeded' ? data.amount : null })
          // A signed, read-only reference supports refresh without retaining a client secret.
          navigate(`/donation/success?reference=${encodeURIComponent(data.reference)}`, { replace: true })
        }
      } catch {
        if (!controller.signal.aborted) setResult({ status: 'unverified', amount: null })
      }
    }
    void verify()
    return () => controller.abort()
  }, [attempt, credentials, navigate])

  const succeeded = result?.status === 'succeeded'
  const message = !result ? 'Checking your payment securely with Stripe…'
    : succeeded ? 'Your generosity helps make digital skills and technology more accessible to everyone.'
      : result.status === 'processing' ? 'Your payment is still processing. Please check its status before making another donation.'
        : result.status === 'unverified' ? 'We could not verify a payment. Please check with your payment provider before retrying.'
          : result.status === 'canceled' ? 'This payment was canceled. No successful donation has been confirmed.'
            : 'Your payment has not completed. Return to Donation to check your payment details.'

  return <section className="thank-you" aria-labelledby="thank-you-heading">
    <div className="container thank-you__grid">
      <div className="thank-you__copy" aria-live="polite" aria-busy={!result}>
        <p className="eyebrow">Your contribution</p>
        <h1 id="thank-you-heading">{succeeded ? 'Thank you!' : 'Payment status'}</h1>
        <p className="thank-you__message">{message}</p>
        {succeeded && result.amount !== null && <p className="thank-you__amount">Confirmed donation <strong>{formatAmount(result.amount)}</strong></p>}
        <div className="thank-you__actions">
          <Link className="button button-primary" to={succeeded ? '/' : '/donate#give'}>{succeeded ? 'Back to Home' : 'Back to Donation'}<ArrowUpRight aria-hidden="true" /></Link>
          {result && !succeeded && <button className="text-link thank-you__retry" onClick={() => { setResult(null); setAttempt(value => value + 1) }}>Check status again</button>}
        </div>
      </div>
      <div className="thank-you__art" aria-hidden="true">
        <div className="thank-you__window">
          <img className="thank-you__image" src={thankYouImage} width="736" height="736" alt="" />
        </div>
        <p>Small steps. <strong>Shared possibilities.</strong></p>
      </div>
    </div>
  </section>
}
