import { ArrowRight, ArrowUpRight, Mail, MapPin, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'
import Brand from './Brand'
import { EmailLink, FacebookLink } from './ContactLinks'
import { contactEmail, isRegistered, organization } from '../data/organization'
import '../styles/navbar.css'

export default function Footer() {
  const { contact, legal } = organization
  const email = contactEmail()
  const hasContact = Boolean(email || contact.phone || contact.address || contact.facebook || contact.instagram)

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-main">
          <div className="footer-brand">
            <Link className="brand-link" to="/" aria-label="ByteBridge home"><Brand /></Link>
            <p>Bridging the Digital Divide,<br />One Skill at a Time.</p>
          </div>
          <div className="footer-purpose">
            <span className="footer-label">Get in touch</span>
            {hasContact ? (
              <ul className="footer-contact">
                {email && <li><Mail size={16} aria-hidden="true" /><EmailLink template="general" /></li>}
                {contact.phone && <li><Phone size={16} aria-hidden="true" /><a href={`tel:${contact.phone.replace(/[^\d+]/g, '')}`}>{contact.phone}</a></li>}
                {contact.address && <li><MapPin size={16} aria-hidden="true" /><span>{contact.address}</span></li>}
                {contact.facebook && <li className="footer-socials"><FacebookLink className="footer-social-link" /></li>}
                {contact.instagram && (
                  <li className="footer-socials">
                    <a className="footer-social-link" href={contact.instagram} target="_blank" rel="noopener noreferrer">Instagram<ArrowUpRight size={14} aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a>
                  </li>
                )}
              </ul>
            ) : (
              <p>Making digital learning more accessible, so more people can move forward with confidence.</p>
            )}
          </div>
          <nav className="footer-navigation" aria-label="Footer navigation">
            <Link to="/">Home <ArrowRight size={16} aria-hidden="true" /></Link>
            <Link to="/about">About Us <ArrowRight size={16} aria-hidden="true" /></Link>
            <Link to="/donate#give">Donate <ArrowRight size={16} aria-hidden="true" /></Link>
            <Link to="/#get-involved">Get Involved <ArrowRight size={16} aria-hidden="true" /></Link>
            <Link to="/about#transparency">Transparency <ArrowRight size={16} aria-hidden="true" /></Link>
            <Link to="/privacy">Privacy Policy <ArrowRight size={16} aria-hidden="true" /></Link>
          </nav>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} {legal.registeredName || 'ByteBridge'}.</p>
          <p>
            {isRegistered
              ? `SEC Reg. No. ${legal.secRegistrationNumber}${legal.birDoneeStatus ? ` · ${legal.birDoneeStatus}` : ''}`
              : 'A student-led initiative preparing for formal registration.'}
            {' · '}<Link className="footer-credit" to="/credits">Image credits</Link>
          </p>
        </div>
      </div>
    </footer>
  )
}
