import type { ReactNode } from 'react'
import { contactEmail, mailtoTemplate, organization, type EmailTemplate } from '../data/organization'

/** Facebook "f" mark (Lucide has no brand icons). Decorative: the link carries the accessible name. */
export function FacebookIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.25h3.33l-.53 3.49h-2.8V24C19.62 23.1 24 18.1 24 12.07Z" />
    </svg>
  )
}

/**
 * Visible email address that is also a pre-filled mailto link.
 * The address is assembled in the browser at render time (see contactEmail()).
 */
export function EmailLink({ template = 'general', className }: { template?: EmailTemplate; className?: string }) {
  const email = contactEmail()
  if (!email) return null
  return <a className={className} href={mailtoTemplate(template)}>{email}</a>
}

/** Facebook link that opens in a new tab. */
export function FacebookLink({ className, children }: { className?: string; children?: ReactNode }) {
  const url = organization.contact.facebook
  if (!url) return null
  return (
    <a className={className} href={url} target="_blank" rel="noopener noreferrer">
      <FacebookIcon /><span className="sr-only">ByteBridge on </span>{children ?? 'Facebook'}<span className="sr-only"> (opens in a new tab)</span>
    </a>
  )
}
