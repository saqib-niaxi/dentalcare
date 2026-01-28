import { useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { useAnimation } from '../../context/AnimationContext'
import { createRipple } from '../../utils/animations'

/**
 * MagneticButton - Button with magnetic cursor effect and luxury styling
 */
export default function MagneticButton({
  children,
  to,
  href,
  variant = 'luxury', // 'luxury' | 'glass' | 'outline' | 'primary'
  size = 'md',
  magnetic = true,
  magneticStrength = 0.3,
  ripple = true,
  className = '',
  onClick,
  disabled = false,
  loading = false,
  ...props
}) {
  const buttonRef = useRef(null)
  const innerRef = useRef(null)
  const { prefersReducedMotion } = useAnimation()

  useEffect(() => {
    if (prefersReducedMotion || !magnetic || !buttonRef.current) return

    const button = buttonRef.current
    const inner = innerRef.current

    const handleMouseMove = (e) => {
      const rect = button.getBoundingClientRect()
      const x = e.clientX - rect.left - rect.width / 2
      const y = e.clientY - rect.top - rect.height / 2

      gsap.to(button, {
        x: x * magneticStrength,
        y: y * magneticStrength,
        duration: 0.3,
        ease: 'power2.out',
      })

      if (inner) {
        gsap.to(inner, {
          x: x * magneticStrength * 0.5,
          y: y * magneticStrength * 0.5,
          duration: 0.3,
          ease: 'power2.out',
        })
      }
    }

    const handleMouseLeave = () => {
      gsap.to(button, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: 'elastic.out(1, 0.3)',
      })

      if (inner) {
        gsap.to(inner, {
          x: 0,
          y: 0,
          duration: 0.5,
          ease: 'elastic.out(1, 0.3)',
        })
      }
    }

    button.addEventListener('mousemove', handleMouseMove)
    button.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      button.removeEventListener('mousemove', handleMouseMove)
      button.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [magnetic, magneticStrength, prefersReducedMotion])

  const handleClick = (e) => {
    if (disabled || loading) return

    if (ripple && buttonRef.current && !prefersReducedMotion) {
      createRipple(e, buttonRef.current, 'rgba(255, 255, 255, 0.4)')
    }

    onClick?.(e)
  }

  const variants = {
    luxury: `
      bg-gradient-to-r from-luxury-gold via-luxury-goldLight to-luxury-gold
      bg-[length:200%_200%] bg-left
      text-luxury-black
      hover:bg-right
      shadow-gold
      hover:shadow-lg
    `,
    glass: `
      bg-white/10 backdrop-blur-md
      border border-white/20
      text-white
      hover:bg-white/20 hover:border-white/40
    `,
    outline: `
      bg-transparent
      border-2 border-luxury-gold
      text-luxury-gold
      hover:bg-luxury-gold hover:text-luxury-black
    `,
    primary: `
      bg-primary text-white
      hover:bg-primary-dark
      shadow-lg hover:shadow-xl
    `,
    dark: `
      bg-luxury-black text-white
      border border-white/10
      hover:bg-luxury-charcoal
    `,
  }

  const sizes = {
    sm: 'px-5 py-2.5 text-sm',
    md: 'px-8 py-4 text-base',
    lg: 'px-10 py-5 text-lg',
  }

  const baseClasses = `
    relative inline-flex items-center justify-center gap-2
    font-semibold rounded-lg
    transition-all duration-300
    overflow-hidden
    disabled:opacity-50 disabled:cursor-not-allowed
    ${variants[variant]}
    ${sizes[size]}
    ${className}
  `

  const content = (
    <>
      <span ref={innerRef} className="relative z-10 flex items-center gap-2">
        {loading && (
          <svg className="animate-spin h-5 w-5\" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </span>
    </>
  )

  // Render as Link if 'to' prop is provided
  if (to) {
    return (
      <Link
        ref={buttonRef}
        to={to}
        className={baseClasses}
        onClick={handleClick}
        {...props}
      >
        {content}
      </Link>
    )
  }

  // Render as anchor if 'href' prop is provided
  if (href) {
    return (
      <a
        ref={buttonRef}
        href={href}
        className={baseClasses}
        onClick={handleClick}
        {...props}
      >
        {content}
      </a>
    )
  }

  // Render as button
  return (
    <button
      ref={buttonRef}
      type="button"
      className={baseClasses}
      onClick={handleClick}
      disabled={disabled || loading}
      {...props}
    >
      {content}
    </button>
  )
}
