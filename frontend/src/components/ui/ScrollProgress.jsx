import { useRef, useEffect, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useAnimation } from '../../context/AnimationContext'

gsap.registerPlugin(ScrollTrigger)

/**
 * ScrollProgress - Gold gradient progress bar at top of page
 */
export default function ScrollProgress({ className = '' }) {
  const progressRef = useRef(null)
  const { prefersReducedMotion } = useAnimation()

  useEffect(() => {
    if (prefersReducedMotion || !progressRef.current) return

    const progress = progressRef.current

    gsap.to(progress, {
      scaleX: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: document.documentElement,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.3,
      },
    })

    return () => {
      ScrollTrigger.getAll().forEach(t => {
        if (t.vars?.scrollTrigger?.trigger === document.documentElement) t.kill()
      })
    }
  }, [prefersReducedMotion])

  if (prefersReducedMotion) return null

  return (
    <div
      ref={progressRef}
      className={`
        fixed top-0 left-0 right-0 h-1 z-[60]
        origin-left
        ${className}
      `}
      style={{
        background: 'linear-gradient(90deg, #d4af37 0%, #f4e4bc 50%, #d4af37 100%)',
        transform: 'scaleX(0)',
      }}
    />
  )
}

/**
 * ScrollIndicator - Animated scroll down indicator
 */
export function ScrollIndicator({
  className = '',
  onClick,
  text = 'Scroll',
}) {
  const { prefersReducedMotion, scrollToElement } = useAnimation()
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY < 100)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleClick = () => {
    if (onClick) {
      onClick()
    } else {
      // Scroll to next section
      scrollToElement(window.innerHeight, { duration: 1 })
    }
  }

  return (
    <button
      onClick={handleClick}
      className={`
        flex flex-col items-center gap-2
        text-luxury-gold/60 hover:text-luxury-gold
        transition-all duration-300
        ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        ${className}
      `}
    >
      <span className="text-xs tracking-widest uppercase">{text}</span>
      <div className="relative w-6 h-10 border-2 border-current rounded-full">
        <div
          className={`
            absolute left-1/2 top-2 w-1 h-2 -translate-x-1/2
            bg-current rounded-full
            ${!prefersReducedMotion ? 'animate-bounce' : ''}
          `}
        />
      </div>
    </button>
  )
}

/**
 * BackToTop - Floating back to top button
 */
export function BackToTop({ className = '' }) {
  const [isVisible, setIsVisible] = useState(false)
  const { prefersReducedMotion, scrollToTop } = useAnimation()

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 500)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <button
      onClick={scrollToTop}
      className={`
        fixed bottom-8 right-8 z-50
        w-12 h-12 rounded-full
        bg-luxury-gold text-luxury-black
        shadow-gold
        flex items-center justify-center
        transition-all duration-300
        hover:scale-110 hover:shadow-lg
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}
        ${className}
      `}
      aria-label="Back to top"
    >
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 10l7-7m0 0l7 7m-7-7v18"
        />
      </svg>
    </button>
  )
}
