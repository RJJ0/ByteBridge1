import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { ArrowDown, ArrowRight, ArrowUpRight, BookOpen, Check, CodeXml, Compass, Globe2, Heart, Lightbulb, Monitor, MousePointer2, ShieldCheck, Sparkles, Users, Wifi } from 'lucide-react'
import ProgramCard from '../components/ProgramCard'
import ScrollReveal from '../components/ScrollReveal'
import '../styles/home.css'

const entrance = (delay: number) => ({ '--reveal-delay': `${delay}ms` }) as CSSProperties

const focusAreas = [
  {
    id: 'digital-literacy', number: '01', icon: Monitor, title: 'Digital Literacy', tone: 'blue' as const,
    description: 'Build the everyday skills that make the digital world feel a little more familiar.',
    topics: ['Computer & internet essentials', 'Digital communication', 'Everyday productivity tools'],
    tip: 'Create a folder for a school project. Give each file a clear name, then practice finding it, renaming it, and making a backup. Small habits make digital work easier.',
  },
  {
    id: 'online-safety', number: '02', icon: ShieldCheck, title: 'Online Safety', tone: 'mint' as const,
    description: 'Navigate with confidence by learning how to protect yourself and others online.',
    topics: ['Strong passwords & privacy', 'Spotting suspicious messages', 'Thoughtful, responsible sharing'],
    tip: 'Before opening a link in an unexpected message, pause. Check the sender and the full web address. If a message asks for a password or urgent payment, verify it through a separate, trusted channel.',
  },
  {
    id: 'technology-opportunities', number: '03', icon: CodeXml, title: 'Technology Opportunities', tone: 'navy' as const,
    description: 'Turn curiosity into possibilities through creativity, code, and continuous learning.',
    topics: ['A first introduction to coding', 'Exploring technology careers', 'Digital creativity & discovery'],
    tip: 'Choose an everyday problem, such as planning your study time. Sketch a simple app on paper: what would its buttons do, and who would it help? Good technology begins with a useful question.',
  },
]

function LearningGraphic() {
  return (
    <div className="learning-graphic" role="img" aria-label="A learning journey from curiosity to digital confidence: learn the essentials, practice safely, and explore your potential.">
      <div className="graphic-orbit graphic-orbit-one" />
      <div className="graphic-orbit graphic-orbit-two" />
      <div className="learning-window">
        <div className="learning-window-bar"><span /><span /><span /><span className="window-label">a little curiosity goes a long way</span></div>
        <div className="learning-window-body">
          <span className="learning-spark"><Sparkles size={24} /></span>
          <span className="learning-kicker">YOUR NEXT CHAPTER</span>
          <strong>It starts with<br />“I can learn this.”</strong>
          <div className="learning-path">
            <div><span><Monitor size={17} /></span><p>Learn the essentials<small>One useful skill at a time</small></p><Check size={16} /></div>
            <div><span><ShieldCheck size={17} /></span><p>Practice safely<small>A little more confidence</small></p><Check size={16} /></div>
            <div><span><Compass size={17} /></span><p>Explore your potential<small>A world of possibilities</small></p><ArrowUpRight size={17} /></div>
          </div>
        </div>
      </div>
      <div className="learning-note"><span><Heart size={17} /></span>Progress, at your own pace.</div>
      <MousePointer2 className="graphic-cursor" size={40} fill="#5ee0c1" strokeWidth={1.5} />
    </div>
  )
}

export default function Home() {
  return (
    <>
      <section className="home-hero" aria-labelledby="home-heading">
        <div className="hero-glow gradient-drift" aria-hidden="true" />
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="eyebrow hero-enter">Empowering Through Technology</p>
            <h1 id="home-heading" className="hero-enter" style={entrance(90)}>Digital Skills<br />for <span>Everyone.</span><svg className="heading-underline" viewBox="0 0 350 16" fill="none" aria-hidden="true"><path d="M4 11C85 1 239 0 346 8" stroke="currentColor" strokeWidth="7" strokeLinecap="round" /></svg></h1>
            <p className="hero-description hero-enter" style={entrance(180)}>Technology should open doors, not create barriers. ByteBridge believes that digital knowledge can empower people, strengthen communities, and create new opportunities.</p>
            <div className="hero-actions hero-enter" style={entrance(270)}>
              <Link to="/#mission" className="button button-primary">Discover Our Mission <ArrowRight aria-hidden="true" /></Link>
              <Link to="/about" className="button button-secondary">About Us <ArrowUpRight aria-hidden="true" /></Link>
            </div>
            <div className="hero-footnote hero-enter" style={entrance(360)}><span className="hero-footnote-icon"><Users size={17} aria-hidden="true" /></span><p>Student-led ideas.<br /><strong>Community-minded possibilities.</strong></p></div>
          </div>
          <div className="hero-visual hero-image-enter">
            <div className="hero-photo-frame">
              <img src="/images/digital-learning.jpg" width="1400" height="788" fetchPriority="high" alt="Young adults gathered around a laptop, sharing ideas and learning together." />
              <div className="photo-caption"><span className="caption-line" /><span>Big possibilities.<br /><strong>Small first steps.</strong></span></div>
            </div>
            <div className="hero-sticker"><Sparkles size={22} strokeWidth={1.6} aria-hidden="true" /><span>A brighter<br />digital future.</span></div>
            <div className="hero-floating-card"><span className="floating-icon"><BookOpen size={23} strokeWidth={1.6} aria-hidden="true" /></span><div><strong>Knowledge opens doors.</strong><p>Let’s make it accessible.</p></div><ArrowUpRight size={18} aria-hidden="true" /></div>
            <span className="hero-dots" aria-hidden="true" />
            <span className="hero-photo-label">CURIOSITY IS WHERE IT BEGINS</span>
          </div>
        </div>
        <div className="container hero-bottom">
          <span className="hero-bottom-label">A LITTLE KNOWLEDGE.<br /><strong>A WORLD OF POSSIBILITY.</strong></span>
          <Link to="/#digital-literacy"><Monitor size={19} aria-hidden="true" /> Digital Literacy <ArrowUpRight size={14} aria-hidden="true" /></Link>
          <Link to="/#online-safety"><ShieldCheck size={19} aria-hidden="true" /> Online Safety <ArrowUpRight size={14} aria-hidden="true" /></Link>
          <Link to="/#technology-opportunities"><CodeXml size={19} aria-hidden="true" /> Technology Opportunities <ArrowUpRight size={14} aria-hidden="true" /></Link>
        </div>
      </section>

      <section className="section digital-divide" aria-labelledby="divide-heading">
        <div className="container divide-grid">
          <ScrollReveal className="divide-copy">
            <p className="eyebrow">Understanding the Gap</p>
            <h2 id="divide-heading">The Digital Divide Is More Than a Connection.</h2>
            <p>Getting online is only the beginning. Knowing how to find reliable information, use everyday tools, and stay safe is what turns access into opportunity.</p>
            <p>For Filipino students and communities with fewer learning resources, a little guidance can make the digital world feel less out of reach.</p>
            <Link to="/#focus-areas" className="text-link">See where we focus <ArrowRight aria-hidden="true" /></Link>
          </ScrollReveal>
          <ScrollReveal className="inclusion-panel" delay={120}>
            <div className="panel-heading"><span>WHAT DIGITAL INCLUSION TAKES</span><Globe2 size={21} aria-hidden="true" /></div>
            <div className="inclusion-row"><span className="inclusion-icon"><Wifi size={21} strokeWidth={1.7} aria-hidden="true" /></span><div><h3>A way to connect</h3><p>Access to a device and a reliable connection.</p></div><span className="inclusion-number">01</span></div>
            <div className="inclusion-row"><span className="inclusion-icon"><Lightbulb size={21} strokeWidth={1.7} aria-hidden="true" /></span><div><h3>The skills to take part</h3><p>Practical knowledge for everyday digital life.</p></div><span className="inclusion-number">02</span></div>
            <div className="inclusion-row"><span className="inclusion-icon"><ShieldCheck size={21} strokeWidth={1.7} aria-hidden="true" /></span><div><h3>The confidence to explore</h3><p>A safer, more thoughtful approach to technology.</p></div><span className="inclusion-number">03</span></div>
            <p className="panel-note"><span /> Access matters. So does knowing what comes next.</p>
          </ScrollReveal>
        </div>
      </section>

      <section className="section mission-section" id="mission" tabIndex={-1} aria-labelledby="mission-heading">
        <div className="container mission-grid">
          <ScrollReveal className="mission-copy">
            <p className="eyebrow">Our Mission</p>
            <h2 id="mission-heading">Bridging Knowledge.<br /><span>Building Opportunities.</span></h2>
            <p>We believe everyone deserves a place in the digital world, regardless of background or financial situation.</p>
            <p>ByteBridge is a student-created nonprofit concept that imagines more accessible digital learning for Filipino students, young adults, and underserved communities. Our proposed focus is simple: useful skills, safer habits, and the confidence to keep learning.</p>
            <p>From completing a school assignment to exploring a new career path, practical knowledge can help turn “I don’t know how” into a first step forward.</p>
            <Link to="/about" className="mission-link">Get to know ByteBridge <ArrowRight size={17} aria-hidden="true" /></Link>
          </ScrollReveal>
          <ScrollReveal className="mission-art" delay={150}><LearningGraphic /></ScrollReveal>
        </div>
        <div className="container mission-bottom"><span>OUR BELIEF</span><p>Bridging the Digital Divide, One Skill at a Time.</p><ArrowUpRight size={20} aria-hidden="true" /></div>
      </section>

      <section className="section focus-section" id="focus-areas" tabIndex={-1} aria-labelledby="focus-heading">
        <div className="container">
          <ScrollReveal className="section-heading-row"><div><p className="eyebrow">Our Focus Areas</p><h2 id="focus-heading">Skills That Make<br />a Difference.</h2></div><p>Three connected areas. One shared purpose.<br />Helping more people feel at home in the digital world.</p></ScrollReveal>
          <div className="program-grid">{focusAreas.map((area, index) => <ScrollReveal key={area.id} delay={index * 100}><ProgramCard {...area} /></ScrollReveal>)}</div>
          <ScrollReveal className="focus-note"><Lightbulb size={16} aria-hidden="true" /><p>Our proposed focus areas — a starting point for learning, sharing, and growing together.</p></ScrollReveal>
        </div>
      </section>

      <section className="section approach-section" aria-labelledby="approach-heading">
        <div className="container">
          <ScrollReveal className="centered-heading"><p className="eyebrow">Our Proposed Approach</p><h2 id="approach-heading">Learn. Build. Connect.</h2><p>Meaningful progress begins with a simple first step.</p></ScrollReveal>
          <div className="approach-grid">
            <ScrollReveal className="approach-step"><div className="step-track"><span>01</span><BookOpen size={22} strokeWidth={1.6} aria-hidden="true" /></div><h3>Start with curiosity.</h3><span className="step-name">LEARN</span><p>Get comfortable with essential digital concepts. Ask questions, explore the basics, and build a foundation at your own pace.</p></ScrollReveal>
            <ScrollReveal className="approach-step" delay={100}><div className="step-track"><span>02</span><CodeXml size={22} strokeWidth={1.6} aria-hidden="true" /></div><h3>Put knowledge into practice.</h3><span className="step-name">BUILD</span><p>Turn learning into doing through small, practical activities. Create something useful and make responsible technology use a habit.</p></ScrollReveal>
            <ScrollReveal className="approach-step" delay={200}><div className="step-track"><span>03</span><Users size={22} strokeWidth={1.6} aria-hidden="true" /></div><h3>Open new possibilities.</h3><span className="step-name">CONNECT</span><p>Share what you know, learn from others, and discover new paths for collaboration, continued learning, and personal growth.</p></ScrollReveal>
          </div>
        </div>
      </section>

      <section className="home-cta-section" aria-labelledby="home-cta-heading">
        <ScrollReveal className="container home-cta">
          <div className="cta-copy"><p className="eyebrow">The Future Is for Everyone</p><h2 id="home-cta-heading">Let’s Build a More<br /><span>Connected Future.</span></h2><p>Discover the people and purpose behind ByteBridge.</p><Link to="/about" className="button button-mint">Meet Our Team <ArrowUpRight aria-hidden="true" /></Link></div>
          <div className="cta-art" aria-hidden="true"><div className="cta-ring" /><div className="cta-ring cta-ring-two" /><div className="cta-symbol"><ArrowUpRight strokeWidth={1} /></div><span className="cta-small-plus">+</span><span className="cta-art-caption">TOGETHER, WE GO FURTHER.</span></div>
          <ArrowDown className="cta-decoration" size={18} aria-hidden="true" />
        </ScrollReveal>
      </section>
    </>
  )
}
