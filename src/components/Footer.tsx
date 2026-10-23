import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import Brand from './Brand'
import '../styles/navbar.css'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-main">
          <div className="footer-brand">
            <Link className="brand-link" to="/" aria-label="ByteBridge home"><Brand /></Link>
            <p>Bridging the Digital Divide,<br />One Skill at a Time.</p>
          </div>
          <div className="footer-purpose">
            <span className="footer-label">SMALL STEPS. SHARED POSSIBILITIES.</span>
            <p>Making digital learning more accessible, so more people can move forward with confidence.</p>
          </div>
          <nav className="footer-navigation" aria-label="Footer navigation">
            <Link to="/">Home <ArrowUpRight size={16} aria-hidden="true" /></Link>
            <Link to="/about">About Us <ArrowUpRight size={16} aria-hidden="true" /></Link>
            <Link to="/donate">Donation <ArrowUpRight size={16} aria-hidden="true" /></Link>
          </nav>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} ByteBridge.</p>
          <p>A student-created nonprofit concept. Built with purpose.</p>
        </div>
      </div>
    </footer>
  )
}
