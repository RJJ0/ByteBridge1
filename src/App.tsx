
import { useEffect, useRef } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'

import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Donate from './pages/Donate'
import PaymentSuccess from './pages/PaymentSuccess'
import Home from './pages/Home'
import About from './pages/About'

// Handle route effects
function RouteEffects() {
  const location = useLocation()
  const firstVisit = useRef(true)

  useEffect(() => {
    const isAbout = location.pathname === '/about'
    const isDonate = location.pathname === '/donate'
    const isPayment = location.pathname === '/payment-success'

    document.title = isPayment ? 'Payment Status | ByteBridge' : isDonate ? 'Donation | ByteBridge' : isAbout
      ? 'About Us | ByteBridge'
      : 'ByteBridge | Digital Skills for Everyone'

    document.querySelector('meta[name="description"]')?.setAttribute(
      'content',
      isPayment ? 'Check the status of your donation securely through Stripe.' : isDonate ? 'Help bridge the digital divide through digital education, technology access, and community empowerment.' : isAbout
        ? 'Discover the purpose, principles, and student-led team behind ByteBridge.'
        : 'Bridging the digital divide, one skill at a time. Explore ByteBridge.'
    )

    const shouldFocus = !firstVisit.current || Boolean(location.hash)

    const frame = requestAnimationFrame(() => {
      const target = location.hash
        ? document.getElementById(location.hash.slice(1))
        : null

      const reducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches

      if (target) {
        target.scrollIntoView({
          behavior: reducedMotion ? 'instant' : 'smooth',
        })
      } else {
        window.scrollTo({ top: 0, behavior: 'instant' })
      }

      if (shouldFocus) {
        (target ?? document.getElementById('main-content'))?.focus()
      }

      firstVisit.current = false
    })

    return () => cancelAnimationFrame(frame)
  }, [location.pathname, location.hash, location.key])

  return null
}

// Main App
export default function App() {
  return (
    <BrowserRouter>
      <RouteEffects />

      <a className="skip-link" href="#main-content">
        Skip to content
      </a>

      <Navbar />

      <main id="main-content" tabIndex={-1}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />

          {/* Stripe Donation Page */}
          <Route
            path="/donate"
            element={<Donate />}
          />

          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />
        </Routes>
      </main>

      <Footer />
    </BrowserRouter>
  )
}
