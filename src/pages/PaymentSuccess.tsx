import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getStripe } from '../lib/payments'
import '../styles/donate.css'

export default function PaymentSuccess() {
  const [message, setMessage] = useState('Checking your payment securely with Stripe…')
  const [attempt, setAttempt] = useState(0)
  const [secret] = useState(() => new URLSearchParams(window.location.search).get('payment_intent_client_secret'))
  useEffect(() => {
    let active = true
    // Keep Stripe's return secret in memory, away from subsequent history/referrer URLs.
    window.history.replaceState(window.history.state, '', window.location.pathname)
    async function check() {
      try {
        if (!secret) throw new Error('Missing payment reference')
        const stripe = await getStripe()
        if (!stripe) throw new Error('Unavailable')
        const { paymentIntent, error } = await stripe.retrievePaymentIntent(secret)
        if (error || !paymentIntent || paymentIntent.currency !== 'php') throw new Error('Unverified')
        if (active) setMessage(paymentIntent.status === 'succeeded'
          ? 'Thank you! Stripe confirms your payment succeeded.'
          : paymentIntent.status === 'processing'
            ? 'Your payment is still processing. Please check with your payment provider before making another donation.'
            : 'Your payment has not completed. Please check with your payment provider before retrying.')
      } catch {
        if (active) setMessage('We could not verify a payment. Please check with your payment provider before retrying.')
      }
    }
    void check()
    return () => { active = false }
  }, [attempt, secret])

  return <section className="section donate-status"><div className="container"><div className="donation-panel"><p className="eyebrow">Your contribution</p><h1>Payment Status</h1><p role="status">{message}</p><button className="button button-secondary" onClick={() => setAttempt(value => value + 1)}>Check status again</button><Link className="text-link" to="/">Return to Home</Link></div></div></section>
}
