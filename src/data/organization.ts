/**
 * Organization details shown across the site.
 *
 * Fill in ONLY real, verified information. Empty values are hidden on the live
 * site; while running `npm run dev`, each empty value shows a dashed
 * "setup" box so you can see where it will appear.
 */

export interface Goal { value: string; label: string }
export interface WorkshopStep { title: string; description: string }
export interface GivingExample { amount: string; outcome: string }
export interface EWallet { accountName: string; number: string; /** Optional QR image path, e.g. /images/payments/gcash-qr.png */ qrImage?: string }

export const organization = {
  name: 'ByteBridge',
  siteUrl: 'https://byte-bridge1.vercel.app',
  founder: 'Richard Jebolan',

  /** Person responsible for privacy questions under the Data Privacy Act. */
  /** Privacy requests go to the shared contact email (see contactEmail()). */
  privacyContact: { name: 'Richard Jebolan', role: 'Founder and Data Protection Contact' },

  legal: {
    /** Exact registered name, e.g. "ByteBridge Digital Literacy Foundation, Inc." */
    registeredName: '',
    /** SEC registration number. When set, the site shows registration details instead of the "preparing for registration" statement. */
    secRegistrationNumber: '',
    /** e.g. "BIR-accredited donee institution (Certificate No. …)" */
    birDoneeStatus: '',
    /** e.g. "PCNC-accredited until 2028" */
    pcncAccreditation: '',
    /** DSWD solicitation permit number, if required for public fundraising. */
    solicitationPermit: '',
    /** Link to the latest annual report or audited financial statements (PDF). */
    annualReportUrl: '',
  },

  contact: {
    /**
     * Contact email (bytebridge8 at gmail.com), stored in two parts and joined at
     * runtime by contactEmail() so the full address never appears as a single
     * string in the source or the built files, which deters simple spam scrapers.
     */
    emailUser: 'bytebridge8',
    emailDomain: 'gmail.com',
    /** Leave empty until there is a real number. Empty values stay hidden. */
    phone: '',
    /** City or campus address. Leave empty until confirmed. */
    address: '',
    facebook: 'https://www.facebook.com/profile.php?id=61596104948298',
    instagram: '',
  },

  /** Local payment methods shown on the Donate page alongside card payments. */
  localPayments: {
    gcash: { accountName: '', number: '', qrImage: '' } as EWallet,
    maya: { accountName: '', number: '', qrImage: '' } as EWallet,
    bank: { bankName: '', accountName: '', accountNumber: '' },
  },

  impact: {
    /**
     * First-year GOALS. These are targets, not results. Once you have real
     * results, report them separately and label them as achieved.
     */
    goals: [
      { value: '150', label: 'students and young adults to reach' },
      { value: '10', label: 'hands-on workshops to hold' },
      { value: '3', label: 'partner schools or communities' },
      { value: '3', label: 'free learning modules to publish' },
    ] as Goal[],
    /** How a planned workshop works. */
    workshopSteps: [
      { title: 'Computer and internet basics', description: 'Get comfortable with the essentials: using files and folders, browsing the web, sending email, and finding reliable information.' },
      { title: 'Online safety', description: 'Create strong passwords, review privacy settings, and learn to spot scams and suspicious messages before they cause harm.' },
      { title: 'Introduction to coding', description: 'A beginner-friendly first look at how programs work, through simple, guided activities that need no prior experience.' },
      { title: 'Practice and next steps', description: 'Complete a small hands-on task, then leave with take-home materials and free resources to keep learning.' },
    ] as WorkshopStep[],
    /** Planned uses of donations. Phrase as what a gift COULD do. */
    givingExamples: [
      { amount: '₱500', outcome: 'could print learning materials for one workshop' },
      { amount: '₱1,000', outcome: 'could cover mobile data for a workshop’s online activities' },
      { amount: '₱2,500', outcome: 'could help fund a full workshop day for a partner school' },
    ] as GivingExample[],
  },

  getInvolved: {
    /** Volunteer signup form (e.g. a Google Form). When empty, the Volunteer card opens a pre-filled email draft instead. */
    volunteerFormUrl: '',
    /** Where to follow updates. */
    newsletterUrl: 'https://www.facebook.com/profile.php?id=61596104948298',
  },

  /** Pre-filled email drafts. Each body line becomes a separate line in the draft. */
  emailTemplates: {
    general: { subject: 'Inquiry – ByteBridge', body: [] as string[] },
    transparency: { subject: 'Transparency Inquiry – ByteBridge', body: [] as string[] },
    privacy: { subject: 'Privacy Request – ByteBridge', body: [] as string[] },
    volunteer: {
      subject: 'Volunteer inquiry',
      body: ['Hi ByteBridge team,', '', "I'd like to volunteer.", '', 'Name:', 'School / background:', "What I'd like to help with:", '', 'Thank you!'],
    },
    partnership: {
      subject: 'Partnership inquiry',
      body: ['Hi ByteBridge team,', '', "We're interested in partnering with you.", '', 'Organization name:', 'Location:', 'What we have in mind:', '', 'Thank you!'],
    },
  },
}

export const isRegistered = Boolean(organization.legal.secRegistrationNumber)
export const showSetupHints = import.meta.env.DEV

/** The contact email, assembled at runtime from its two parts. Empty string if not configured. */
export function contactEmail() {
  const { emailUser, emailDomain } = organization.contact
  return emailUser && emailDomain ? [emailUser, emailDomain].join('@') : ''
}

/** Line break used in email bodies (encodes to %0D%0A). */
const CRLF = String.fromCharCode(13, 10)

/** Strict percent-encoding: also encodes ! ' ( ) * which encodeURIComponent leaves as-is. */
const encode = (value: string) => encodeURIComponent(value).replace(/[!'()*]/g, char => `%${char.charCodeAt(0).toString(16).toUpperCase()}`)

/**
 * Builds a mailto link with an encoded subject and body. Line breaks become %0D%0A.
 * Call at render time (not at module load) so the address is only built in the browser.
 */
export function mailto(subject?: string, bodyLines: string[] = []) {
  const email = contactEmail()
  if (!email) return ''
  const params = [
    subject ? `subject=${encode(subject)}` : '',
    bodyLines.length ? `body=${encode(bodyLines.join(CRLF))}` : '',
  ].filter(Boolean).join('&')
  return `mailto:${email}${params ? `?${params}` : ''}`
}

export type EmailTemplate = keyof typeof organization.emailTemplates
export const mailtoTemplate = (template: EmailTemplate) => {
  const { subject, body } = organization.emailTemplates[template]
  return mailto(subject, body)
}

/**
 * Gmail compose link with the draft pre-filled. Works in any browser, even
 * without a default email app. Built at render time, like mailto().
 */
export function gmailCompose(template: EmailTemplate) {
  const email = contactEmail()
  if (!email) return ''
  const { subject, body } = organization.emailTemplates[template]
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${encode(email)}&su=${encode(subject)}&body=${encode(body.join(CRLF))}`
}
