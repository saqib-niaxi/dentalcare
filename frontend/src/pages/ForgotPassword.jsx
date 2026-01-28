import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useNotification } from '../context/NotificationContext'
import { authAPI } from '../api/auth'
import Input from '../components/ui/Input'
import AnimatedSection from '../components/animations/AnimatedSection'
import { AnimatedHeading, GradientText } from '../components/ui/AnimatedText'
import PremiumCard from '../components/ui/PremiumCard'
import MagneticButton from '../components/ui/MagneticButton'
import { LockClosedIcon, EnvelopeIcon, KeyIcon } from '@heroicons/react/24/solid'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const { success, error } = useNotification()

  const [step, setStep] = useState(1) // 1: Email, 2: OTP, 3: Reset
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [passwords, setPasswords] = useState({
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)

  const handleSendOTP = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await authAPI.forgotPassword(email)
      success('OTP sent to your email')
      setStep(2)
    } catch (err) {
      error(err.response?.data?.message || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e) => {
    e.preventDefault()

    if (otp.length !== 6) {
      error('Please enter a valid 6-digit OTP')
      return
    }

    setStep(3)
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()

    if (passwords.password !== passwords.confirmPassword) {
      error('Passwords do not match')
      return
    }

    if (passwords.password.length < 6) {
      error('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      await authAPI.resetPassword({
        email,
        otp,
        password: passwords.password
      })
      success('Password reset successful! Please login.')
      navigate('/login')
    } catch (err) {
      error(err.response?.data?.message || 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    setLoading(true)

    try {
      await authAPI.forgotPassword(email)
      success('OTP sent again to your email')
    } catch (err) {
      error(err.response?.data?.message || 'Failed to resend OTP')
    } finally {
      setLoading(false)
    }
  }

  const getStepIcon = () => {
    switch (step) {
      case 1:
        return <LockClosedIcon className="w-8 h-8 text-luxury-gold" />
      case 2:
        return <EnvelopeIcon className="w-8 h-8 text-luxury-gold" />
      case 3:
        return <KeyIcon className="w-8 h-8 text-luxury-gold" />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-luxury-black via-luxury-charcoal to-luxury-slate relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-luxury-gold/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12 text-center">
          <AnimatedSection animation="fadeUp">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6">
              Reset Your <GradientText>Password</GradientText>
            </h1>
            <p className="text-white/70 text-lg max-w-md">
              Don't worry, it happens to the best of us. We'll help you get back into your account securely.
            </p>
          </AnimatedSection>

          <AnimatedSection animation="fadeUp" delay={0.3} className="mt-12">
            {/* Progress Steps */}
            <div className="flex items-center gap-4">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                      step >= s
                        ? 'bg-luxury-gold text-luxury-black'
                        : 'bg-white/10 text-white/50'
                    }`}
                  >
                    {s}
                  </div>
                  {s < 3 && (
                    <div
                      className={`w-12 h-0.5 transition-all ${
                        step > s ? 'bg-luxury-gold' : 'bg-white/20'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-6 mt-3 text-sm text-white/60">
              <span className={step >= 1 ? 'text-luxury-gold' : ''}>Email</span>
              <span className={step >= 2 ? 'text-luxury-gold' : ''}>Verify</span>
              <span className={step >= 3 ? 'text-luxury-gold' : ''}>Reset</span>
            </div>
          </AnimatedSection>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center py-12 px-4 bg-luxury-cream">
        <div className="max-w-md w-full">
          <AnimatedSection animation="fadeUp">
            <PremiumCard className="bg-white" glow>
              {step === 1 && (
                <>
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-luxury-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      {getStepIcon()}
                    </div>
                    <AnimatedHeading level={1} className="text-3xl text-luxury-black">
                      Forgot Password?
                    </AnimatedHeading>
                    <p className="text-gray-600 mt-2">
                      Enter your email and we'll send you a reset code
                    </p>
                  </div>

                  <form onSubmit={handleSendOTP}>
                    <Input
                      label="Email Address"
                      type="email"
                      name="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                    />

                    <MagneticButton
                      type="submit"
                      variant="primary"
                      loading={loading}
                      className="w-full"
                      magnetic={false}
                    >
                      {loading ? 'Sending...' : 'Send Reset Code'}
                    </MagneticButton>
                  </form>

                  <p className="text-center mt-6 text-gray-600">
                    Remember your password?{' '}
                    <Link to="/login" className="text-luxury-gold hover:text-luxury-goldDark font-semibold transition-colors">
                      Sign In
                    </Link>
                  </p>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-luxury-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      {getStepIcon()}
                    </div>
                    <AnimatedHeading level={1} className="text-3xl text-luxury-black">
                      Enter OTP
                    </AnimatedHeading>
                    <p className="text-gray-600 mt-2">
                      We sent a 6-digit code to<br />
                      <span className="font-medium text-luxury-black">{email}</span>
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
                      Verify OTP
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

              {step === 3 && (
                <>
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-luxury-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      {getStepIcon()}
                    </div>
                    <AnimatedHeading level={1} className="text-3xl text-luxury-black">
                      Reset Password
                    </AnimatedHeading>
                    <p className="text-gray-600 mt-2">
                      Enter your new password
                    </p>
                  </div>

                  <form onSubmit={handleResetPassword}>
                    <Input
                      label="New Password"
                      type="password"
                      name="password"
                      value={passwords.password}
                      onChange={(e) => setPasswords(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="At least 6 characters"
                      required
                    />

                    <Input
                      label="Confirm New Password"
                      type="password"
                      name="confirmPassword"
                      value={passwords.confirmPassword}
                      onChange={(e) => setPasswords(prev => ({ ...prev, confirmPassword: e.target.value }))}
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
                      {loading ? 'Resetting...' : 'Reset Password'}
                    </MagneticButton>
                  </form>
                </>
              )}
            </PremiumCard>
          </AnimatedSection>
        </div>
      </div>
    </div>
  )
}
