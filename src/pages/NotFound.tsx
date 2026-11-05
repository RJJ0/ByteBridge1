import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import '../styles/trust.css'

export default function NotFound() {
  return (
    <section className="not-found" aria-labelledby="not-found-heading">
      <div className="container">
        <p className="eyebrow">Error 404</p>
        <h1 id="not-found-heading">Page not <span className="accent-text">found.</span></h1>
        <p>The page you’re looking for doesn’t exist or may have moved. Check the address, or head to one of these pages.</p>
        <div className="not-found__actions">
          <Link className="button button-primary" to="/">Back to Home <ArrowRight aria-hidden="true" /></Link>
          <Link className="text-link" to="/donate#give">Donate <ArrowRight aria-hidden="true" /></Link>
          <Link className="text-link" to="/about">About Us <ArrowRight aria-hidden="true" /></Link>
        </div>
      </div>
    </section>
  )
}
