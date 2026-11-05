import { EmailLink } from '../components/ContactLinks'
import { contactEmail, organization } from '../data/organization'
import '../styles/trust.css'

export default function Privacy() {
  const { contact, legal, privacyContact } = organization
  const controller = legal.registeredName || 'ByteBridge'

  return (
    <article className="privacy-page" aria-labelledby="privacy-heading">
      <div className="container privacy-page__inner">
        <p className="eyebrow">Your data, respected</p>
        <h1 id="privacy-heading">Privacy policy</h1>
        <p className="privacy-updated">Last updated: November 5, 2026</p>

        <p>
          {controller} (“ByteBridge”, “we”) respects your privacy. This policy explains what personal information we collect
          through this website, why we collect it, and your rights under the Philippine Data Privacy Act of 2012
          (Republic Act No. 10173) and its Implementing Rules and Regulations.
        </p>

        <h2>Information we collect</h2>
        <ul>
          <li>
            <strong>Card donations.</strong> Card payments are processed by Stripe, Inc. Your card number, expiry date,
            security code, and billing details are entered directly into Stripe’s secure form and are not received or
            stored by ByteBridge. We store only a payment reference, the amount, the currency, and the payment status so
            we can confirm and account for your donation.
          </li>
          <li>
            <strong>GCash, Maya, and bank transfers.</strong> If you donate this way, we receive the details shown on the
            transaction (such as your name, account or mobile number, amount, and date), plus anything you send us with
            your receipt.
          </li>
          <li>
            <strong>Messages and sign-ups.</strong> If you email us, volunteer, ask about a partnership, or join our
            updates, we receive the details you choose to share, such as your name, email address, phone number, and message.
          </li>
          <li>
            <strong>Website use.</strong> This website does not use advertising or analytics cookies. Stripe may set
            cookies on the Donate page to prevent fraud and keep payments secure.
          </li>
        </ul>

        <h2>How we use your information</h2>
        <ul>
          <li>To process, confirm, and record donations, and to send acknowledgements or receipts.</li>
          <li>To reply to your messages and coordinate volunteering or partnerships you asked about.</li>
          <li>To send updates, only if you signed up for them. You can unsubscribe at any time.</li>
          <li>To meet accounting, tax, and other legal obligations.</li>
        </ul>
        <p>We do not sell, rent, or trade your personal information.</p>

        <h2>Who we share it with</h2>
        <p>
          We share information only with service providers that help us run this website and process donations, such as
          Stripe (payments), Vercel (website hosting), and Neon (donation records database). Some of these providers store
          data outside the Philippines; they are bound by their own security and privacy commitments. We may also disclose
          information when required by law.
        </p>

        <h2>How long we keep it</h2>
        <p>
          We keep donation records for as long as required for accounting, audit, and tax purposes. We keep messages and
          sign-up details only as long as needed for the purpose you gave them, or until you ask us to delete them.
        </p>

        <h2>How we protect it</h2>
        <p>
          The website uses encrypted (HTTPS) connections. Payment details are handled by Stripe, a PCI DSS–certified payment
          processor. Access to donation records is limited to the people who need it.
        </p>

        <h2>Your rights</h2>
        <p>Under the Data Privacy Act, you have the right to:</p>
        <ul>
          <li>be informed about how your personal data is processed;</li>
          <li>access the personal data we hold about you;</li>
          <li>correct inaccurate or incomplete data;</li>
          <li>object to processing, or withdraw consent you previously gave;</li>
          <li>have your data erased or blocked, subject to legal record-keeping requirements;</li>
          <li>data portability; and</li>
          <li>file a complaint with the National Privacy Commission (privacy.gov.ph).</li>
        </ul>

        <h2>Contact us</h2>
        <p>
          Privacy questions and requests are handled by <strong>{privacyContact.name}</strong>, {privacyContact.role}.
          {contactEmail()
            ? <> Email <EmailLink template="privacy" />{contact.address ? `, or write to us at ${contact.address}` : ''}.</>
            : ' A dedicated contact email will be published here soon.'}
        </p>
      </div>
    </article>
  )
}
