import { Landmark, Wallet } from 'lucide-react'
import SetupHint from './SetupHint'
import { EmailLink } from './ContactLinks'
import { contactEmail, organization, type EWallet } from '../data/organization'
import '../styles/trust.css'

function WalletMethod({ name, wallet }: { name: string; wallet: EWallet }) {
  return (
    <div className="local-method">
      {wallet.qrImage && <img src={wallet.qrImage} width="192" height="192" alt={`${name} QR code for ${wallet.accountName}`} loading="lazy" decoding="async" />}
      <div>
        <h4><Wallet size={17} aria-hidden="true" />{name}</h4>
        <dl>
          <dt>Name</dt><dd>{wallet.accountName}</dd>
          <dt>Number</dt><dd>{wallet.number}</dd>
        </dl>
      </div>
    </div>
  )
}

/** GCash, Maya, and bank transfer details for donors without a card. */
export default function LocalPayments() {
  const { gcash, maya, bank } = organization.localPayments
  const hasGcash = Boolean(gcash.number && gcash.accountName)
  const hasMaya = Boolean(maya.number && maya.accountName)
  const hasBank = Boolean(bank.bankName && bank.accountName && bank.accountNumber)
  const any = hasGcash || hasMaya || hasBank

  if (!any) {
    return <SetupHint field="localPayments">GCash, Maya, and bank transfer details are empty, so only card payments are shown.</SetupHint>
  }

  return (
    <div className="local-payments" aria-labelledby="local-payments-heading">
      <h3 id="local-payments-heading">Other ways to give</h3>
      <p>No card? Send your donation directly through GCash, Maya, or bank transfer.</p>
      <div className="local-payments__grid">
        {hasGcash && <WalletMethod name="GCash" wallet={gcash} />}
        {hasMaya && <WalletMethod name="Maya" wallet={maya} />}
        {hasBank && (
          <div className="local-method">
            <div>
              <h4><Landmark size={17} aria-hidden="true" />Bank transfer</h4>
              <dl>
                <dt>Bank</dt><dd>{bank.bankName}</dd>
                <dt>Name</dt><dd>{bank.accountName}</dd>
                <dt>Account</dt><dd>{bank.accountNumber}</dd>
              </dl>
            </div>
          </div>
        )}
      </div>
      <p className="local-payments__note">
        {contactEmail()
          ? <>After sending, email a screenshot of your receipt to <EmailLink /> so we can thank you and record your gift.</>
          : 'Keep your transaction receipt for your records.'}
      </p>
    </div>
  )
}
