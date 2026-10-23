import { useEffect, useRef, useState, type FormEvent } from 'react'
import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { useNavigate } from 'react-router-dom'
import { formatAmount } from '../lib/payments'

interface DonationProps {
  amount: number
  clientSecret: string
  reference: string
  onLock: (locked: boolean) => void
}

export default function Donation({ amount, clientSecret, reference, onLock }: DonationProps) {
  const navigate = useNavigate()
  const successUrl = `/donation/success?reference=${encodeURIComponent(reference)}`
  const stripe = useStripe()
  const elements = useElements()
  const mounted = useRef(false)
  const submitting = useRef(false)
  const [ready, setReady] = useState(false)
  const [loading, setLoading] = useState(false)
  const [terminal, setTerminal] = useState(false)
  const [message, setMessage] = useState('')
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    mounted.current = true
    return () => { mounted.current = false }
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!stripe || !elements || !ready || submitting.current || terminal) return
    submitting.current = true
    setLoading(true)
    onLock(true)
    setMessage('')
    setFailed(false)
    let keepLocked = false
    try {
      const current = await stripe.retrievePaymentIntent(clientSecret)
      if (!mounted.current) return
      if (current.error || !current.paymentIntent || current.paymentIntent.amount !== amount
        || current.paymentIntent.currency !== 'php') {
        keepLocked = true
        setTerminal(true)
        setFailed(true)
        setMessage('The payment total could not be verified. Please reload before trying again.')
        return
      }
      if (current.paymentIntent.status === 'succeeded' || current.paymentIntent.status === 'processing') {
        keepLocked = true
        setTerminal(true)
        if (current.paymentIntent.status === 'succeeded') navigate(successUrl, { replace: true })
        else setMessage('Your payment is processing. Please do not submit another donation.')
        return
      }
      if (current.paymentIntent.status === 'canceled') {
        keepLocked = true
        setTerminal(true)
        setFailed(true)
        setMessage('This payment was canceled. Please reload before trying again.')
        return
      }
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: { return_url: `${window.location.origin}${successUrl}` },
        redirect: 'if_required',
      })
      if (!mounted.current) return
      if (error) {
        setFailed(true)
        setMessage(error.message ?? 'Payment could not be completed. Please check your payment details.')
      } else if (paymentIntent?.status === 'requires_payment_method') {
        setFailed(true)
        setMessage('Payment could not be completed. Please check your payment details and try again.')
      } else if (paymentIntent?.status === 'canceled') {
        keepLocked = true
        setTerminal(true)
        setFailed(true)
        setMessage('This payment was canceled. Please reload before trying again.')
      } else {
        keepLocked = true
        setTerminal(true)
        if (paymentIntent?.status === 'succeeded') navigate(successUrl, { replace: true })
        else setMessage('Your payment is processing or awaiting confirmation. Please do not submit another donation.')
      }
    } catch {
      // A network failure may happen after payment. Keep this intent locked until status is checked.
      keepLocked = true
      if (mounted.current) {
        setTerminal(true)
        setFailed(true)
        setMessage('We could not confirm your payment status. Please check with your payment provider before retrying.')
      }
    } finally {
      submitting.current = false
      if (mounted.current) {
        setLoading(false)
        onLock(keepLocked)
      }
    }
  }

  return (
    <form className="donation-payment" onSubmit={handleSubmit} aria-busy={loading}>
      <PaymentElement onReady={() => setReady(true)} onLoadError={() => {
        setReady(false)
        setFailed(true)
        setMessage('Payment details could not load. Please reload the page to try again.')
      }} />
      <p className="donation-total">Your one-time donation <strong>{formatAmount(amount)}</strong></p>
      <button className="button button-primary" type="submit" disabled={!stripe || !elements || !ready || loading || terminal}>
        {loading ? 'Processing…' : terminal ? 'Payment status pending' : 'Donate Now'}
      </button>
      {message && <p className={failed ? 'donation-error' : 'donation-notice'} role={failed ? 'alert' : 'status'}>{message}</p>}
      {terminal && <a className="text-link" href={successUrl}>Check payment status</a>}
    </form>
  )
}
