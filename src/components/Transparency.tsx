import { BadgeCheck, FileText, Landmark, Mail, ShieldCheck, UserRound, type LucideIcon } from 'lucide-react'
import ScrollReveal from './ScrollReveal'
import SetupHint from './SetupHint'
import { EmailLink, FacebookLink } from './ContactLinks'
import { contactEmail, isRegistered, organization } from '../data/organization'
import { teamMembers } from '../data/team'
import { paymentTestMode } from '../lib/payments'
import '../styles/trust.css'

export default function Transparency() {
  const { legal, contact } = organization
  const items = ([
    [Landmark, 'Registered name', legal.registeredName],
    [BadgeCheck, 'SEC registration', legal.secRegistrationNumber],
    [ShieldCheck, 'BIR donee status', legal.birDoneeStatus],
    [ShieldCheck, 'PCNC accreditation', legal.pcncAccreditation],
    [FileText, 'Solicitation permit', legal.solicitationPermit],
  ] as [LucideIcon, string, string][]).filter(([, , value]) => value)

  return (
    <section className="section transparency-section" id="transparency" tabIndex={-1} aria-labelledby="transparency-heading">
      <div className="container">
        <ScrollReveal>
          <p className="eyebrow">Accountability</p>
          <h2 id="transparency-heading">Transparency <span>&amp; governance.</span></h2>
        </ScrollReveal>

        <dl className="transparency-grid">
          {organization.founder && (
            <div className="transparency-item transparency-item--contact">
              <dt><UserRound size={17} aria-hidden="true" />Founder and contact person</dt>
              <dd>{organization.founder}</dd>
              {(contactEmail() || contact.facebook) && (
                <dd className="transparency-contact">
                  {contactEmail() && <span><Mail size={15} aria-hidden="true" /><EmailLink template="transparency" /></span>}
                  {contact.facebook && <span><FacebookLink /></span>}
                </dd>
              )}
            </div>
          )}
          {items.map(([Icon, label, value]) => (
            <div className="transparency-item" key={label}>
              <dt><Icon size={17} aria-hidden="true" />{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>

        {!isRegistered && (
          <p className="transparency-status">
            ByteBridge is a student-led initiative preparing for formal registration.
            {paymentTestMode && ' Donations are currently in demo mode, and no real payments are processed.'}
            {' '}Once registered, we will publish our registration details and financial reports here.
          </p>
        )}

        {legal.annualReportUrl && (
          <p className="transparency-status">
            <a href={legal.annualReportUrl} target="_blank" rel="noopener noreferrer">Read our latest annual report and financial statements<span className="sr-only"> (opens in a new tab)</span></a>
          </p>
        )}

        <SetupHint field="legal">Add SEC registration, BIR/PCNC status, solicitation permit, and an annual report link once you have them.</SetupHint>
        {teamMembers.length === 0 && <SetupHint field="(src/data/team.ts) teamMembers">Named board or team members build donor trust. Add each confirmed member with their role.</SetupHint>}
      </div>
    </section>
  )
}
