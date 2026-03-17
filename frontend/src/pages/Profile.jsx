import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNotification } from '../context/NotificationContext'
import { authAPI } from '../api/auth'
import Input from '../components/ui/Input'
import PremiumCard from '../components/ui/PremiumCard'
import MagneticButton from '../components/ui/MagneticButton'
import AnimatedSection from '../components/animations/AnimatedSection'
import { AnimatedHeading, GradientText } from '../components/ui/AnimatedText'
import { UserCircleIcon, LockClosedIcon } from '@heroicons/react/24/solid'

export default function Profile() {
  const { user, updateUser } = useAuth()
  const { success, error } = useNotification()

  const [profileForm, setProfileForm] = useState({ name: user?.name || '', phone: user?.phone || '' })
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' })
  const [profileLoading, setProfileLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)

  const handleProfileChange = (e) => setProfileForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  const handlePasswordChange = (e) => setPasswordForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setProfileLoading(true)
    try {
      const res = await authAPI.updateProfile(profileForm)
      updateUser(res.data.user)
      success('Profile updated successfully')
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update profile')
    } finally {
      setProfileLoading(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      error('New passwords do not match')
      return
    }
    setPasswordLoading(true)
    try {
      await authAPI.changePassword({
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword
      })
      success('Password changed successfully')
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      error(err.response?.data?.message || 'Failed to change password')
    } finally {
      setPasswordLoading(false)
    }
  }

  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-luxury-black via-luxury-charcoal to-luxury-slate text-white py-24 md:py-32">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-20 w-64 h-64 bg-luxury-gold/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimatedSection animation="fadeUp">
            <p className="text-luxury-gold tracking-widest text-sm mb-4 uppercase">Account</p>
          </AnimatedSection>
          <AnimatedHeading level={1} className="text-4xl md:text-5xl lg:text-6xl text-white mb-6">
            My <GradientText>Profile</GradientText>
          </AnimatedHeading>
          <AnimatedSection animation="fadeUp" delay={0.3}>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              Manage your personal information and security settings
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Profile Content */}
      <section className="py-20 md:py-32 bg-luxury-cream dark:bg-luxury-charcoal">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

          {/* Update Info */}
          <AnimatedSection animation="fadeUp">
            <PremiumCard glow>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-luxury-gold/10 rounded-full flex items-center justify-center">
                  <UserCircleIcon className="w-6 h-6 text-luxury-gold" />
                </div>
                <h2 className="text-xl font-semibold text-luxury-black">Personal Information</h2>
              </div>
              <form onSubmit={handleProfileSubmit}>
                <Input
                  label="Full Name"
                  name="name"
                  value={profileForm.name}
                  onChange={handleProfileChange}
                  placeholder="Your full name"
                  required
                />
                <Input
                  label="Email"
                  name="email"
                  value={user?.email || ''}
                  disabled
                  className="opacity-60"
                />
                <Input
                  label="Phone Number"
                  name="phone"
                  value={profileForm.phone}
                  onChange={handleProfileChange}
                  placeholder="Your phone number"
                  required
                />
                <MagneticButton
                  type="submit"
                  variant="luxury"
                  disabled={profileLoading}
                  className="w-full mt-2"
                >
                  {profileLoading ? 'Saving...' : 'Save Changes'}
                </MagneticButton>
              </form>
            </PremiumCard>
          </AnimatedSection>

          {/* Change Password */}
          <AnimatedSection animation="fadeUp" delay={0.1}>
            <PremiumCard glow>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-luxury-gold/10 rounded-full flex items-center justify-center">
                  <LockClosedIcon className="w-6 h-6 text-luxury-gold" />
                </div>
                <h2 className="text-xl font-semibold text-luxury-black">Change Password</h2>
              </div>
              <form onSubmit={handlePasswordSubmit}>
                <Input
                  label="Current Password"
                  type="password"
                  name="oldPassword"
                  value={passwordForm.oldPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter current password"
                  required
                />
                <Input
                  label="New Password"
                  type="password"
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter new password (min 6 chars)"
                  required
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Confirm new password"
                  required
                />
                <MagneticButton
                  type="submit"
                  variant="luxury"
                  disabled={passwordLoading}
                  className="w-full mt-2"
                >
                  {passwordLoading ? 'Changing...' : 'Change Password'}
                </MagneticButton>
              </form>
            </PremiumCard>
          </AnimatedSection>

        </div>
      </section>
    </div>
  )
}
