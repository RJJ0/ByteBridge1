import { useState } from 'react'
import type { TeamMember } from '../data/team'

interface TeamCardProps {
  member: TeamMember
}

export default function TeamCard({ member }: TeamCardProps) {
  const [failedImage, setFailedImage] = useState<string>()
  const showImage = member.image && failedImage !== member.image
  const initials = member.name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .filter((_, index, parts) => index === 0 || index === parts.length - 1)
    .join('')
    .toUpperCase()

  return (
    <article className="team-card">
      <div className="team-card__portrait">
        {showImage ? (
          <img
            src={member.image}
            alt={`Portrait of ${member.name}`}
            width="480"
            height="480"
            loading="lazy"
            decoding="async"
            onError={() => setFailedImage(member.image)}
          />
        ) : (
          <span className="team-card__initials" aria-hidden="true">{initials}</span>
        )}
      </div>
      <div className="team-card__content">
        <h3>{member.name}</h3>
        <p className="team-card__role">{member.role}</p>
        <p>{member.biography}</p>
      </div>
    </article>
  )
}
