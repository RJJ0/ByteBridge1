import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import '../styles/animations.css'

interface ScrollRevealProps {
  children: ReactNode
  className?: string
  /** Stagger delay in milliseconds. */
  delay?: number
}

export default function ScrollReveal({ children, className = '', delay = 0 }: ScrollRevealProps) {
  const elementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element || !('IntersectionObserver' in window)) return

    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (motionPreference.matches) return

    // Content stays visible until an animation actually starts. A failed or
    // unsupported observer never leaves information hidden from the visitor.
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          element.classList.add('is-revealed')
          observer.unobserve(element)
        }
      }
    }, { threshold: 0.08, rootMargin: '0px 0px -20px 0px' })

    observer.observe(element)
    const handleMotionChange = () => {
      if (motionPreference.matches) {
        observer.disconnect()
        element.classList.remove('is-revealed')
      }
    }
    motionPreference.addEventListener('change', handleMotionChange)
    return () => {
      observer.disconnect()
      motionPreference.removeEventListener('change', handleMotionChange)
      element.classList.remove('is-revealed')
    }
  }, [])

  return (
    <div
      className={`scroll-reveal ${className}`.trim()}
      ref={elementRef}
      style={{ '--reveal-delay': `${Math.max(0, delay)}ms` } as CSSProperties}
    >
      {children}
    </div>
  )
}
