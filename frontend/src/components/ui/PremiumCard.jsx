import { useRef, useEffect, useState } from 'react'
import gsap from 'gsap'
import { useAnimation } from '../../context/AnimationContext'

/**
 * PremiumCard - Glassmorphism card with 3D tilt and hover effects
 */
export default function PremiumCard({
  children,
  className = '',
  tilt = true,
  maxTilt = 8,
  float = false,
  glow = false,
  glowColor = 'rgba(212, 175, 55, 0.3)',
  onClick,
  ...props
}) {
  const cardRef = useRef(null)
  const glowRef = useRef(null)
  const { prefersReducedMotion } = useAnimation()
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    if (prefersReducedMotion || !tilt || !cardRef.current) return

    const card = cardRef.current

    const handleMouseMove = (e) => {
      const rect = card.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width - 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5

      gsap.to(card, {
        rotateX: -y * maxTilt,
        rotateY: x * maxTilt,
        transformPerspective: 1000,
        duration: 0.3,
        ease: 'power2.out',
      })

      // Move glow with cursor
      if (glowRef.current && glow) {
        gsap.to(glowRef.current, {
          x: x * 50,
          y: y * 50,
          opacity: 0.8,
          duration: 0.3,
        })
      }
    }

    const handleMouseLeave = () => {
      gsap.to(card, {
        rotateX: 0,
        rotateY: 0,
        duration: 0.5,
        ease: 'power2.out',
      })

      if (glowRef.current && glow) {
        gsap.to(glowRef.current, {
          opacity: 0,
          duration: 0.3,
        })
      }
    }

    card.addEventListener('mousemove', handleMouseMove)
    card.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      card.removeEventListener('mousemove', handleMouseMove)
      card.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [tilt, maxTilt, glow, prefersReducedMotion])

  const handleMouseEnter = () => {
    setIsHovered(true)
    if (!prefersReducedMotion && cardRef.current) {
      gsap.to(cardRef.current, {
        y: -8,
        duration: 0.3,
        ease: 'power2.out',
      })
    }
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    if (!prefersReducedMotion && cardRef.current) {
      gsap.to(cardRef.current, {
        y: 0,
        duration: 0.3,
        ease: 'power2.out',
      })
    }
  }

  return (
    <div
      ref={cardRef}
      className={`
        relative overflow-hidden rounded-2xl p-6
        bg-white/80 backdrop-blur-xl
        border border-white/30
        shadow-lg
        transition-shadow duration-300
        ${isHovered ? 'shadow-2xl' : ''}
        ${float && !prefersReducedMotion ? 'animate-float' : ''}
        ${className}
      `}
      style={{ transformStyle: 'preserve-3d' }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      {...props}
    >
      {/* Glow effect */}
      {glow && (
        <div
          ref={glowRef}
          className="absolute top-1/2 left-1/2 w-32 h-32 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none opacity-0"
          style={{
            background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
            filter: 'blur(20px)',
          }}
        />
      )}

      {/* Shimmer effect on hover */}
      <div
        className={`
          absolute inset-0 pointer-events-none
          bg-gradient-to-r from-transparent via-white/20 to-transparent
          -translate-x-full
          transition-transform duration-700
          ${isHovered ? 'translate-x-full' : ''}
        `}
      />

      {/* Content */}
      <div className="relative z-10" style={{ transform: 'translateZ(20px)' }}>
        {children}
      </div>
    </div>
  )
}

/**
 * PremiumCardDark - Dark variant of PremiumCard
 */
export function PremiumCardDark({
  children,
  className = '',
  ...props
}) {
  return (
    <PremiumCard
      className={`
        !bg-luxury-charcoal/90 !border-white/10
        text-white
        ${className}
      `}
      glowColor="rgba(212, 175, 55, 0.2)"
      {...props}
    >
      {children}
    </PremiumCard>
  )
}
