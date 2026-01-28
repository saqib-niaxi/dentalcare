import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useAnimation } from '../../context/AnimationContext'

gsap.registerPlugin(ScrollTrigger)

/**
 * AnimatedText - Text with split animation (words, chars, or lines)
 */
export default function AnimatedText({
  children,
  as: Component = 'p',
  type = 'words', // 'chars' | 'words' | 'lines'
  stagger = 0.03,
  delay = 0,
  duration = 0.6,
  threshold = 0.2,
  className = '',
  ...props
}) {
  const ref = useRef(null)
  const { prefersReducedMotion } = useAnimation()

  useEffect(() => {
    if (prefersReducedMotion || !ref.current) return

    const element = ref.current
    const text = element.textContent
    element.innerHTML = ''

    // Split text based on type
    let items = []
    if (type === 'chars') {
      items = text.split('')
    } else if (type === 'words') {
      items = text.split(' ')
    } else {
      items = [text]
    }

    // Create spans
    const spans = items.map((item, i) => {
      const wrapper = document.createElement('span')
      wrapper.style.display = 'inline-block'
      wrapper.style.overflow = 'hidden'
      wrapper.style.verticalAlign = 'bottom'

      const inner = document.createElement('span')
      inner.style.display = 'inline-block'
      inner.textContent = type === 'words' && i < items.length - 1 ? item + '\u00A0' : item

      wrapper.appendChild(inner)
      element.appendChild(wrapper)

      return inner
    })

    // Set initial state
    gsap.set(spans, { y: '110%' })

    // Create scroll trigger
    const trigger = ScrollTrigger.create({
      trigger: element,
      start: `top ${100 - threshold * 100}%`,
      once: true,
      onEnter: () => {
        gsap.to(spans, {
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
      gsap.killTweensOf(spans)
    }
  }, [type, stagger, delay, duration, threshold, prefersReducedMotion, children])

  // For reduced motion, just render text normally
  if (prefersReducedMotion) {
    return <Component className={className} {...props}>{children}</Component>
  }

  return (
    <Component ref={ref} className={className} {...props}>
      {children}
    </Component>
  )
}

/**
 * GradientText - Text with animated gradient
 */
export function GradientText({
  children,
  as: Component = 'span',
  className = '',
  animate = true,
  ...props
}) {
  const { prefersReducedMotion } = useAnimation()

  return (
    <Component
      className={`
        bg-gradient-to-r from-luxury-gold via-luxury-goldLight to-luxury-gold
        bg-clip-text text-transparent
        bg-[length:200%_auto]
        ${animate && !prefersReducedMotion ? 'animate-shimmer' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </Component>
  )
}

/**
 * AnimatedHeading - Heading with reveal animation
 */
export function AnimatedHeading({
  children,
  level = 2,
  className = '',
  ...props
}) {
  const Tag = `h${level}`

  return (
    <AnimatedText
      as={Tag}
      type="words"
      className={`font-serif font-bold ${className}`}
      {...props}
    >
      {children}
    </AnimatedText>
  )
}
