import { imageCredits } from '../data/credits'
import '../styles/trust.css'

export default function Credits() {
  return (
    <article className="privacy-page" aria-labelledby="credits-heading">
      <div className="container privacy-page__inner">
        <p className="eyebrow">Thank you, creators</p>
        <h1 id="credits-heading">Image credits</h1>
        <p>
          The photographs on this website are illustrative stock images. The people shown are not ByteBridge
          participants, staff, or endorsers. Photos have been cropped and compressed for the web.
        </p>
        <ul className="credits-list">
          {imageCredits.map(credit => (
            <li key={credit.file} className="credits-item">
              <h2>{credit.title}</h2>
              <p>
                Photo by {credit.author} · <a href={credit.source} target="_blank" rel="noopener noreferrer">View on Unsplash<span className="sr-only"> (opens in a new tab)</span></a>
                {' · '}<a href={credit.licenseUrl} target="_blank" rel="noopener noreferrer">{credit.license}<span className="sr-only"> (opens in a new tab)</span></a>
              </p>
              <p>Used on: {credit.usedFor}</p>
            </li>
          ))}
        </ul>
        <h2>Fonts and icons</h2>
        <p>
          Plus Jakarta Sans, licensed under the SIL Open Font License 1.1. Icons from Lucide, licensed under the ISC License.
        </p>
      </div>
    </article>
  )
}
