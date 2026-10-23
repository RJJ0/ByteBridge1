import { useEffect, useRef, useState, type FocusEvent } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import Brand from './Brand'
import '../styles/navbar.css'

const navigation = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About Us' },
  { to: '/donate', label: 'Donation' },
]

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const headerRef = useRef<HTMLElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 768px)')
    const handleResize = (event: MediaQueryListEvent) => {
      const activeElement = document.activeElement
      if (event.matches) {
        // Keep keyboard focus on a visible control when the mobile menu disappears.
        if (activeElement instanceof HTMLElement && (activeElement.closest('.mobile-navigation') || activeElement === toggleRef.current)) {
          headerRef.current?.querySelector<HTMLAnchorElement>('.desktop-navigation a')?.focus()
        }
        setIsOpen(false)
      } else if (activeElement instanceof HTMLElement && activeElement.closest('.desktop-navigation')) {
        toggleRef.current?.focus()
      }
    }

    desktop.addEventListener('change', handleResize)
    return () => desktop.removeEventListener('change', handleResize)
  }, [])

  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
        toggleRef.current?.focus()
      }
    }
    const handleOutsideClick = (event: PointerEvent) => {
      if (event.target instanceof Node && !headerRef.current?.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    document.addEventListener('pointerdown', handleOutsideClick)
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.removeEventListener('pointerdown', handleOutsideClick)
    }
  }, [isOpen])

  const closeMenu = () => setIsOpen(false)
  const handleBlur = (event: FocusEvent<HTMLElement>) => {
    if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) {
      setIsOpen(false)
    }
  }

  return (
    <header className="site-header" ref={headerRef} onBlur={handleBlur}>
      <div className="container navbar">
        <Link className="brand-link" to="/" aria-label="ByteBridge home" onClick={closeMenu}>
          <Brand />
        </Link>

        <nav className="desktop-navigation" aria-label="Primary navigation">
          {navigation.map(({ to, label }) => (
            <NavLink key={to} to={to} end className="navigation-link">{label}</NavLink>
          ))}
          <Link className="button button-primary navbar-cta" to="/#mission">
            Our mission <ArrowUpRight size={17} aria-hidden="true" />
          </Link>
        </nav>

        <button
          className={`menu-toggle${isOpen ? ' is-open' : ''}`}
          type="button"
          aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={isOpen}
          aria-controls="mobile-navigation"
          ref={toggleRef}
          onClick={() => setIsOpen((previous) => !previous)}
        >
          <span /><span />
        </button>
      </div>

      <div className={`mobile-menu${isOpen ? ' is-open' : ''}`} inert={!isOpen}>
        <div className="mobile-menu-inner">
          <nav id="mobile-navigation" className="mobile-navigation container" aria-label="Mobile navigation">
            {navigation.map(({ to, label }) => (
              <NavLink key={to} to={to} end className="navigation-link" onClick={closeMenu}>
                {label}<ArrowUpRight size={18} aria-hidden="true" />
              </NavLink>
            ))}
            <Link className="button button-primary" to="/#mission" onClick={closeMenu}>
              Our mission <ArrowUpRight size={17} aria-hidden="true" />
            </Link>
            <p>A little knowledge. A world of possibility.</p>
          </nav>
        </div>
      </div>
    </header>
  )
}
