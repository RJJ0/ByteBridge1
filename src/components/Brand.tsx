import '../styles/navbar.css'

interface BrandProps {
  light?: boolean
}

export default function Brand({ light = false }: BrandProps) {
  return (
    <span className={`brand${light ? ' brand--light' : ''}`}>
      <svg className="brand-mark" viewBox="0 0 40 40" fill="none" aria-hidden="true">
        <rect width="40" height="40" rx="12" fill="currentColor" />
        <path d="M11 28V13M29 28V13M11 20C17 20 17 27 20 27C23 27 23 20 29 20" stroke="white" strokeWidth="2.8" strokeLinecap="round" />
        <path d="M11 14C16 14 16 20 20 20C24 20 24 14 29 14" stroke="#5EE0C1" strokeWidth="2.8" strokeLinecap="round" />
      </svg>
      <span>Byte<span className="brand-accent">Bridge</span></span>
    </span>
  )
}
