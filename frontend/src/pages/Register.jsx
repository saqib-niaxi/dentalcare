import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useNotification } from '../context/NotificationContext'
import { authAPI } from '../api/auth'
import Input from '../components/ui/Input'
import AnimatedSection from '../components/animations/AnimatedSection'
import { AnimatedHeading, GradientText } from '../components/ui/AnimatedText'
import PremiumCard from '../components/ui/PremiumCard'
import MagneticButton from '../components/ui/MagneticButton'
import { EnvelopeIcon, ShieldCheckIcon } from '@heroicons/react/24/solid'

export default function Register() {
  const navigate = useNavigate()
  const { verifyOTP } = useAuth()
  const { success, error } = useNotification()

  const [step, setStep] = useState(1) // 1: Register, 2: OTP Verification
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleRegister = async (e) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      error('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      error('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      await authAPI.register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      })
      success('Registration successful! Please verify your email.')
      setStep(2)
    } catch (err) {
      error(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const user = await verifyOTP(formData.email, otp)
      success('Email verified successfully!')
      navigate('/')
    } catch (err) {
      error(err.response?.data?.message || 'Invalid OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    setLoading(true)

    try {
      await authAPI.resendOTP(formData.email)
      success('OTP sent again to your email')
    } catch (err) {
      error(err.response?.data?.message || 'Failed to resend OTP')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-luxury-black via-luxury-charcoal to-luxury-slate relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 right-10 w-72 h-72 bg-luxury-gold/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12 text-center">
          <AnimatedSection animation="fadeUp">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6">
              Join <GradientText>Dr. Ahmed</GradientText> Dental
            </h1>
            <p className="text-white/70 text-lg max-w-md">
              Create your account to book appointments, track your dental health, and receive personalized care.
            </p>
          </AnimatedSection>

          <AnimatedSection animation="fadeUp" delay={0.3} className="mt-12">
            <div className="space-y-4 text-left">
              {[
                'Easy online appointment booking',
                'Track your dental health history',
                'Receive appointment reminders',
                'Access exclusive patient benefits'
              ].map((benefit, index) => (
                <div key={index} className="flex items-center gap-3 text-white/80">
                  <div className="w-6 h-6 rounded-full bg-luxury-gold/20 flex items-center justify-center">
                    <ShieldCheckIcon className="w-4 h-4 text-luxury-gold" />
                  </div>
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center py-12 px-4 bg-luxury-cream">
        <div className="max-w-md w-full">
          <AnimatedSection animation="fadeUp">
            <PremiumCard className="bg-white" glow>
              {step === 1 ? (
                <>
                  <div className="text-center mb-8">
                    <p className="text-luxury-gold tracking-widest text-sm mb-2 uppercase">Get Started</p>
                    <AnimatedHeading level={1} className="text-3xl text-luxury-black">
                      Create Account
                    </AnimatedHeading>
                    <p className="text-gray-600 mt-2">Join us for quality dental care</p>
                  </div>

                  <form onSubmit={handleRegister}>
                    <Input
                      label="Full Name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      required
                    />

                    <Input
                      label="Email Address"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      required
                    />

                    <Input
                      label="Phone Number"
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+92 300 1234567"
                      required
                    />

                    <Input
                      label="Password"
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="At least 6 characters"
                      required
                    />

                    <Input
                      label="Confirm Password"
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm your password"
                      required
                    />

                    <MagneticButton
                      type="submit"
                      variant="primary"
                      loading={loading}
                      className="w-full"
                      magnetic={false}
                    >
                      {loading ? 'Creating Account...' : 'Create Account'}
                    </MagneticButton>
                  </form>

                  <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white text-gray-500">Already registered?</span>
                    </div>
                  </div>

                  <p className="text-center text-gray-600">
                    Have an account?{' '}
                    <Link to="/login" className="text-luxury-gold hover:text-luxury-goldDark font-semibold transition-colors">
                      Sign In
                    </Link>
                  </p>
                </>
              ) : (
                <>
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-luxury-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <EnvelopeIcon className="w-8 h-8 text-luxury-gold" />
                    </div>
                    <AnimatedHeading level={1} className="text-3xl text-luxury-black">
                      Verify Email
                    </AnimatedHeading>
                    <p className="text-gray-600 mt-2">
                      We sent a 6-digit code to<br />
                      <span className="font-medium text-luxury-black">{formData.email}</span>
                    </p>
                  </div>

                  <form onSubmit={handleVerifyOTP}>
                    <Input
                      label="Enter OTP"
                      name="otp"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Enter 6-digit code"
                      maxLength={6}
                      required
                    />

                    <MagneticButton
                      type="submit"
                      variant="primary"
                      loading={loading}
                      className="w-full"
                      magnetic={false}
                    >
                      {loading ? 'Verifying...' : 'Verify Email'}
                    </MagneticButton>
                  </form>

                  <p className="text-center mt-6 text-gray-600">
                    Didn't receive the code?{' '}
                    <button
                      onClick={handleResendOTP}
                      disabled={loading}
                      className="text-luxury-gold hover:text-luxury-goldDark font-semibold transition-colors disabled:opacity-50"
                    >
                      Resend OTP
                    </button>
                  </p>
                </>
              )}
            </PremiumCard>
          </AnimatedSection>
        </div>
      </div>
    </div>
  )
}
