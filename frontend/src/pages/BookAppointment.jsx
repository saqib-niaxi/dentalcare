import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useNotification } from '../context/NotificationContext'
import { useServices } from '../hooks/useServices'
import { useAppointments } from '../hooks/useAppointments'
import Input, { Select, Textarea } from '../components/ui/Input'
import { PageLoader } from '../components/ui/LoadingSpinner'
import AnimatedSection, { AnimatedChildren } from '../components/animations/AnimatedSection'
import { AnimatedHeading, GradientText } from '../components/ui/AnimatedText'
import PremiumCard from '../components/ui/PremiumCard'
import MagneticButton from '../components/ui/MagneticButton'
import {
  CalendarDaysIcon,
  ClockIcon,
  DocumentTextIcon,
  InformationCircleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/solid'

export default function BookAppointment() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, isAdmin } = useAuth()
  const { success, error } = useNotification()
  const { services, loading: servicesLoading, fetchServices } = useServices()
  const { createAppointment, loading: bookingLoading } = useAppointments()

  const [formData, setFormData] = useState({
    service: location.state?.service || '',
    date: '',
    time: '',
    notes: ''
  })

  useEffect(() => {
    fetchServices()
  }, [fetchServices])

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } })
    }
    // Admin cannot book appointments - redirect to admin panel
    if (isAdmin) {
      navigate('/admin')
    }
  }, [isAuthenticated, isAdmin, navigate, location])

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.service || !formData.date || !formData.time) {
      error('Please fill in all required fields')
      return
    }

    try {
      await createAppointment(formData)
      success('Appointment booked successfully!')
      navigate('/my-appointments')
    } catch (err) {
      error(err.response?.data?.message || 'Failed to book appointment')
    }
  }

  // Generate time slots
  const timeSlots = []
  for (let hour = 9; hour < 18; hour++) {
    const time24 = `${hour.toString().padStart(2, '0')}:00`
    const hour12 = hour > 12 ? hour - 12 : hour
    const ampm = hour >= 12 ? 'PM' : 'AM'
    timeSlots.push({
      value: time24,
      label: `${hour12}:00 ${ampm}`
    })
    if (hour < 17) {
      timeSlots.push({
        value: `${hour.toString().padStart(2, '0')}:30`,
        label: `${hour12}:30 ${ampm}`
      })
    }
  }

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0]

  if (!isAuthenticated || isAdmin) {
    return <PageLoader />
  }

  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-luxury-black via-luxury-charcoal to-luxury-slate text-white py-24 md:py-32">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 right-20 w-64 h-64 bg-luxury-gold/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimatedSection animation="fadeUp">
            <p className="text-luxury-gold tracking-widest text-sm mb-4 uppercase">Schedule Your Visit</p>
          </AnimatedSection>
          <AnimatedHeading level={1} className="text-4xl md:text-5xl lg:text-6xl text-white mb-6">
            Book <GradientText>Appointment</GradientText>
          </AnimatedHeading>
          <AnimatedSection animation="fadeUp" delay={0.3}>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              Schedule your visit with Dr. Ahmed. We'll confirm your appointment shortly.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Booking Form */}
      <section className="py-20 md:py-32 bg-luxury-cream">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Form */}
            <div className="md:col-span-2">
              <AnimatedSection animation="fadeUp">
                <PremiumCard className="bg-white" glow>
                  <h2 className="text-2xl font-bold text-luxury-black mb-6">Appointment Details</h2>

                  {servicesLoading ? (
                    <PageLoader />
                  ) : (
                    <form onSubmit={handleSubmit}>
                      <Select
                        label="Select Service"
                        name="service"
                        value={formData.service}
                        onChange={handleChange}
                        placeholder="Choose a service"
                        options={services.map(s => ({
                          value: s._id,
                          label: `${s.name} - PKR ${s.price.toLocaleString()}`
                        }))}
                        required
                      />

                      <div className="grid sm:grid-cols-2 gap-4">
                        <Input
                          label="Preferred Date"
                          type="date"
                          name="date"
                          value={formData.date}
                          onChange={handleChange}
                          min={today}
                          required
                        />

                        <Select
                          label="Preferred Time"
                          name="time"
                          value={formData.time}
                          onChange={handleChange}
                          placeholder="Choose a time slot"
                          options={timeSlots}
                          required
                        />
                      </div>

                      <Textarea
                        label="Additional Notes (Optional)"
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        placeholder="Any specific concerns or requests?"
                        rows={4}
                      />

                      <MagneticButton
                        type="submit"
                        variant="luxury"
                        loading={bookingLoading}
                        className="w-full"
                        magnetic={false}
                        size="lg"
                      >
                        {bookingLoading ? 'Booking...' : 'Book Appointment'}
                      </MagneticButton>
                    </form>
                  )}
                </PremiumCard>
              </AnimatedSection>
            </div>

            {/* Info Sidebar */}
            <div className="md:col-span-1">
              <AnimatedSection animation="fadeLeft" delay={0.2}>
                <PremiumCard className="!bg-gradient-to-br !from-luxury-black !to-luxury-charcoal !border-white/10 text-white mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <InformationCircleIcon className="w-6 h-6 text-luxury-gold" />
                    <h3 className="font-semibold text-lg">Important Notes</h3>
                  </div>
                  <ul className="space-y-3 text-sm text-white/80">
                    {[
                      'Please arrive 10 minutes before your appointment',
                      'Bring any previous dental records if available',
                      'Inform us if you have any allergies or medical conditions',
                      'We\'ll send you a confirmation email shortly'
                    ].map((note, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircleIcon className="w-5 h-5 text-luxury-gold flex-shrink-0 mt-0.5" />
                        <span>{note}</span>
                      </li>
                    ))}
                  </ul>
                </PremiumCard>

                <PremiumCard className="bg-white">
                  <h3 className="font-semibold text-lg text-luxury-black mb-4">Clinic Hours</h3>
                  <div className="space-y-2 text-sm">
                    {[
                      { day: 'Mon - Fri', time: '9:00 AM - 6:00 PM' },
                      { day: 'Saturday', time: '9:00 AM - 2:00 PM' },
                      { day: 'Sunday', time: 'Closed' }
                    ].map((item, index) => (
                      <div key={index} className="flex justify-between text-gray-600">
                        <span>{item.day}</span>
                        <span className="font-medium">{item.time}</span>
                      </div>
                    ))}
                  </div>
                </PremiumCard>
              </AnimatedSection>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
