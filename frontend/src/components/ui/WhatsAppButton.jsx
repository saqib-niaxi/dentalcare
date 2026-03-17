import { useState } from 'react'

const PHONE_NUMBER = '923001234567' // Pakistan format without +
const DEFAULT_MESSAGE = 'Hello! I would like to inquire about dental services at Dr. Hanif Niazi Dental Clinic.'

export default function WhatsAppButton() {
  const [showTooltip, setShowTooltip] = useState(false)

  const handleClick = () => {
    const url = `https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 no-print">
      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap">
          Chat on WhatsApp
          <div className="absolute top-full right-4 w-2 h-2 bg-gray-900 rotate-45 -translate-y-1" />
        </div>
      )}

      {/* Button */}
      <button
        onClick={handleClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
        style={{ backgroundColor: '#25D366' }}
        aria-label="Chat on WhatsApp"
      >
        <svg viewBox="0 0 32 32" className="w-7 h-7 fill-white">
          <path d="M16.004 0h-.008C7.174 0 0 7.176 0 16c0 3.5 1.128 6.744 3.046 9.378L1.054 31.29l6.118-1.958A15.905 15.905 0 0016.004 32C24.826 32 32 24.822 32 16S24.826 0 16.004 0zm9.312 22.594c-.39 1.1-1.932 2.014-3.178 2.282-.852.18-1.964.324-5.71-1.228-4.796-1.986-7.876-6.844-8.114-7.162-.228-.318-1.918-2.554-1.918-4.872s1.214-3.456 1.644-3.928c.43-.472.94-.59 1.254-.59.314 0 .628.002.902.016.29.014.678-.11 1.06.808.392.942 1.332 3.26 1.45 3.496.118.236.196.512.04.826-.158.318-.236.514-.472.79-.236.276-.496.616-.708.826-.236.236-.482.492-.208.964.276.472 1.226 2.022 2.632 3.276 1.81 1.612 3.336 2.112 3.808 2.348.472.236.748.196 1.024-.118.276-.314 1.176-1.374 1.49-1.846.314-.472.628-.39 1.06-.236.432.158 2.75 1.296 3.222 1.532.472.236.786.354.902.55.118.196.118 1.13-.272 2.228z" />
        </svg>
      </button>
    </div>
  )
}
