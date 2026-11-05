
import { useEffect, useRef } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'

import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Donate from './pages/Donate'
import PaymentSuccess from './pages/PaymentSuccess'
import ThankYou from './pages/ThankYou'
import Home from './pages/Home'
import About from './pages/About'
import Privacy from './pages/Privacy'
import NotFound from './pages/NotFound'
import Credits from './pages/Credits'

const pageMeta: Record<string, [title: string, description: string]> = {
  '/': ['ByteBridge | Digital Skills for Filipino Learners', 'ByteBridge is a student-led initiative working to help Filipino students and underserved communities build practical digital skills: computer basics, online safety, and a first introduction to coding.'],
  '/about': ['About Us | ByteBridge', 'Discover the purpose, principles, people, and transparency details behind ByteBridge.'],
  '/donate': ['Donate | ByteBridge', 'Help bridge the digital divide. Donate securely to support practical digital learning for Filipino students and communities.'],
  '/credits': ['Image Credits | ByteBridge', 'Sources and licenses for the photos and fonts used on the ByteBridge website.'],
  '/privacy': ['Privacy Policy | ByteBridge', 'How ByteBridge collects, uses, and protects personal information under the Philippine Data Privacy Act of 2012.'],
  '/payment-success': ['Payment Status | ByteBridge', 'Check the status of your donation securely through Stripe.'],
  '/donation/success': ['Payment Status | ByteBridge', 'Check the status of your donation securely through Stripe.'],
}
const notFoundMeta: [string, string] = ['Page Not Found | ByteBridge', 'The page you are looking for could not be found.']

// Handle route effects
function RouteEffects() {
  const location = useLocation()
  const firstVisit = useRef(true)

  useEffect(() => {
    const [title, description] = pageMeta[location.pathname] ?? notFoundMeta
    document.title = title
    document.querySelector('meta[name="description"]')?.setAttribute('content', description)

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
          <Route path="/donation/success" element={<ThankYou />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/credits" element={<Credits />} />
          <Route path="/donation" element={<Navigate to="/donate" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer />
    </BrowserRouter>
  )
}
