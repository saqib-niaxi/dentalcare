import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useAnimation } from '../../context/AnimationContext'
import gsap from 'gsap'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const lastScrollY = useRef(0)
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const { prefersReducedMotion } = useAnimation()
  const location = useLocation()
  const navRef = useRef(null)
  const linksRef = useRef([])

  const isActive = (path) => location.pathname === path

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About' },
    { path: '/services', label: 'Services' },
    { path: '/contact', label: 'Contact' }
  ]

  // Handle scroll effects
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      // Add glass effect when scrolled
      setIsScrolled(currentScrollY > 50)

      // Hide on scroll down, show on scroll up
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setIsVisible(false)
      } else {
        setIsVisible(true)
      }

      lastScrollY.current = currentScrollY
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Animate nav links on mount
  useEffect(() => {
    if (prefersReducedMotion || !linksRef.current.length) return

    gsap.fromTo(
      linksRef.current,
      { y: -20, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.5,
        stagger: 0.1,
        ease: 'power3.out',
        delay: 0.3,
      }
    )
  }, [prefersReducedMotion])

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false)
  }, [location])

  return (
    <nav
      ref={navRef}
      className={`
        fixed top-0 left-0 right-0 z-50
        transition-all duration-500
        ${isScrolled ? 'glass-navbar shadow-lg' : 'bg-transparent'}
        ${isVisible ? 'translate-y-0' : '-translate-y-full'}
      `}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <h2 className={`
              text-xl font-serif font-bold transition-colors duration-300
              ${isScrolled ? 'text-luxury-black' : 'text-luxury-gold'}
              group-hover:text-luxury-gold
            `}>
              Dr. Ahmed
            </h2>
            <span className={`
              ml-2 text-sm tracking-wider transition-colors duration-300
              ${isScrolled ? 'text-gray-600' : 'text-white/70'}
            `}>
              DENTAL
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link, index) => (
              <Link
                key={link.path}
                ref={el => linksRef.current[index] = el}
                to={link.path}
                className={`
                  relative font-medium transition-colors duration-300
                  ${isActive(link.path)
                    ? 'text-luxury-gold'
                    : isScrolled
                      ? 'text-gray-700 hover:text-luxury-gold'
                      : 'text-white/90 hover:text-luxury-gold'
                  }
                `}
              >
                {link.label}
                {/* Active indicator */}
                <span className={`
                  absolute -bottom-1 left-0 h-0.5 bg-luxury-gold
                  transition-all duration-300
                  ${isActive(link.path) ? 'w-full' : 'w-0'}
                `} />
              </Link>
            ))}

            {isAuthenticated ? (
              <>
                {isAdmin ? (
                  <Link
                    to="/admin"
                    className={`
                      font-medium transition-colors duration-300
                      ${isActive('/admin')
                        ? 'text-luxury-gold'
                        : isScrolled
                          ? 'text-gray-700 hover:text-luxury-gold'
                          : 'text-white/90 hover:text-luxury-gold'
                      }
                    `}
                  >
                    Admin Panel
                  </Link>
                ) : (
                  <Link
                    to="/my-appointments"
                    className={`
                      font-medium transition-colors duration-300
                      ${isActive('/my-appointments')
                        ? 'text-luxury-gold'
                        : isScrolled
                          ? 'text-gray-700 hover:text-luxury-gold'
                          : 'text-white/90 hover:text-luxury-gold'
                      }
                    `}
                  >
                    My Appointments
                  </Link>
                )}
                <Link
                  to="/book-appointment"
                  className="btn-luxury px-6 py-2.5 text-sm"
                >
                  Book Now
                </Link>
                <button
                  onClick={logout}
                  className={`
                    font-medium transition-colors duration-300
                    ${isScrolled ? 'text-gray-600 hover:text-luxury-gold' : 'text-white/70 hover:text-luxury-gold'}
                  `}
                >
                  Logout ({user.name?.split(' ')[0]})
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/book-appointment"
                  className="btn-luxury px-6 py-2.5 text-sm"
                >
                  Book Appointment
                </Link>
                <Link
                  to="/login"
                  className={`
                    font-medium transition-colors duration-300
                    ${isScrolled ? 'text-gray-600 hover:text-luxury-gold' : 'text-white/70 hover:text-luxury-gold'}
                  `}
                >
                  Login
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`
              md:hidden p-2 rounded-lg transition-colors duration-300
              ${isScrolled
                ? 'text-gray-600 hover:text-luxury-gold hover:bg-gray-100'
                : 'text-white hover:text-luxury-gold hover:bg-white/10'
              }
            `}
            aria-label="Toggle menu"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        <div
          className={`
            md:hidden overflow-hidden transition-all duration-500
            ${isMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}
          `}
        >
          <div className={`
            py-4 space-y-2 border-t
            ${isScrolled ? 'border-gray-200' : 'border-white/10'}
          `}>
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`
                  block px-4 py-3 rounded-lg font-medium transition-all duration-300
                  ${isActive(link.path)
                    ? 'bg-luxury-gold text-luxury-black'
                    : isScrolled
                      ? 'text-gray-700 hover:bg-gray-100'
                      : 'text-white/90 hover:bg-white/10'
                  }
                `}
              >
                {link.label}
              </Link>
            ))}

            {isAuthenticated ? (
              <>
                {isAdmin ? (
                  <Link
                    to="/admin"
                    className={`
                      block px-4 py-3 rounded-lg font-medium transition-all duration-300
                      ${isScrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white/90 hover:bg-white/10'}
                    `}
                  >
                    Admin Panel
                  </Link>
                ) : (
                  <Link
                    to="/my-appointments"
                    className={`
                      block px-4 py-3 rounded-lg font-medium transition-all duration-300
                      ${isScrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white/90 hover:bg-white/10'}
                    `}
                  >
                    My Appointments
                  </Link>
                )}
                <Link
                  to="/book-appointment"
                  className="block btn-luxury text-center mx-4"
                >
                  Book Now
                </Link>
                <button
                  onClick={logout}
                  className={`
                    block w-full text-left px-4 py-3 rounded-lg font-medium transition-all duration-300
                    ${isScrolled ? 'text-gray-600 hover:bg-gray-100' : 'text-white/70 hover:bg-white/10'}
                  `}
                >
                  Logout ({user.name?.split(' ')[0]})
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/book-appointment"
                  className="block btn-luxury text-center mx-4"
                >
                  Book Appointment
                </Link>
                <Link
                  to="/login"
                  className={`
                    block px-4 py-3 rounded-lg font-medium transition-all duration-300
                    ${isScrolled ? 'text-gray-600 hover:bg-gray-100' : 'text-white/70 hover:bg-white/10'}
                  `}
                >
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
