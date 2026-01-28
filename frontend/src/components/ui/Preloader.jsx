import { useEffect, useState } from 'react'
import { useAnimation } from '../../context/AnimationContext'
import gsap from 'gsap'

export default function Preloader({ onComplete }) {
  const [isVisible, setIsVisible] = useState(true)
  const { prefersReducedMotion } = useAnimation()

  useEffect(() => {
    if (prefersReducedMotion) {
      setIsVisible(false)
      onComplete?.()
      return
    }

    const tl = gsap.timeline({
      onComplete: () => {
        setIsVisible(false)
        onComplete?.()
      },
    })

    // Animate progress bar
    tl.to('.preloader-progress', {
      scaleX: 1,
      duration: 1.5,
      ease: 'power2.inOut',
    })

    // Fade out logo
    tl.to('.preloader-logo', {
      y: -20,
      opacity: 0,
      duration: 0.4,
      ease: 'power2.in',
    }, '-=0.3')

    // Fade out entire preloader
    tl.to('.preloader-container', {
      opacity: 0,
      duration: 0.4,
      ease: 'power2.in',
    })

    return () => tl.kill()
  }, [onComplete, prefersReducedMotion])

  if (!isVisible) return null

  return (
    <div className="preloader-container fixed inset-0 z-[100] flex flex-col items-center justify-center bg-luxury-black">
      {/* Logo */}
      <div className="preloader-logo mb-8">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-gradient-gold">
          Dr. Ahmed
        </h1>
        <p className="text-luxury-gold/60 text-center mt-2 tracking-widest text-sm">
          DENTAL CARE
        </p>
      </div>

      {/* Progress bar */}
      <div className="w-48 h-0.5 bg-luxury-charcoal rounded-full overflow-hidden">
        <div
          className="preloader-progress h-full origin-left"
          style={{
            background: 'linear-gradient(90deg, #d4af37 0%, #f4e4bc 50%, #d4af37 100%)',
            transform: 'scaleX(0)',
          }}
        />
      </div>

      {/* Loading text */}
      <p className="text-luxury-gold/40 text-xs mt-4 tracking-wider">
        LOADING
      </p>
    </div>
  )
}
