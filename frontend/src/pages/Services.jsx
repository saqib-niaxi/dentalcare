import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useServices } from '../hooks/useServices'
import { useAuth } from '../hooks/useAuth'
import { useNotification } from '../context/NotificationContext'
import { appointmentsAPI } from '../api/appointments'
import { formatCurrency } from '../utils/formatters'
import { PageLoader } from '../components/ui/LoadingSpinner'
import { getServiceIcon, getServiceColor } from '../utils/icons'
import Modal from '../components/ui/Modal'
import AnimatedSection, { AnimatedChildren } from '../components/animations/AnimatedSection'
import { AnimatedHeading, GradientText } from '../components/ui/AnimatedText'
import PremiumCard from '../components/ui/PremiumCard'
import MagneticButton from '../components/ui/MagneticButton'

export default function Services() {
  const { services, loading, error, fetchServices } = useServices()
  const { user } = useAuth()
  const { success, error: showError } = useNotification()
  const navigate = useNavigate()

  const [showConsultationModal, setShowConsultationModal] = useState(false)
  const [consultationForm, setConsultationForm] = useState({
    date: '',
    time: '',
    notes: ''
  })
  const [consultationLoading, setConsultationLoading] = useState(false)

  // Generate available time slots
  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00'
  ]

  // Get minimum date (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  }

  const handleOpenConsultationModal = () => {
    if (!user) {
      showError('Please login to book a consultation')
      navigate('/login')
      return
    }
    if (user.role === 'admin') {
      showError('Admins cannot book appointments')
      return
    }
    setShowConsultationModal(true)
  }

  const handleCloseModal = () => {
    setShowConsultationModal(false)
    setConsultationForm({ date: '', time: '', notes: '' })
  }

  const handleConsultationSubmit = async (e) => {
    e.preventDefault()

    if (!consultationForm.date || !consultationForm.time) {
      showError('Please select a date and time')
      return
    }

    setConsultationLoading(true)
    try {
      await appointmentsAPI.create({
        date: consultationForm.date,
        time: consultationForm.time,
        notes: consultationForm.notes || 'General consultation requested'
      })
      success('Consultation booked successfully!')
      handleCloseModal()
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to book consultation')
    } finally {
      setConsultationLoading(false)
    }
  }

  useEffect(() => {
    fetchServices()
  }, [fetchServices])

  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-luxury-black via-luxury-charcoal to-luxury-slate text-white py-24 md:py-32">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-20 w-64 h-64 bg-luxury-gold/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimatedSection animation="fadeUp">
            <p className="text-luxury-gold tracking-widest text-sm mb-4 uppercase">What We Offer</p>
          </AnimatedSection>
          <AnimatedHeading level={1} className="text-4xl md:text-5xl lg:text-6xl text-white mb-6">
            Our <GradientText>Services</GradientText>
          </AnimatedHeading>
          <AnimatedSection animation="fadeUp" delay={0.3}>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              Comprehensive dental care services to meet all your oral health needs.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Services List */}
      <section className="py-20 md:py-32 bg-luxury-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <PageLoader />
          ) : error ? (
            <div className="text-center text-red-500 py-8">{error}</div>
          ) : services.length === 0 ? (
            <div className="text-center text-gray-500 py-8">No services available at the moment.</div>
          ) : (
            <AnimatedChildren
              animation="fadeUp"
              stagger={0.1}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {services.map(service => (
                <PremiumCard key={service._id} className="bg-white flex flex-col h-full" glow>
                  {/* Icon Section */}
                  <div className="mb-6 flex justify-center">
                    <div className={`p-4 rounded-2xl ${getServiceColor(service.name)}`}>
                      {(() => {
                        const IconComponent = getServiceIcon(service.name)
                        return <IconComponent className="w-12 h-12" />
                      })()}
                    </div>
                  </div>

                  {/* Service Details */}
                  <div className="flex-grow">
                    <h3 className="text-xl font-semibold text-luxury-black mb-3">{service.name}</h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">{service.description}</p>

                    {/* Price & Duration */}
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <span className="text-2xl font-bold text-luxury-gold">
                          {formatCurrency(service.price)}
                        </span>
                        <span className="text-sm text-gray-500 block mt-1">Starting price</span>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center text-gray-600">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                          <span className="font-medium">{service.duration} mins</span>
                        </div>
                        <span className="text-xs text-gray-500">Duration</span>
                      </div>
                    </div>
                  </div>

                  {/* Book Button */}
                  <MagneticButton
                    to="/book-appointment"
                    state={{ service: service._id }}
                    variant="primary"
                    className="w-full mt-auto"
                  >
                    Book Now
                  </MagneticButton>
                </PremiumCard>
              ))}
            </AnimatedChildren>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-luxury-black to-luxury-charcoal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimatedSection animation="fadeUp">
            <p className="text-luxury-gold tracking-widest text-sm mb-4 uppercase">Need Guidance?</p>
          </AnimatedSection>
          <AnimatedHeading level={2} className="text-3xl md:text-4xl text-white mb-4">
            Not Sure Which Service You Need?
          </AnimatedHeading>
          <AnimatedSection animation="fadeUp" delay={0.2}>
            <p className="text-white/70 max-w-2xl mx-auto mb-8">
              Book a consultation appointment and our expert team will assess your dental health and recommend the best treatment plan for you.
            </p>
          </AnimatedSection>
          <AnimatedSection animation="fadeUp" delay={0.3}>
            <MagneticButton onClick={handleOpenConsultationModal} variant="luxury" size="lg">
              Book a Consultation
            </MagneticButton>
          </AnimatedSection>
        </div>
      </section>

      {/* Consultation Booking Modal */}
      <Modal
        isOpen={showConsultationModal}
        onClose={handleCloseModal}
        title="Book a Consultation"
      >
        <form onSubmit={handleConsultationSubmit} className="space-y-6">
          <p className="text-gray-600 mb-4">
            Schedule a consultation with our dental experts. We'll assess your oral health and recommend the best treatment options.
          </p>

          {/* Date Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              min={getMinDate()}
              value={consultationForm.date}
              onChange={(e) => setConsultationForm({ ...consultationForm, date: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              required
            />
          </div>

          {/* Time Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Time <span className="text-red-500">*</span>
            </label>
            <select
              value={consultationForm.time}
              onChange={(e) => setConsultationForm({ ...consultationForm, time: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              required
            >
              <option value="">Choose a time slot</option>
              {timeSlots.map(slot => (
                <option key={slot} value={slot}>{slot}</option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes (Optional)
            </label>
            <textarea
              value={consultationForm.notes}
              onChange={(e) => setConsultationForm({ ...consultationForm, notes: e.target.value })}
              placeholder="Describe any concerns or symptoms you'd like to discuss..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none transition-all"
              rows="3"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={handleCloseModal}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={consultationLoading}
              className="flex-1 bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {consultationLoading ? 'Booking...' : 'Book Consultation'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
