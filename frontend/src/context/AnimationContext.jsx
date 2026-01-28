import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger)

const AnimationContext = createContext(null)

export function AnimationProvider({ children }) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const lenisRef = useRef(null)

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = (e) => setPrefersReducedMotion(e.matches)
    mediaQuery.addEventListener('change', handleChange)

    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // Initialize Lenis smooth scrolling
  useEffect(() => {
    if (prefersReducedMotion) {
      setIsLoaded(true)
      return
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      smoothTouch: false,
      touchMultiplier: 2,
    })

    lenisRef.current = lenis

    // Integrate Lenis with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update)

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000)
    })

    gsap.ticker.lagSmoothing(0)

    // Mark as loaded after a short delay
    const timer = setTimeout(() => setIsLoaded(true), 100)

    return () => {
      clearTimeout(timer)
      lenis.destroy()
      gsap.ticker.remove(lenis.raf)
    }
  }, [prefersReducedMotion])

  // Scroll to top function
  const scrollToTop = useCallback(() => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: false })
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [])

  // Scroll to element function
  const scrollToElement = useCallback((target, options = {}) => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(target, {
        offset: options.offset || 0,
        duration: options.duration || 1.2,
        immediate: options.immediate || false,
      })
    } else {
      const element = typeof target === 'string' ? document.querySelector(target) : target
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }, [])

  // Stop/start scroll
  const stopScroll = useCallback(() => {
    if (lenisRef.current) {
      lenisRef.current.stop()
    }
  }, [])

  const startScroll = useCallback(() => {
    if (lenisRef.current) {
      lenisRef.current.start()
    }
  }, [])

  const value = {
    isLoaded,
    prefersReducedMotion,
    lenis: lenisRef.current,
    scrollToTop,
    scrollToElement,
    stopScroll,
    startScroll,
  }

  return (
    <AnimationContext.Provider value={value}>
      {children}
    </AnimationContext.Provider>
  )
}

export function useAnimation() {
  const context = useContext(AnimationContext)
  if (!context) {
    throw new Error('useAnimation must be used within an AnimationProvider')
  }
  return context
}

export default AnimationContext
