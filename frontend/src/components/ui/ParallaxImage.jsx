import { useRef, useEffect, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useAnimation } from '../../context/AnimationContext'

gsap.registerPlugin(ScrollTrigger)

/**
 * ParallaxImage - Image with parallax scrolling effect and reveal mask
 */
export default function ParallaxImage({
  src,
  alt,
  speed = 0.3,
  reveal = true,
  revealDirection = 'up', // 'up' | 'down' | 'left' | 'right'
  className = '',
  imageClassName = '',
  overlay = false,
  overlayColor = 'rgba(0, 0, 0, 0.3)',
  ...props
}) {
  const containerRef = useRef(null)
  const imageRef = useRef(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const { prefersReducedMotion } = useAnimation()

  // Parallax effect
  useEffect(() => {
    if (prefersReducedMotion || !containerRef.current || !imageRef.current) return

    const container = containerRef.current
    const image = imageRef.current

    // Parallax scroll effect
    gsap.to(image, {
      y: `${speed * 100}%`,
      ease: 'none',
      scrollTrigger: {
        trigger: container,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    })

    return () => {
      ScrollTrigger.getAll().forEach(t => {
        if (t.trigger === container) t.kill()
      })
    }
  }, [speed, prefersReducedMotion])

  // Reveal animation
  useEffect(() => {
    if (!reveal || prefersReducedMotion || !containerRef.current) return

    const container = containerRef.current

    const clipPaths = {
      up: { from: 'inset(100% 0 0 0)', to: 'inset(0 0 0 0)' },
      down: { from: 'inset(0 0 100% 0)', to: 'inset(0 0 0 0)' },
      left: { from: 'inset(0 100% 0 0)', to: 'inset(0 0 0 0)' },
      right: { from: 'inset(0 0 0 100%)', to: 'inset(0 0 0 0)' },
    }

    const { from, to } = clipPaths[revealDirection] || clipPaths.up

    gsap.set(container, { clipPath: from })

    ScrollTrigger.create({
      trigger: container,
      start: 'top 80%',
      once: true,
      onEnter: () => {
        gsap.to(container, {
          clipPath: to,
          duration: 1.2,
          ease: 'power3.inOut',
        })
      },
    })

    return () => {
      ScrollTrigger.getAll().forEach(t => {
        if (t.trigger === container) t.kill()
      })
    }
  }, [reveal, revealDirection, prefersReducedMotion])

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      {...props}
    >
      {/* Image container for parallax */}
      <div
        ref={imageRef}
        className="absolute inset-0"
        style={{
          top: `-${speed * 50}%`,
          height: `${100 + speed * 100}%`,
        }}
      >
        <img
          src={src}
          alt={alt}
          className={`w-full h-full object-cover ${imageClassName}`}
          onLoad={() => setIsLoaded(true)}
        />
      </div>

      {/* Overlay */}
      {overlay && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundColor: overlayColor }}
        />
      )}

      {/* Loading placeholder */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-luxury-charcoal/10 animate-pulse" />
      )}
    </div>
  )
}

/**
 * ParallaxBackground - Full section background with parallax
 */
export function ParallaxBackground({
  children,
  src,
  alt = 'Background',
  speed = 0.2,
  overlay = true,
  overlayColor = 'rgba(10, 10, 10, 0.7)',
  className = '',
  ...props
}) {
  const containerRef = useRef(null)
  const bgRef = useRef(null)
  const { prefersReducedMotion } = useAnimation()

  useEffect(() => {
    if (prefersReducedMotion || !containerRef.current || !bgRef.current) return

    const container = containerRef.current
    const bg = bgRef.current

    gsap.to(bg, {
      y: `${speed * 100}%`,
      ease: 'none',
      scrollTrigger: {
        trigger: container,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    })

    return () => {
      ScrollTrigger.getAll().forEach(t => {
        if (t.trigger === container) t.kill()
      })
    }
  }, [speed, prefersReducedMotion])

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      {...props}
    >
      {/* Parallax background */}
      <div
        ref={bgRef}
        className="absolute inset-0"
        style={{
          top: `-${speed * 50}%`,
          height: `${100 + speed * 100}%`,
        }}
      >
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Overlay */}
      {overlay && (
        <div
          className="absolute inset-0"
          style={{ backgroundColor: overlayColor }}
        />
      )}

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}
