import { useEffect, useRef, useCallback } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useAnimation } from '../context/AnimationContext'

gsap.registerPlugin(ScrollTrigger)

/**
 * Scroll reveal animation hook
 * Animates elements when they enter the viewport
 */
export function useScrollReveal(options = {}) {
  const ref = useRef(null)
  const { prefersReducedMotion } = useAnimation()

  const {
    animation = 'fadeUp',
    delay = 0,
    duration = 0.8,
    threshold = 0.2,
    once = true,
  } = options

  useEffect(() => {
    if (prefersReducedMotion || !ref.current) return

    const element = ref.current
    const animations = {
      fadeUp: { y: 40, opacity: 0 },
      fadeDown: { y: -40, opacity: 0 },
      fadeLeft: { x: -60, opacity: 0 },
      fadeRight: { x: 60, opacity: 0 },
      scale: { scale: 0.9, opacity: 0 },
      fade: { opacity: 0 },
    }

    const from = animations[animation] || animations.fadeUp

    gsap.set(element, from)

    const trigger = ScrollTrigger.create({
      trigger: element,
      start: `top ${100 - threshold * 100}%`,
      once,
      onEnter: () => {
        gsap.to(element, {
          ...Object.keys(from).reduce((acc, key) => {
            acc[key] = key === 'opacity' ? 1 : 0
            if (key === 'scale') acc[key] = 1
            return acc
          }, {}),
          duration,
          delay,
          ease: 'power3.out',
        })
      },
    })

    return () => {
      trigger.kill()
    }
  }, [animation, delay, duration, threshold, once, prefersReducedMotion])

  return ref
}

/**
 * Staggered reveal animation for multiple children
 */
export function useStaggerReveal(options = {}) {
  const ref = useRef(null)
  const { prefersReducedMotion } = useAnimation()

  const {
    selector = ':scope > *',
    stagger = 0.1,
    delay = 0,
    duration = 0.6,
    animation = 'fadeUp',
  } = options

  useEffect(() => {
    if (prefersReducedMotion || !ref.current) return

    const container = ref.current
    const children = container.querySelectorAll(selector)

    if (children.length === 0) return

    const animations = {
      fadeUp: { y: 30, opacity: 0 },
      fadeDown: { y: -30, opacity: 0 },
      fadeLeft: { x: -40, opacity: 0 },
      fadeRight: { x: 40, opacity: 0 },
      scale: { scale: 0.9, opacity: 0 },
    }

    const from = animations[animation] || animations.fadeUp

    gsap.set(children, from)

    const trigger = ScrollTrigger.create({
      trigger: container,
      start: 'top 80%',
      once: true,
      onEnter: () => {
        gsap.to(children, {
          ...Object.keys(from).reduce((acc, key) => {
            acc[key] = key === 'opacity' ? 1 : 0
            if (key === 'scale') acc[key] = 1
            return acc
          }, {}),
          duration,
          delay,
          stagger,
          ease: 'power3.out',
        })
      },
    })

    return () => {
      trigger.kill()
    }
  }, [selector, stagger, delay, duration, animation, prefersReducedMotion])

  return ref
}

/**
 * Parallax effect hook
 */
export function useParallax(speed = 0.5) {
  const ref = useRef(null)
  const { prefersReducedMotion } = useAnimation()

  useEffect(() => {
    if (prefersReducedMotion || !ref.current) return

    const element = ref.current

    gsap.to(element, {
      y: () => speed * 100,
      ease: 'none',
      scrollTrigger: {
        trigger: element,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    })

    return () => {
      ScrollTrigger.getAll().forEach(t => {
        if (t.trigger === element) t.kill()
      })
    }
  }, [speed, prefersReducedMotion])

  return ref
}

/**
 * Magnetic effect hook for buttons
 */
export function useMagneticEffect(strength = 0.3) {
  const ref = useRef(null)
  const { prefersReducedMotion } = useAnimation()

  useEffect(() => {
    if (prefersReducedMotion || !ref.current) return

    const element = ref.current

    const handleMouseMove = (e) => {
      const rect = element.getBoundingClientRect()
      const x = e.clientX - rect.left - rect.width / 2
      const y = e.clientY - rect.top - rect.height / 2

      gsap.to(element, {
        x: x * strength,
        y: y * strength,
        duration: 0.3,
        ease: 'power2.out',
      })
    }

    const handleMouseLeave = () => {
      gsap.to(element, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: 'elastic.out(1, 0.3)',
      })
    }

    element.addEventListener('mousemove', handleMouseMove)
    element.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      element.removeEventListener('mousemove', handleMouseMove)
      element.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [strength, prefersReducedMotion])

  return ref
}

/**
 * 3D Tilt effect hook for cards
 */
export function useTiltEffect(maxTilt = 10) {
  const ref = useRef(null)
  const { prefersReducedMotion } = useAnimation()

  useEffect(() => {
    if (prefersReducedMotion || !ref.current) return

    const element = ref.current

    const handleMouseMove = (e) => {
      const rect = element.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width - 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5

      gsap.to(element, {
        rotateX: -y * maxTilt,
        rotateY: x * maxTilt,
        transformPerspective: 1000,
        duration: 0.3,
        ease: 'power2.out',
      })
    }

    const handleMouseLeave = () => {
      gsap.to(element, {
        rotateX: 0,
        rotateY: 0,
        duration: 0.5,
        ease: 'power2.out',
      })
    }

    element.addEventListener('mousemove', handleMouseMove)
    element.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      element.removeEventListener('mousemove', handleMouseMove)
      element.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [maxTilt, prefersReducedMotion])

  return ref
}

/**
 * Text split and reveal animation hook
 */
export function useTextReveal(options = {}) {
  const ref = useRef(null)
  const { prefersReducedMotion } = useAnimation()

  const {
    type = 'words', // 'chars' | 'words' | 'lines'
    stagger = 0.05,
    delay = 0,
    duration = 0.8,
  } = options

  useEffect(() => {
    if (prefersReducedMotion || !ref.current) return

    const element = ref.current
    const text = element.textContent
    element.innerHTML = ''

    let items = []
    if (type === 'chars') {
      items = text.split('')
    } else if (type === 'words') {
      items = text.split(' ')
    } else {
      items = [text]
    }

    items.forEach((item, i) => {
      const span = document.createElement('span')
      span.className = 'inline-block overflow-hidden'

      const inner = document.createElement('span')
      inner.className = 'inline-block'
      inner.textContent = type === 'words' && i < items.length - 1 ? item + '\u00A0' : item

      span.appendChild(inner)
      element.appendChild(span)
    })

    const innerSpans = element.querySelectorAll('span > span')
    gsap.set(innerSpans, { y: '100%' })

    const trigger = ScrollTrigger.create({
      trigger: element,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.to(innerSpans, {
          y: 0,
          duration,
          delay,
          stagger,
          ease: 'power3.out',
        })
      },
    })

    return () => {
      trigger.kill()
    }
  }, [type, stagger, delay, duration, prefersReducedMotion])

  return ref
}

/**
 * Counter animation hook
 */
export function useCounter(endValue, options = {}) {
  const ref = useRef(null)
  const { prefersReducedMotion } = useAnimation()

  const {
    duration = 2,
    delay = 0,
    prefix = '',
    suffix = '',
  } = options

  useEffect(() => {
    if (!ref.current) return

    const element = ref.current
    const start = 0

    if (prefersReducedMotion) {
      element.textContent = `${prefix}${endValue}${suffix}`
      return
    }

    const trigger = ScrollTrigger.create({
      trigger: element,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.to({ value: start }, {
          value: endValue,
          duration,
          delay,
          ease: 'power2.out',
          onUpdate: function() {
            element.textContent = `${prefix}${Math.round(this.targets()[0].value)}${suffix}`
          },
        })
      },
    })

    return () => {
      trigger.kill()
    }
  }, [endValue, duration, delay, prefix, suffix, prefersReducedMotion])

  return ref
}

/**
 * Scroll progress hook
 */
export function useScrollProgress() {
  const ref = useRef(null)

  useEffect(() => {
    if (!ref.current) return

    const element = ref.current

    gsap.to(element, {
      scaleX: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.3,
      },
    })

    return () => {
      ScrollTrigger.getAll().forEach(t => {
        if (t.vars?.scrollTrigger?.trigger === document.body) t.kill()
      })
    }
  }, [])

  return ref
}
