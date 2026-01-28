/**
 * Animation utility presets and configurations
 */

// Easing presets
export const easings = {
  smooth: 'power2.out',
  smoother: 'power3.out',
  smoothest: 'power4.out',
  bounce: 'bounce.out',
  elastic: 'elastic.out(1, 0.3)',
  luxury: 'expo.out',
  snap: 'back.out(1.7)',
}

// Duration presets
export const durations = {
  fast: 0.3,
  normal: 0.5,
  slow: 0.8,
  slower: 1.2,
  slowest: 2,
}

// Reveal animation configurations
export const revealConfigs = {
  fadeUp: {
    from: { y: 40, opacity: 0 },
    to: { y: 0, opacity: 1 },
  },
  fadeDown: {
    from: { y: -40, opacity: 0 },
    to: { y: 0, opacity: 1 },
  },
  fadeLeft: {
    from: { x: -60, opacity: 0 },
    to: { x: 0, opacity: 1 },
  },
  fadeRight: {
    from: { x: 60, opacity: 0 },
    to: { x: 0, opacity: 1 },
  },
  scale: {
    from: { scale: 0.9, opacity: 0 },
    to: { scale: 1, opacity: 1 },
  },
  scaleUp: {
    from: { scale: 0.5, opacity: 0 },
    to: { scale: 1, opacity: 1 },
  },
  rotate: {
    from: { rotation: -10, opacity: 0 },
    to: { rotation: 0, opacity: 1 },
  },
  blur: {
    from: { filter: 'blur(10px)', opacity: 0 },
    to: { filter: 'blur(0px)', opacity: 1 },
  },
}

// Stagger timing presets
export const staggerPresets = {
  fast: 0.05,
  normal: 0.1,
  slow: 0.15,
  cascade: 0.2,
}

// Scroll trigger start positions
export const scrollStarts = {
  early: 'top 90%',
  normal: 'top 80%',
  late: 'top 70%',
  center: 'top center',
}

/**
 * Create a timeline for complex animations
 */
export function createTimeline(options = {}) {
  const { gsap } = window
  if (!gsap) return null

  return gsap.timeline({
    paused: options.paused ?? true,
    defaults: {
      duration: options.duration ?? durations.normal,
      ease: options.ease ?? easings.smooth,
    },
    ...options,
  })
}

/**
 * Apply reveal animation to an element
 */
export function applyReveal(element, config = 'fadeUp', options = {}) {
  const { gsap } = window
  if (!gsap || !element) return

  const revealConfig = typeof config === 'string' ? revealConfigs[config] : config

  gsap.set(element, revealConfig.from)

  return gsap.to(element, {
    ...revealConfig.to,
    duration: options.duration ?? durations.slow,
    delay: options.delay ?? 0,
    ease: options.ease ?? easings.luxury,
  })
}

/**
 * Create a staggered animation
 */
export function staggerElements(elements, config = 'fadeUp', options = {}) {
  const { gsap } = window
  if (!gsap || !elements || elements.length === 0) return

  const revealConfig = typeof config === 'string' ? revealConfigs[config] : config

  gsap.set(elements, revealConfig.from)

  return gsap.to(elements, {
    ...revealConfig.to,
    duration: options.duration ?? durations.slow,
    delay: options.delay ?? 0,
    stagger: options.stagger ?? staggerPresets.normal,
    ease: options.ease ?? easings.smooth,
  })
}

/**
 * Hover animation helpers
 */
export const hoverAnimations = {
  lift: {
    enter: { y: -8, duration: 0.3, ease: easings.smooth },
    leave: { y: 0, duration: 0.3, ease: easings.smooth },
  },
  scale: {
    enter: { scale: 1.05, duration: 0.3, ease: easings.smooth },
    leave: { scale: 1, duration: 0.3, ease: easings.smooth },
  },
  glow: {
    enter: { boxShadow: '0 0 30px rgba(212, 175, 55, 0.5)', duration: 0.3 },
    leave: { boxShadow: '0 0 0px rgba(212, 175, 55, 0)', duration: 0.3 },
  },
}

/**
 * Page transition animations
 */
export const pageTransitions = {
  fadeSlide: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slide: {
    initial: { x: '100%' },
    animate: { x: 0 },
    exit: { x: '-100%' },
  },
}

/**
 * Create ripple effect on click
 */
export function createRipple(event, element, color = 'rgba(255, 255, 255, 0.3)') {
  const rect = element.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top

  const ripple = document.createElement('span')
  ripple.style.cssText = `
    position: absolute;
    border-radius: 50%;
    background: ${color};
    pointer-events: none;
    transform: scale(0);
    left: ${x}px;
    top: ${y}px;
    width: 10px;
    height: 10px;
    margin-left: -5px;
    margin-top: -5px;
  `

  element.style.position = 'relative'
  element.style.overflow = 'hidden'
  element.appendChild(ripple)

  const { gsap } = window
  if (gsap) {
    gsap.to(ripple, {
      scale: 40,
      opacity: 0,
      duration: 0.6,
      ease: 'power2.out',
      onComplete: () => ripple.remove(),
    })
  } else {
    setTimeout(() => ripple.remove(), 600)
  }
}

/**
 * Split text into spans for animation
 */
export function splitText(element, type = 'words') {
  if (!element) return []

  const text = element.textContent
  element.innerHTML = ''

  let items = []
  if (type === 'chars') {
    items = text.split('')
  } else if (type === 'words') {
    items = text.split(' ')
  } else {
    items = text.split('\n')
  }

  const spans = items.map((item, i) => {
    const wrapper = document.createElement('span')
    wrapper.className = 'inline-block overflow-hidden'

    const inner = document.createElement('span')
    inner.className = 'inline-block'
    inner.textContent = type === 'words' && i < items.length - 1 ? item + '\u00A0' : item

    wrapper.appendChild(inner)
    element.appendChild(wrapper)

    return inner
  })

  return spans
}

/**
 * Animate number counter
 */
export function animateCounter(element, endValue, options = {}) {
  const { gsap } = window
  if (!gsap || !element) return

  const {
    duration = 2,
    delay = 0,
    prefix = '',
    suffix = '',
    decimals = 0,
  } = options

  gsap.to({ value: 0 }, {
    value: endValue,
    duration,
    delay,
    ease: 'power2.out',
    onUpdate: function() {
      const current = this.targets()[0].value
      element.textContent = `${prefix}${current.toFixed(decimals)}${suffix}`
    },
  })
}
