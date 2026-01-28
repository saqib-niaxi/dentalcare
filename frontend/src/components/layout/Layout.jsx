import { useState, useEffect } from 'react'
import Navbar from './Navbar'
import Footer from './Footer'
import Preloader from '../ui/Preloader'
import ScrollProgress from '../ui/ScrollProgress'
import { BackToTop } from '../ui/ScrollProgress'
import { useAnimation } from '../../context/AnimationContext'

export default function Layout({ children }) {
  const [showPreloader, setShowPreloader] = useState(true)
  const [isFirstLoad, setIsFirstLoad] = useState(true)
  const { prefersReducedMotion } = useAnimation()

  useEffect(() => {
    // Check if this is the first visit in this session
    const hasVisited = sessionStorage.getItem('hasVisited')
    if (hasVisited) {
      setShowPreloader(false)
      setIsFirstLoad(false)
    }
  }, [])

  const handlePreloaderComplete = () => {
    setShowPreloader(false)
    sessionStorage.setItem('hasVisited', 'true')
  }

  return (
    <div className="min-h-screen flex flex-col bg-luxury-cream">
      {/* Preloader - only on first load */}
      {showPreloader && isFirstLoad && !prefersReducedMotion && (
        <Preloader onComplete={handlePreloaderComplete} />
      )}

      {/* Scroll Progress Bar */}
      <ScrollProgress />

      {/* Navigation */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <Footer />

      {/* Back to Top Button */}
      <BackToTop />
    </div>
  )
}
