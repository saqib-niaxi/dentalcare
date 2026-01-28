import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useAnimation } from '../../context/AnimationContext'

gsap.registerPlugin(ScrollTrigger)

/**
 * AnimatedSection - Wrapper component for scroll-triggered reveal animations
 *
 * @param {string} animation - Animation type: 'fadeUp', 'fadeDown', 'fadeLeft', 'fadeRight', 'scale', 'fade'
 * @param {number} delay - Delay before animation starts (in seconds)
 * @param {number} duration - Animation duration (in seconds)
 * @param {string} className - Additional CSS classes
 * @param {boolean} once - Whether animation should only play once
 * @param {number} threshold - Viewport threshold (0-1) for triggering animation
 */
export default function AnimatedSection({
  children,
  animation = 'fadeUp',
  delay = 0,
  duration = 0.8,
  className = '',
  once = true,
  threshold = 0.2,
  as: Component = 'div',
  ...props
}) {
  const ref = useRef(null)
  const { prefersReducedMotion } = useAnimation()

  useEffect(() => {
    if (prefersReducedMotion || !ref.current) return

    const element = ref.current

    const animations = {
      fadeUp: { from: { y: 50, opacity: 0 }, to: { y: 0, opacity: 1 } },
      fadeDown: { from: { y: -50, opacity: 0 }, to: { y: 0, opacity: 1 } },
      fadeLeft: { from: { x: -60, opacity: 0 }, to: { x: 0, opacity: 1 } },
      fadeRight: { from: { x: 60, opacity: 0 }, to: { x: 0, opacity: 1 } },
      scale: { from: { scale: 0.9, opacity: 0 }, to: { scale: 1, opacity: 1 } },
      fade: { from: { opacity: 0 }, to: { opacity: 1 } },
    }

    const { from, to } = animations[animation] || animations.fadeUp

    gsap.set(element, from)

    const trigger = ScrollTrigger.create({
      trigger: element,
      start: `top ${100 - threshold * 100}%`,
      once,
      onEnter: () => {
        gsap.to(element, {
          ...to,
          duration,
          delay,
          ease: 'power3.out',
        })
      },
      onLeaveBack: !once ? () => {
        gsap.to(element, {
          ...from,
          duration: duration * 0.5,
          ease: 'power2.in',
        })
      } : undefined,
    })

    return () => {
      trigger.kill()
      gsap.killTweensOf(element)
    }
  }, [animation, delay, duration, once, threshold, prefersReducedMotion])

  return (
    <Component ref={ref} className={className} {...props}>
      {children}
    </Component>
  )
}

/**
 * AnimatedChildren - Animate multiple children with stagger
 */
export function AnimatedChildren({
  children,
  animation = 'fadeUp',
  stagger = 0.1,
  delay = 0,
  duration = 0.6,
  className = '',
  childClassName = '',
  threshold = 0.2,
  as: Component = 'div',
  ...props
}) {
  const ref = useRef(null)
  const { prefersReducedMotion } = useAnimation()

  useEffect(() => {
    if (prefersReducedMotion || !ref.current) return

    const container = ref.current
    const items = container.children

    if (items.length === 0) return

    const animations = {
      fadeUp: { from: { y: 40, opacity: 0 }, to: { y: 0, opacity: 1 } },
      fadeDown: { from: { y: -40, opacity: 0 }, to: { y: 0, opacity: 1 } },
      fadeLeft: { from: { x: -50, opacity: 0 }, to: { x: 0, opacity: 1 } },
      fadeRight: { from: { x: 50, opacity: 0 }, to: { x: 0, opacity: 1 } },
      scale: { from: { scale: 0.9, opacity: 0 }, to: { scale: 1, opacity: 1 } },
    }

    const { from, to } = animations[animation] || animations.fadeUp

    gsap.set(items, from)

    const trigger = ScrollTrigger.create({
      trigger: container,
      start: `top ${100 - threshold * 100}%`,
      once: true,
      onEnter: () => {
        gsap.to(items, {
          ...to,
          duration,
          delay,
          stagger,
          ease: 'power3.out',
        })
      },
    })

    return () => {
      trigger.kill()
      gsap.killTweensOf(items)
    }
  }, [animation, stagger, delay, duration, threshold, prefersReducedMotion])

  return (
    <Component ref={ref} className={className} {...props}>
      {children}
    </Component>
  )
}
