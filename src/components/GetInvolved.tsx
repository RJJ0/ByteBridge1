import { Handshake, HandHeart, Heart, Mail, Newspaper, type LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import ScrollReveal from './ScrollReveal'
import SetupHint from './SetupHint'
import { FacebookIcon } from './ContactLinks'
import { gmailCompose, organization, showSetupHints, type EmailTemplate } from '../data/organization'
import '../styles/trust.css'

type Action =
  | { kind: 'email'; label: string; template: EmailTemplate }
  | { kind: 'external'; label: string; href: string; facebook?: boolean }
  | { kind: 'internal'; label: string; to: string }

interface Way { icon: LucideIcon; title: string; description: string; action: Action | null; setup?: { field: string; note: string } }

export default function GetInvolved() {
  const { getInvolved, contact } = organization
  const followUrl = getInvolved.newsletterUrl || contact.facebook
  const followIsFacebook = followUrl === contact.facebook

  // Build email links at render time so the address only exists in the browser.
  const emailReady = Boolean(gmailCompose('general'))
  const ways: Way[] = [
    {
      icon: HandHeart, title: 'Volunteer',
      description: 'Share what you know. Help run sessions, prepare learning materials, or support learners one-on-one.',
      action: getInvolved.volunteerFormUrl
        ? { kind: 'external', label: 'Volunteer with us', href: getInvolved.volunteerFormUrl }
        : emailReady ? { kind: 'email', label: 'Volunteer with us', template: 'volunteer' } : null,
      setup: { field: 'getInvolved.volunteerFormUrl', note: 'No volunteer form link or contact email yet.' },
    },
    {
      icon: Handshake, title: 'Partner with us',
      description: 'Schools, barangays, and organizations: let’s bring practical digital learning to your community together.',
      action: emailReady ? { kind: 'email', label: 'Start a partnership', template: 'partnership' } : null,
      setup: { field: 'contact', note: 'Partnership enquiries need a contact email.' },
    },
    {
      icon: Newspaper, title: 'Stay updated',
      description: 'Hear about upcoming sessions, events, and what your support makes possible.',
      action: followUrl ? { kind: 'external', label: followIsFacebook ? 'Follow us on Facebook' : 'Get updates', href: followUrl, facebook: followIsFacebook } : null,
      setup: { field: 'getInvolved.newsletterUrl', note: 'No newsletter or Facebook page link yet.' },
    },
    {
      icon: Heart, title: 'Donate',
      description: 'Support learning materials, sessions, and access to technology for more learners.',
      action: { kind: 'internal', label: 'Make a donation', to: '/donate#give' },
    },
  ]
  const visible = ways.filter(way => way.action || showSetupHints)

  return (
    <section className="section involve-section" id="get-involved" tabIndex={-1} aria-labelledby="involve-heading">
      <div className="container">
        <ScrollReveal>
          <p className="eyebrow">Ways to help</p>
          <h2 id="involve-heading">Get <span>involved.</span></h2>
          <p className="involve-intro">There is more than one way to help bridge the digital divide.</p>
        </ScrollReveal>
        <div className="involve-grid">
          {visible.map(({ icon: Icon, title, description, action, setup }, index) => (
            <ScrollReveal key={title} delay={index * 70}>
              <article className="involve-card">
                <span className="involve-card__icon"><Icon size={24} strokeWidth={1.7} aria-hidden="true" /></span>
                <h3>{title}</h3>
                <p>{description}</p>
                {action ? <CardAction action={action} /> : setup && <SetupHint field={setup.field}>{setup.note}</SetupHint>}
              </article>
            </ScrollReveal>
          ))}
        </div>
        <p className="involve-consent">
          We only use the details you share to respond to you. See our <Link to="/privacy">Privacy Policy</Link>.
        </p>
      </div>
    </section>
  )
}

function CardAction({ action }: { action: Action }) {
  if (action.kind === 'internal') {
    return <Link className="button button-secondary involve-card__button" to={action.to}><Heart size={17} aria-hidden="true" />{action.label}</Link>
  }
  if (action.kind === 'external') {
    return (
      <a className="button button-secondary involve-card__button" href={action.href} target="_blank" rel="noopener noreferrer">
        {action.facebook ? <FacebookIcon size={17} /> : null}
        {action.label}
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    )
  }
  return (
    <a className="button button-secondary involve-card__button" href={gmailCompose(action.template)} target="_blank" rel="noopener noreferrer">
      <Mail size={17} aria-hidden="true" />{action.label}
      <span className="sr-only"> (opens Gmail in a new tab)</span>
    </a>
  )
}
