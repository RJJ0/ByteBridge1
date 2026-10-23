import { Link } from 'react-router-dom'
import {
  Accessibility,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Code2,
  Compass,
  HeartHandshake,
  Lightbulb,
  PenTool,
  ShieldCheck,
  Target,
  UsersRound,
} from 'lucide-react'
import ScrollReveal from '../components/ScrollReveal'
import TeamCard from '../components/TeamCard'
import { teamMembers } from '../data/team'
import '../styles/about.css'

const values = [
  {
    icon: Accessibility,
    title: 'Accessibility',
    description: 'Technology knowledge should be understandable and available to everyone. Clear language and different ways to learn can make a meaningful difference.',
  },
  {
    icon: Lightbulb,
    title: 'Empowerment',
    description: 'Digital skills help people feel more confident and independent. We believe in making room for questions, curiosity, and the courage to try.',
  },
  {
    icon: HeartHandshake,
    title: 'Collaboration',
    description: 'Communities grow stronger when people share what they know. Every learner brings a perspective, and everyone has something to contribute.',
  },
  {
    icon: ShieldCheck,
    title: 'Responsibility',
    description: 'Technology should be used safely, ethically, and thoughtfully. Respect for privacy, careful judgment, and kindness belong in every digital space.',
  },
]

const responsibilities = [
  {
    icon: BookOpen,
    title: 'Research & content',
    description: 'Making digital concepts clear, useful, and grounded in reliable information.',
  },
  {
    icon: PenTool,
    title: 'Design & storytelling',
    description: 'Shaping a welcoming experience that puts people and understanding first.',
  },
  {
    icon: Code2,
    title: 'Technology & accessibility',
    description: 'Connecting thoughtful design with a responsive, accessible web experience.',
  },
]

export default function About() {
  return (
    <>
      <section className="about-hero" aria-labelledby="about-heading">
        <div className="container">
          <div className="about-hero__topline">
            <p className="eyebrow">Who we are</p>
            <span className="about-hero__badge"><span /> Student-led. Community-minded.</span>
          </div>
          <div className="about-hero__grid">
            <div className="about-hero__copy">
              <h1 id="about-heading">Technology Connects Us.<br /><span>People Move Us Forward.</span></h1>
              <p className="about-hero__description">Discover the purpose, principles, and people behind ByteBridge.</p>
              <a className="about-hero__link" href="#our-story">Get to know ByteBridge <ArrowRight size={18} aria-hidden="true" /></a>
            </div>
            <div className="about-hero__aside">
              <div className="about-bridge" aria-hidden="true">
                <div className="about-bridge__orbit" />
                <div className="about-bridge__path" />
                <span className="about-bridge__node about-bridge__node--blue"><UsersRound size={30} strokeWidth={1.6} /></span>
                <span className="about-bridge__node about-bridge__node--mint"><Lightbulb size={30} strokeWidth={1.6} /></span>
                <span className="about-bridge__spark">+</span>
              </div>
              <p>Different starting points.<br /><strong>Shared possibilities.</strong></p>
            </div>
          </div>
        </div>
      </section>

      <section className="section about-story" id="our-story" tabIndex={-1} aria-labelledby="story-heading">
        <div className="container about-story__grid">
          <ScrollReveal className="about-story__visual">
            <figure>
              <img
                src="/images/collaborative-learning.jpg"
                alt="A group of young adults collaborating around laptops at a shared table"
                width="1200"
                height="800"
                loading="lazy"
                decoding="async"
              />
              <figcaption><span className="about-story__caption-icon"><HeartHandshake size={23} aria-hidden="true" /></span><span>Progress begins with<br /><strong>learning together.</strong></span></figcaption>
            </figure>
            <span className="about-story__image-note">Illustrative learning photography</span>
          </ScrollReveal>
          <ScrollReveal className="about-story__copy" delay={120}>
            <p className="eyebrow">Our story</p>
            <h2 id="story-heading">Built on the Belief That Digital Knowledge Should Be Accessible.</h2>
            <p>Knowing how to use technology can turn an everyday task into a new possibility: finding a learning resource, creating a first résumé, or recognizing an unsafe message.</p>
            <p>ByteBridge is a student-created nonprofit concept inspired by these possibilities. It explores how practical digital education could support Filipino students, young adults, and communities with limited access to learning opportunities.</p>
            <p>Our starting point is simple: students can contribute by sharing clear information, encouraging responsible technology use, and making space for others to learn. This website presents that purpose and our proposed approach.</p>
            <div className="about-story__note"><span /> A student project with a people-first purpose.</div>
          </ScrollReveal>
        </div>
      </section>

      <section className="section about-purpose" aria-labelledby="purpose-heading">
        <div className="container">
          <ScrollReveal className="about-section-heading">
            <p className="eyebrow">Our direction</p>
            <h2 id="purpose-heading">A clear purpose.<br />A more inclusive future.</h2>
          </ScrollReveal>
          <div className="about-purpose__grid">
            <ScrollReveal className="about-purpose__reveal">
              <article className="purpose-card purpose-card--mission">
                <div className="purpose-card__top"><span className="purpose-card__icon"><Target size={27} strokeWidth={1.7} aria-hidden="true" /></span><span>01 / Our mission</span></div>
                <h3>To make digital knowledge and practical technology skills accessible to more people.</h3>
                <p>We aim to help learners build useful everyday skills, navigate online spaces safely, and discover what technology can make possible.</p>
              </article>
            </ScrollReveal>
            <ScrollReveal className="about-purpose__reveal" delay={100}>
              <article className="purpose-card purpose-card--vision">
                <div className="purpose-card__top"><span className="purpose-card__icon"><Compass size={27} strokeWidth={1.7} aria-hidden="true" /></span><span>02 / Our vision</span></div>
                <h3>A future where technology serves as a bridge to education, confidence, and opportunity.</h3>
                <p>A future where a person’s background or financial situation does not define their ability to participate in the digital world.</p>
              </article>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <section className="section about-values" aria-labelledby="values-heading">
        <div className="container">
          <ScrollReveal className="about-section-heading about-section-heading--split">
            <div><p className="eyebrow">Our core values</p><h2 id="values-heading">What We Believe In.</h2></div>
            <p>Four principles that shape how we think about technology, learning, and community.</p>
          </ScrollReveal>
          <div className="about-values__grid">
            {values.map(({ icon: Icon, title, description }, index) => (
              <ScrollReveal key={title} delay={index * 70}>
                <article className="value-card">
                  <span className="value-card__icon"><Icon size={25} strokeWidth={1.7} aria-hidden="true" /></span>
                  <span className="value-card__number" aria-hidden="true">0{index + 1}</span>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </article>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section about-team" id="team" tabIndex={-1} aria-labelledby="team-heading">
        <div className="container">
          <ScrollReveal className="about-section-heading about-section-heading--center">
            <p className="eyebrow">The people behind the purpose</p>
            <h2 id="team-heading">The Minds Behind ByteBridge.</h2>
            <p>A student-led concept, shaped by curiosity, shared responsibility, and the belief that knowledge is better when it is shared.</p>
          </ScrollReveal>
          {teamMembers.length > 0 ? (
            <div className="team-grid">
              {teamMembers.map((member, index) => (
                <ScrollReveal key={member.id} delay={Math.min(index, 3) * 70}>
                  <TeamCard member={member} />
                </ScrollReveal>
              ))}
            </div>
          ) : (
            <ScrollReveal>
              <div className="team-introduction">
                <div className="team-introduction__lead">
                  <span className="team-introduction__icon"><UsersRound size={29} strokeWidth={1.7} aria-hidden="true" /></span>
                  <div><h3>A shared purpose. Different strengths.</h3><p>ByteBridge brings together the perspectives of student creators. The project is built around three complementary responsibilities, each contributing to a more useful and welcoming learning experience.</p></div>
                  <span className="team-introduction__label">Learning, together.</span>
                </div>
                <div className="team-introduction__responsibilities">
                  {responsibilities.map(({ icon: Icon, title, description }) => (
                    <div className="team-responsibility" key={title}>
                      <Icon size={21} strokeWidth={1.7} aria-hidden="true" />
                      <h4>{title}</h4>
                      <p>{description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          )}
        </div>
      </section>

      <section className="about-cta" aria-labelledby="about-cta-heading">
        <div className="container">
          <ScrollReveal className="about-cta__inner">
            <div><p className="eyebrow">The next step starts with understanding</p><h2 id="about-cta-heading">Explore What Drives Us.</h2><p>See how small steps in digital learning can open up new possibilities.</p></div>
            <Link className="button button-primary about-cta__button" to="/#mission">Back to Our Mission <ArrowUpRight size={20} aria-hidden="true" /></Link>
          </ScrollReveal>
        </div>
      </section>
    </>
  )
}
