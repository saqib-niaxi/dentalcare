import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { NotificationProvider } from './context/NotificationContext'
import { AnimationProvider } from './context/AnimationContext'
import './index.css'

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger)

// Configure GSAP defaults for premium experience
gsap.config({
  nullTargetWarn: false,
  autoSleep: 60,
  force3D: true,
})

// Initialize performance optimizations for luxury experience
const initPerformanceOptimizations = () => {
  // GSAP uses requestAnimationFrame by default in modern versions

  // Reduce lag smoothing for crisp animations
  gsap.ticker.lagSmoothing(0)

  // Set performance preferences based on device
  if ('hardwareConcurrency' in navigator) {
    const cores = navigator.hardwareConcurrency
    if (cores < 4) {
      // Reduce animation complexity on lower-end devices
      gsap.config({ force3D: false })
    }
  }
}

// Initialize on DOM content loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPerformanceOptimizations)
} else {
  initPerformanceOptimizations()
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <NotificationProvider>
        <AuthProvider>
          <AnimationProvider>
            <App />
          </AnimationProvider>
        </AuthProvider>
      </NotificationProvider>
    </BrowserRouter>
  </React.StrictMode>
)
