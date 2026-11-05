import { useId, useState } from 'react'
import { ArrowUpRight, Check, Minus, Plus, type LucideIcon } from 'lucide-react'

interface ProgramCardProps {
  id: string
  icon: LucideIcon
  title: string
  description: string
  topics: string[]
  tip: string
}

export default function ProgramCard({ id, icon: Icon, title, description, topics, tip }: ProgramCardProps) {
  const [isOpen, setIsOpen] = useState(false)
  const detailId = useId()

  return (
    <article id={id} tabIndex={-1} className="program-card">
      <div className="program-card-top">
        <span className="program-icon"><Icon size={26} strokeWidth={1.6} aria-hidden="true" /></span>
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      <ul className="program-topics">
        {topics.map(topic => <li key={topic}><Check size={14} aria-hidden="true" />{topic}</li>)}
      </ul>
      <div className="program-bottom">
        <button type="button" aria-expanded={isOpen} aria-controls={detailId} onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? 'Close learning tip' : 'Try a small first step'}
          {isOpen ? <Minus size={17} aria-hidden="true" /> : <Plus size={17} aria-hidden="true" />}
        </button>
        <div id={detailId} className="program-tip" hidden={!isOpen}>
          <span><ArrowUpRight size={15} aria-hidden="true" /> A little practice</span>
          <p>{tip}</p>
        </div>
      </div>
    </article>
  )
}
