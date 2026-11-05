import type { ReactNode } from 'react'

interface ScrollRevealProps {
  children: ReactNode
  className?: string
  /** No longer used: content is shown immediately (no scroll-triggered fade). Kept so existing callers compile. */
  delay?: number
}

/** Plain wrapper. Sections used to fade in on scroll; that motion was removed (review item M2). */
export default function ScrollReveal({ children, className }: ScrollRevealProps) {
  return <div className={className}>{children}</div>
}
