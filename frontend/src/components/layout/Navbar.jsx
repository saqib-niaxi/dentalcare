import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useAnimation } from '../../context/AnimationContext'
import useTheme from '../../hooks/useTheme'
import { messagesAPI } from '../../api/messages'
import {
  SunIcon,
  MoonIcon,
  UserCircleIcon,
  CalendarDaysIcon,
  PencilSquareIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
  PlusCircleIcon
} from '@heroicons/react/24/outline'
import gsap from 'gsap'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [profileOpen, setProfileOpen] = useState(false)
  const lastScrollY = useRef(0)
  const profileRef = useRef(null)
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const { prefersReducedMotion } = useAnimation()
  const { isDark, toggleTheme } = useTheme()
  const location = useLocation()
  const navRef = useRef(null)
  const linksRef = useRef([])

  const [unreadTotal, setUnreadTotal] = useState(0)

  const fetchUnread = useCallback(async () => {
    if (!isAuthenticated) return
    try {
      const res = await messagesAPI.getUnreadCounts()
      setUnreadTotal(res.data.total || 0)
    } catch (err) {
      // Silently fail
    }
  }, [isAuthenticated])

  useEffect(() => {
    fetchUnread()
    const interval = setInterval(fetchUnread, 30000)
    return () => clearInterval(interval)
  }, [fetchUnread])

  const isActive = (path) => location.pathname === path

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About' },
    { path: '/services', label: 'Services' },
    { path: '/doctors', label: 'Doctors' },
    { path: '/contact', label: 'Contact' }
  ]

  const isAuthPage = ['/login', '/register', '/forgot-password'].includes(location.pathname)

  // Handle scroll effects
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      setIsScrolled(currentScrollY > 50 || isAuthPage)
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setIsVisible(false)
      } else {
        setIsVisible(true)
      }
      lastScrollY.current = currentScrollY
    }
    if (isAuthPage) setIsScrolled(true)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isAuthPage])

  // Animate nav links on mount
  useEffect(() => {
    if (prefersReducedMotion || !linksRef.current.length) return
    gsap.fromTo(
      linksRef.current,
      { y: -20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: 'power3.out', delay: 0.3 }
    )
  }, [prefersReducedMotion])

  // Close menus on route change
  useEffect(() => {
    setIsMenuOpen(false)
    setProfileOpen(false)
  }, [location])

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const linkClass = `relative font-medium transition-colors duration-300 ${
    isScrolled
      ? isDark ? 'text-gray-200 hover:text-luxury-gold' : 'text-gray-700 hover:text-luxury-gold'
      : 'text-white/90 hover:text-luxury-gold'
  }`

  const dropdownItemClass = `flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium transition-colors duration-200 rounded-lg ${
    isDark
      ? 'text-gray-200 hover:bg-white/10 hover:text-luxury-gold'
      : 'text-gray-700 hover:bg-luxury-gold/10 hover:text-luxury-gold'
  }`

  // Avatar initials
  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : '?'

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
              ${isScrolled ? isDark ? 'text-gray-100' : 'text-luxury-black' : 'text-luxury-gold'}
              group-hover:text-luxury-gold
            `}>
              Dr. Hanif Niazi
            </h2>
            <span className={`
              ml-2 text-sm tracking-wider transition-colors duration-300
              ${isScrolled ? isDark ? 'text-gray-400' : 'text-gray-600' : 'text-white/70'}
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
                  ${linkClass}
                  ${isActive(link.path) ? '!text-luxury-gold' : ''}
                `}
              >
                {link.label}
                <span className={`
                  absolute -bottom-1 left-0 h-0.5 bg-luxury-gold
                  transition-all duration-300
                  ${isActive(link.path) ? 'w-full' : 'w-0'}
                `} />
              </Link>
            ))}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`
                p-2 rounded-lg transition-colors duration-300
                ${isScrolled
                  ? isDark ? 'text-gray-300 hover:text-luxury-gold hover:bg-white/10' : 'text-gray-600 hover:text-luxury-gold hover:bg-gray-100'
                  : 'text-white/80 hover:text-luxury-gold hover:bg-white/10'
                }
              `}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
            </button>

            {isAuthenticated ? (
              isAdmin ? (
                /* Admin: simple link */
                <Link
                  to="/admin"
                  className={`${linkClass} ${isActive('/admin') ? '!text-luxury-gold' : ''}`}
                >
                  Admin Panel
                </Link>
              ) : (
                /* Patient: profile avatar dropdown */
                <div
                  ref={profileRef}
                  className="relative"
                  onMouseEnter={() => setProfileOpen(true)}
                  onMouseLeave={() => setProfileOpen(false)}
                >
                  {/* Avatar Button */}
                  <button
                    onClick={() => setProfileOpen(p => !p)}
                    className="flex items-center gap-2 group"
                  >
                    {/* Avatar circle */}
                    <div className="relative">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-luxury-gold to-amber-600 flex items-center justify-center text-luxury-black font-bold text-sm shadow-md group-hover:shadow-luxury-gold/40 transition-shadow duration-300">
                        {initials}
                      </div>
                      {/* Unread dot */}
                      {unreadTotal > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-luxury-black">
                          {unreadTotal > 9 ? '9+' : unreadTotal}
                        </span>
                      )}
                    </div>
                    {/* Name + chevron */}
                    <span className={`
                      font-medium text-sm transition-colors duration-300
                      ${isScrolled
                        ? isDark ? 'text-gray-200 group-hover:text-luxury-gold' : 'text-gray-700 group-hover:text-luxury-gold'
                        : 'text-white/90 group-hover:text-luxury-gold'
                      }
                    `}>
                      {user?.name?.split(' ')[0]}
                    </span>
                    <ChevronDownIcon className={`
                      w-4 h-4 transition-all duration-300
                      ${isScrolled ? isDark ? 'text-gray-400' : 'text-gray-500' : 'text-white/60'}
                      ${profileOpen ? 'rotate-180 text-luxury-gold' : ''}
                    `} />
                  </button>

                  {/* Dropdown */}
                  <div className={`
                    absolute right-0 top-full mt-2 w-64
                    ${isDark ? 'bg-luxury-charcoal border-white/10' : 'bg-white border-gray-200'}
                    border rounded-2xl shadow-2xl overflow-hidden
                    transition-all duration-200 origin-top-right
                    ${profileOpen ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}
                  `}>
                    {/* User info header */}
                    <div className={`px-4 py-4 border-b ${isDark ? 'border-white/10' : 'border-gray-100'}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-luxury-gold to-amber-600 flex items-center justify-center text-luxury-black font-bold text-base shadow-md flex-shrink-0">
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <p className={`font-semibold text-sm truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {user?.name}
                          </p>
                          <p className={`text-xs truncate ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {user?.email}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Menu items */}
                    <div className="p-2">
                      <Link to="/profile" className={dropdownItemClass}>
                        <PencilSquareIcon className="w-4 h-4 text-luxury-gold flex-shrink-0" />
                        Edit Profile
                      </Link>

                      <Link to="/my-appointments" className={`${dropdownItemClass} justify-between`}>
                        <span className="flex items-center gap-3">
                          <CalendarDaysIcon className="w-4 h-4 text-luxury-gold flex-shrink-0" />
                          My Appointments
                        </span>
                        {unreadTotal > 0 && (
                          <span className="w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center flex-shrink-0">
                            {unreadTotal > 9 ? '9+' : unreadTotal}
                          </span>
                        )}
                      </Link>

                      <Link to="/book-appointment" className={dropdownItemClass}>
                        <PlusCircleIcon className="w-4 h-4 text-luxury-gold flex-shrink-0" />
                        Book Appointment
                      </Link>
                    </div>

                    {/* Logout */}
                    <div className={`p-2 border-t ${isDark ? 'border-white/10' : 'border-gray-100'}`}>
                      <button onClick={logout} className={`${dropdownItemClass} text-red-500 hover:!text-red-500 hover:!bg-red-500/10`}>
                        <ArrowRightOnRectangleIcon className="w-4 h-4 flex-shrink-0" />
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              )
            ) : (
              /* Unauthenticated */
              <>
                <Link to="/book-appointment" className="btn-luxury px-6 py-2.5 text-sm">
                  Book Appointment
                </Link>
                <Link
                  to="/login"
                  className={`
                    font-medium transition-colors duration-300
                    ${isScrolled
                      ? isDark ? 'text-gray-300 hover:text-luxury-gold' : 'text-gray-600 hover:text-luxury-gold'
                      : 'text-white/70 hover:text-luxury-gold'}
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
              ${isScrolled ? 'text-gray-600 hover:text-luxury-gold hover:bg-gray-100' : 'text-white hover:text-luxury-gold hover:bg-white/10'}
            `}
            aria-label="Toggle menu"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        <div className={`
          md:hidden overflow-hidden transition-all duration-500
          ${isMenuOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}
        `}>
          <div className={`
            py-4 space-y-1 border-t
            ${isScrolled
              ? isDark ? 'border-white/10 bg-luxury-charcoal/98' : 'border-gray-200 bg-white/95'
              : 'border-white/10 bg-luxury-black/95'}
            backdrop-blur-md
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
                      ? isDark ? 'text-gray-200 hover:bg-white/10' : 'text-gray-700 hover:bg-gray-100'
                      : 'text-white/90 hover:bg-white/10'
                  }
                `}
              >
                {link.label}
              </Link>
            ))}

            {/* Mobile Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`
                flex items-center gap-3 w-full px-4 py-3 rounded-lg font-medium transition-all duration-300
                ${isScrolled
                  ? isDark ? 'text-gray-200 hover:bg-white/10' : 'text-gray-700 hover:bg-gray-100'
                  : 'text-white/90 hover:bg-white/10'}
              `}
            >
              {isDark ? <SunIcon className="w-5 h-5 text-luxury-gold" /> : <MoonIcon className="w-5 h-5" />}
              {isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            </button>

            {isAuthenticated ? (
              isAdmin ? (
                <Link
                  to="/admin"
                  className={`
                    block px-4 py-3 rounded-lg font-medium transition-all duration-300
                    ${isScrolled ? isDark ? 'text-gray-200 hover:bg-white/10' : 'text-gray-700 hover:bg-gray-100' : 'text-white/90 hover:bg-white/10'}
                  `}
                >
                  Admin Panel
                </Link>
              ) : (
                <>
                  {/* Mobile patient profile header */}
                  <div className={`mx-4 my-2 p-3 rounded-xl flex items-center gap-3 ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-luxury-gold to-amber-600 flex items-center justify-center text-luxury-black font-bold text-sm flex-shrink-0">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p className={`font-semibold text-sm truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {user?.name}
                      </p>
                      <p className={`text-xs truncate ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {user?.email}
                      </p>
                    </div>
                  </div>

                  <Link
                    to="/profile"
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-300
                      ${isScrolled ? isDark ? 'text-gray-200 hover:bg-white/10' : 'text-gray-700 hover:bg-gray-100' : 'text-white/90 hover:bg-white/10'}
                    `}
                  >
                    <PencilSquareIcon className="w-5 h-5 text-luxury-gold" />
                    Edit Profile
                  </Link>

                  <Link
                    to="/my-appointments"
                    className={`
                      flex items-center justify-between px-4 py-3 rounded-lg font-medium transition-all duration-300
                      ${isScrolled ? isDark ? 'text-gray-200 hover:bg-white/10' : 'text-gray-700 hover:bg-gray-100' : 'text-white/90 hover:bg-white/10'}
                    `}
                  >
                    <span className="flex items-center gap-3">
                      <CalendarDaysIcon className="w-5 h-5 text-luxury-gold" />
                      My Appointments
                    </span>
                    {unreadTotal > 0 && (
                      <span className="w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {unreadTotal > 9 ? '9+' : unreadTotal}
                      </span>
                    )}
                  </Link>

                  <Link
                    to="/book-appointment"
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-300
                      ${isScrolled ? isDark ? 'text-gray-200 hover:bg-white/10' : 'text-gray-700 hover:bg-gray-100' : 'text-white/90 hover:bg-white/10'}
                    `}
                  >
                    <PlusCircleIcon className="w-5 h-5 text-luxury-gold" />
                    Book Appointment
                  </Link>

                  <button
                    onClick={logout}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-lg font-medium transition-all duration-300 text-red-500 hover:bg-red-500/10"
                  >
                    <ArrowRightOnRectangleIcon className="w-5 h-5" />
                    Logout
                  </button>
                </>
              )
            ) : (
              <>
                <Link to="/book-appointment" className="block btn-luxury text-center mx-4">
                  Book Appointment
                </Link>
                <Link
                  to="/login"
                  className={`
                    block px-4 py-3 rounded-lg font-medium transition-all duration-300
                    ${isScrolled ? isDark ? 'text-gray-300 hover:bg-white/10' : 'text-gray-600 hover:bg-gray-100' : 'text-white/70 hover:bg-white/10'}
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
