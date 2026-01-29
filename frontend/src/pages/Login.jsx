import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useNotification } from '../context/NotificationContext'
import Input from '../components/ui/Input'
import AnimatedSection from '../components/animations/AnimatedSection'
import { AnimatedHeading, GradientText } from '../components/ui/AnimatedText'
import PremiumCard from '../components/ui/PremiumCard'
import MagneticButton from '../components/ui/MagneticButton'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const { success, error } = useNotification()

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)

  const from = location.state?.from?.pathname || '/'

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const user = await login(formData.email, formData.password)
      success(`Welcome back, ${user.name}!`)

      if (user.role === 'admin') {
        navigate('/admin')
      } else {
        navigate(from, { replace: true })
      }
    } catch (err) {
      error(err.response?.data?.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex pt-20">
      {/* Left Side - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-luxury-black via-luxury-charcoal to-luxury-slate relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-luxury-gold/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12 text-center">
          <AnimatedSection animation="fadeUp">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6">
              Welcome to <GradientText>Dr. Ahmed</GradientText>
            </h1>
            <p className="text-white/70 text-lg max-w-md">
              Your trusted partner for exceptional dental care. Sign in to manage your appointments and oral health journey.
            </p>
          </AnimatedSection>

          <AnimatedSection animation="fadeUp" delay={0.3} className="mt-12">
            <div className="flex items-center gap-8 text-white/60">
              <div className="text-center">
                <div className="text-3xl font-bold text-luxury-gold">15+</div>
                <div className="text-sm">Years Experience</div>
              </div>
              <div className="w-px h-12 bg-white/20" />
              <div className="text-center">
                <div className="text-3xl font-bold text-luxury-gold">10K+</div>
                <div className="text-sm">Happy Patients</div>
              </div>
              <div className="w-px h-12 bg-white/20" />
              <div className="text-center">
                <div className="text-3xl font-bold text-luxury-gold">20+</div>
                <div className="text-sm">Services</div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center py-12 px-4 bg-luxury-cream">
        <div className="max-w-md w-full">
          <AnimatedSection animation="fadeUp">
            <PremiumCard className="bg-white" glow>
              <div className="text-center mb-8">
                <p className="text-luxury-gold tracking-widest text-sm mb-2 uppercase">Welcome Back</p>
                <AnimatedHeading level={1} className="text-3xl text-luxury-black">
                  Sign In
                </AnimatedHeading>
                <p className="text-gray-600 mt-2">Access your account</p>
              </div>

              <form onSubmit={handleSubmit}>
                <Input
                  label="Email Address"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                />

                <Input
                  label="Password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                />

                <div className="flex justify-end mb-6">
                  <Link to="/forgot-password" className="text-primary hover:text-primary-dark text-sm transition-colors">
                    Forgot Password?
                  </Link>
                </div>

                <MagneticButton
                  type="submit"
                  variant="primary"
                  loading={loading}
                  className="w-full"
                  magnetic={false}
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                </MagneticButton>
              </form>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">New here?</span>
                </div>
              </div>

              <p className="text-center text-gray-600">
                Don't have an account?{' '}
                <Link to="/register" className="text-luxury-gold hover:text-luxury-goldDark font-semibold transition-colors">
                  Create Account
                </Link>
              </p>
            </PremiumCard>
          </AnimatedSection>
        </div>
      </div>
    </div>
  )
}
