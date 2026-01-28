import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAnimation } from '../../context/AnimationContext'
import { createRipple } from '../../utils/animations'

export default function Button({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  ripple = true,
  to,
  href,
  onClick,
  ...props
}) {
  const buttonRef = useRef(null)
  const { prefersReducedMotion } = useAnimation()

  const baseStyles = `
    relative overflow-hidden
    font-semibold rounded-lg
    transition-all duration-300
    inline-flex items-center justify-center gap-2
    disabled:opacity-50 disabled:cursor-not-allowed
  `

  const variants = {
    primary: `
      bg-primary text-white
      hover:bg-primary-dark hover:shadow-lg hover:-translate-y-0.5
      disabled:hover:bg-primary disabled:hover:shadow-none disabled:hover:translate-y-0
    `,
    secondary: `
      bg-white text-primary border-2 border-primary
      hover:bg-primary hover:text-white hover:shadow-lg hover:-translate-y-0.5
      disabled:hover:bg-white disabled:hover:text-primary
    `,
    accent: `
      bg-accent text-white
      hover:bg-opacity-90 hover:shadow-lg hover:-translate-y-0.5
    `,
    danger: `
      bg-red-500 text-white
      hover:bg-red-600 hover:shadow-lg
    `,
    ghost: `
      text-gray-600
      hover:text-primary hover:bg-gray-100
      disabled:hover:text-gray-400 disabled:hover:bg-transparent
    `,
    luxury: `
      bg-gradient-to-r from-luxury-gold via-luxury-goldLight to-luxury-gold
      bg-[length:200%_200%] bg-left
      text-luxury-black
      hover:bg-right
      shadow-gold
      hover:shadow-lg hover:-translate-y-0.5
    `,
    glass: `
      bg-white/10 backdrop-blur-md
      border border-white/20
      text-white
      hover:bg-white/20 hover:border-white/40 hover:-translate-y-0.5
    `,
    outline: `
      bg-transparent
      border-2 border-luxury-gold
      text-luxury-gold
      hover:bg-luxury-gold hover:text-luxury-black
    `,
    dark: `
      bg-luxury-black text-white
      border border-white/10
      hover:bg-luxury-charcoal hover:-translate-y-0.5
    `,
  }

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3',
    lg: 'px-8 py-4 text-lg'
  }

  const handleClick = (e) => {
    if (disabled || loading) return

    // Add ripple effect
    if (ripple && buttonRef.current && !prefersReducedMotion) {
      const rippleColor = variant === 'luxury' || variant === 'outline'
        ? 'rgba(10, 10, 10, 0.2)'
        : 'rgba(255, 255, 255, 0.3)'
      createRipple(e, buttonRef.current, rippleColor)
    }

    onClick?.(e)
  }

  const buttonClasses = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`

  const content = (
    <>
      {loading && (
        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
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
    </>
  )

  // Render as Link if 'to' prop is provided
  if (to) {
    return (
      <Link
        ref={buttonRef}
        to={to}
        className={buttonClasses}
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
        className={buttonClasses}
        onClick={handleClick}
        {...props}
      >
        {content}
      </a>
    )
  }

  return (
    <button
      ref={buttonRef}
      type={type}
      disabled={disabled || loading}
      onClick={handleClick}
      className={buttonClasses}
      {...props}
    >
      {content}
    </button>
  )
}
