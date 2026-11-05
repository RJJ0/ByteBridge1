import ScrollReveal from './ScrollReveal'
import { organization } from '../data/organization'
import '../styles/trust.css'

/** First-year goals and the planned workshop format. Everything here is framed as a plan, not a result. */
export default function ImpactSection() {
  const { goals, workshopSteps } = organization.impact
  if (!goals.length && !workshopSteps.length) return null

  return (
    <section className="section impact-section" id="goals" tabIndex={-1} aria-labelledby="goals-heading">
      <div className="container">
        <ScrollReveal>
          <p className="eyebrow">Our first-year goals</p>
          <h2 id="goals-heading">What we’re <span>working toward.</span></h2>
          <p className="impact-intro">These are targets for our first year, not results we have achieved yet. We’ll report real progress here as it happens.</p>
        </ScrollReveal>

        {goals.length > 0 && (
          <dl className="impact-stats">
            {goals.map(goal => (
              <div key={goal.label} className="impact-stat">
                <dt><span className="impact-stat__tag">Goal</span>{goal.label}</dt>
                <dd>{goal.value}</dd>
              </div>
            ))}
          </dl>
        )}

        {workshopSteps.length > 0 && (
          <div className="workshop">
            <h3 className="workshop__heading">How a workshop works</h3>
            <p className="workshop__intro">Each planned workshop follows four practical steps.</p>
            <ol className="workshop__steps">
              {workshopSteps.map((step, index) => (
                <li key={step.title} className="workshop__step">
                  <span className="workshop__number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                  <h4>{step.title}</h4>
                  <p>{step.description}</p>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </section>
  )
}
