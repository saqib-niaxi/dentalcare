import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { useAnimation } from '../../context/AnimationContext'

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  closeOnBackdrop = true,
  dark = false, // New prop for dark theme (admin panel)
}) {
  const { prefersReducedMotion, stopScroll, startScroll } = useAnimation()
  const backdropRef = useRef(null)
  const modalRef = useRef(null)

  // Handle scroll lock and animations
  useEffect(() => {
    if (isOpen) {
      stopScroll()
      document.body.style.overflow = 'hidden'

      // Animate in
      if (!prefersReducedMotion && backdropRef.current && modalRef.current) {
        gsap.fromTo(
          backdropRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.3, ease: 'power2.out' }
        )
        gsap.fromTo(
          modalRef.current,
          { opacity: 0, scale: 0.95, y: 20 },
          { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: 'power3.out' }
        )
      }
    } else {
      startScroll()
      document.body.style.overflow = 'unset'
    }

    return () => {
      startScroll()
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, stopScroll, startScroll, prefersReducedMotion])

  // Handle close with animation
  const handleClose = () => {
    if (!prefersReducedMotion && backdropRef.current && modalRef.current) {
      gsap.to(modalRef.current, {
        opacity: 0,
        scale: 0.95,
        y: 10,
        duration: 0.2,
        ease: 'power2.in',
      })
      gsap.to(backdropRef.current, {
        opacity: 0,
        duration: 0.2,
        ease: 'power2.in',
        onComplete: onClose,
      })
    } else {
      onClose()
    }
  }

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (closeOnBackdrop && e.target === backdropRef.current) {
      handleClose()
    }
  }

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen])

  if (!isOpen) return null

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[90vw]',
  }

  return (
    <div
      ref={backdropRef}
      className="fixed top-0 left-0 right-0 bottom-0 z-[9999] flex items-center justify-center p-4 w-screen h-screen"
      onClick={handleBackdropClick}
    >
      {/* Glassmorphism backdrop */}
      <div className={`absolute inset-0 backdrop-blur-sm ${dark ? 'bg-black/70' : 'bg-luxury-black/60'}`} />

      {/* Modal */}
      <div
        ref={modalRef}
        className={`
          relative w-full ${sizes[size]}
          ${dark
            ? 'bg-slate-800/95 border-white/10'
            : 'bg-white/95 border-white/20'
          }
          backdrop-blur-xl
          rounded-2xl shadow-2xl
          border z-[10000]
          max-h-[85vh]
        `}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${dark ? 'border-white/10' : 'border-gray-100'}`}>
          <h3 className={`text-xl font-serif font-semibold ${dark ? 'text-white' : 'text-luxury-charcoal'}`}>
            {title}
          </h3>
          <button
            onClick={handleClose}
            className={`
              w-10 h-10 rounded-full
              flex items-center justify-center
              transition-all duration-200
              ${dark
                ? 'text-slate-400 hover:text-white hover:bg-white/10'
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              }
            `}
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  )
}
