import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import axios from 'axios'
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
  const [bookedSlots, setBookedSlots] = useState([])

  useEffect(() => {
    fetchServices()
  }, [fetchServices])

  // Fetch booked appointments when date changes
  useEffect(() => {
    const fetchBookedSlots = async () => {
      if (!formData.date) {
        setBookedSlots([])
        return
      }

      try {
        const response = await axios.get('/api/appointments')
        const selectedDateStr = formData.date
        const bookedForDate = response.data.appointments
          .filter(apt => {
            const aptDate = new Date(apt.date).toISOString().split('T')[0]
            return aptDate === selectedDateStr && apt.status !== 'cancelled'
          })
          .map(apt => apt.time)
        setBookedSlots(bookedForDate)
      } catch (err) {
        console.error('Failed to fetch booked slots:', err)
      }
    }

    fetchBookedSlots()
  }, [formData.date])

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

  // Generate time slots based on selected date
  const generateTimeSlots = () => {
    if (!formData.date) return []

    const selectedDate = new Date(formData.date)
    const dayOfWeek = selectedDate.getDay() // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

    // Sunday - clinic closed
    if (dayOfWeek === 0) {
      return []
    }

    const slots = []
    let endHour = 18 // Default: Monday-Friday (9 AM - 6 PM)

    // Saturday: 9 AM - 2 PM
    if (dayOfWeek === 6) {
      endHour = 14
    }

    for (let hour = 9; hour < endHour; hour++) {
      const time24 = `${hour.toString().padStart(2, '0')}:00`
      const hour12 = hour > 12 ? hour - 12 : hour === 12 ? 12 : hour
      const ampm = hour >= 12 ? 'PM' : 'AM'

      // Check if this slot is booked
      const isBooked = bookedSlots.includes(time24)
      if (!isBooked) {
        slots.push({
          value: time24,
          label: `${hour12}:00 ${ampm}`
        })
      }

      if (hour < endHour - 1) {
        const time3024 = `${hour.toString().padStart(2, '0')}:30`
        const isBooked30 = bookedSlots.includes(time3024)
        if (!isBooked30) {
          slots.push({
            value: time3024,
            label: `${hour12}:30 ${ampm}`
          })
        }
      }
    }

    return slots
  }

  // Get minimum date (tomorrow instead of today)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split('T')[0]

  // Check if selected date is Sunday
  const selectedDate = formData.date ? new Date(formData.date) : null
  const isSunday = selectedDate && selectedDate.getDay() === 0
  const timeSlots = generateTimeSlots()

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
                          min={minDate}
                          required
                        />

                        <div>
                          <Select
                            label="Preferred Time"
                            name="time"
                            value={formData.time}
                            onChange={handleChange}
                            placeholder={isSunday ? "Clinic Closed" : "Choose a time slot"}
                            options={timeSlots}
                            disabled={isSunday || timeSlots.length === 0 || !formData.date}
                            required
                          />
                          {isSunday && (
                            <p className="text-red-500 text-sm mt-1">Clinic is closed on Sundays</p>
                          )}
                          {!isSunday && !formData.date && (
                            <p className="text-gray-500 text-sm mt-1">Select a date first</p>
                          )}
                          {!isSunday && formData.date && timeSlots.length === 0 && bookedSlots.length > 0 && (
                            <p className="text-red-500 text-sm mt-1">All slots are booked. Please select another date.</p>
                          )}
                          {!isSunday && formData.date && bookedSlots.length > 0 && (
                            <p className="text-amber-600 text-sm mt-1">{bookedSlots.length} slot(s) already booked on this date</p>
                          )}
                        </div>
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
