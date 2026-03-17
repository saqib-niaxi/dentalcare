import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useNotification } from '../context/NotificationContext'
import { useAppointments } from '../hooks/useAppointments'
import { useDoctors } from '../hooks/useDoctors'
import { useServices } from '../hooks/useServices'
import { appointmentsAPI } from '../api/appointments'
import useTheme from '../hooks/useTheme'
import { formatDate, formatTime } from '../utils/formatters'
import StatusBadge from '../components/ui/StatusBadge'
import AppointmentCard from '../components/ui/AppointmentCard'
import { PageLoader } from '../components/ui/LoadingSpinner'
import AnimatedSection, { AnimatedChildren } from '../components/animations/AnimatedSection'
import { AnimatedHeading, GradientText } from '../components/ui/AnimatedText'
import PremiumCard from '../components/ui/PremiumCard'
import MagneticButton from '../components/ui/MagneticButton'
import Modal from '../components/ui/Modal'
import { Select } from '../components/ui/Input'
import { CalendarDaysIcon, ClockIcon, DocumentTextIcon, ArrowPathIcon } from '@heroicons/react/24/solid'

export default function MyAppointments() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { success, error } = useNotification()
  const { appointments, loading, fetchMyAppointments } = useAppointments()
  const { doctors, fetchDoctorsByService, fetchDoctorAvailability } = useDoctors()
  const { services, fetchServices } = useServices()
  const { isDark } = useTheme()

  const [rescheduleModal, setRescheduleModal] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [rescheduleForm, setRescheduleForm] = useState({ service: '', doctor: '', date: '', time: '' })
  const [availableSlots, setAvailableSlots] = useState([])
  const [rescheduleLoading, setRescheduleLoading] = useState(false)
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/my-appointments' } } })
      return
    }
    fetchMyAppointments()
  }, [isAuthenticated, navigate, fetchMyAppointments])

  // Fetch services when modal opens
  useEffect(() => {
    if (rescheduleModal) {
      fetchServices()
    }
  }, [rescheduleModal, fetchServices])

  // Fetch availability when doctor + date changes
  useEffect(() => {
    if (rescheduleForm.doctor && rescheduleForm.date) {
      fetchDoctorAvailability(rescheduleForm.doctor, rescheduleForm.date)
        .then(slots => setAvailableSlots(slots))
        .catch(() => setAvailableSlots([]))
    } else {
      setAvailableSlots([])
    }
  }, [rescheduleForm.doctor, rescheduleForm.date])

  const openReschedule = (appointment) => {
    setSelectedAppointment(appointment)
    setRescheduleForm({
      service: appointment.service?._id || '',
      doctor: appointment.doctor?._id || '',
      date: '',
      time: ''
    })
    setAvailableSlots([])
    setRescheduleModal(true)
    // Fetch doctors for the pre-selected service without resetting form
    if (appointment.service?._id) {
      fetchDoctorsByService(appointment.service._id)
    }
  }

  const handleServiceChange = (e) => {
    const serviceId = e.target.value
    setRescheduleForm(prev => ({ ...prev, service: serviceId, doctor: '', date: '', time: '' }))
    setAvailableSlots([])
    if (serviceId) fetchDoctorsByService(serviceId)
  }

  const handleReschedule = async (e) => {
    e.preventDefault()
    if (!rescheduleForm.service || !rescheduleForm.doctor || !rescheduleForm.date || !rescheduleForm.time) {
      error('Please fill in all fields')
      return
    }
    setRescheduleLoading(true)
    try {
      await appointmentsAPI.reschedule(selectedAppointment._id, rescheduleForm)
      success('Appointment rescheduled successfully')
      setRescheduleModal(false)
      fetchMyAppointments()
    } catch (err) {
      error(err.response?.data?.message || 'Failed to reschedule appointment')
    } finally {
      setRescheduleLoading(false)
    }
  }

  // Get tomorrow's date as min date
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split('T')[0]

  if (!isAuthenticated) {
    return <PageLoader />
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
            <p className="text-luxury-gold tracking-widest text-sm mb-4 uppercase">Your Schedule</p>
          </AnimatedSection>
          <AnimatedHeading level={1} className="text-4xl md:text-5xl lg:text-6xl text-white mb-6">
            My <GradientText>Appointments</GradientText>
          </AnimatedHeading>
          <AnimatedSection animation="fadeUp" delay={0.3}>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              View and manage your dental appointments
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Appointments List */}
      <section className="py-20 md:py-32 bg-luxury-cream">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <PageLoader />
          ) : appointments.length === 0 ? (
            <AnimatedSection animation="fadeUp">
              <PremiumCard className="text-center py-12 bg-white" glow>
                <div className="w-20 h-20 bg-luxury-gold/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CalendarDaysIcon className="w-10 h-10 text-luxury-gold" />
                </div>
                <h2 className="text-2xl font-bold text-luxury-black mb-2">No Appointments Yet</h2>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  You haven't booked any appointments yet. Schedule your first visit today!
                </p>
                <MagneticButton to="/book-appointment" variant="luxury">
                  Book Your First Appointment
                </MagneticButton>
              </PremiumCard>
            </AnimatedSection>
          ) : (
            <>
              <AnimatedSection animation="fadeUp" className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                  <p className="text-luxury-gold tracking-widest text-sm mb-2 uppercase">Manage</p>
                  <h2 className="text-2xl font-bold text-luxury-black">
                    Your Appointments ({appointments.length})
                  </h2>
                </div>
                <MagneticButton to="/book-appointment" variant="primary">
                  Book New
                </MagneticButton>
              </AnimatedSection>

              <AnimatedChildren
                animation="fadeUp"
                stagger={0.1}
                className="space-y-4"
              >
                {appointments.map(appointment => (
                  <PremiumCard key={appointment._id} className="bg-white" glow>
                    <div className="flex flex-col md:flex-row md:items-center gap-6">
                      {/* Date */}
                      <div className="flex-shrink-0 text-center bg-gradient-to-br from-luxury-black to-luxury-charcoal rounded-xl p-6 w-full md:w-auto">
                        <div className="text-4xl font-bold text-luxury-gold">
                          {new Date(appointment.date).getDate()}
                        </div>
                        <div className="text-sm text-white/70">
                          {new Date(appointment.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </div>
                      </div>

                      {/* Details */}
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-luxury-black mb-3">
                          {appointment.service?.name || 'General Consultation'}
                        </h3>
                        <div className="space-y-2">
                          <div className="flex items-center gap-3 text-gray-600">
                            <CalendarDaysIcon className="w-5 h-5 text-primary" />
                            <span>{formatDate(appointment.date)}</span>
                          </div>
                          <div className="flex items-center gap-3 text-gray-600">
                            <ClockIcon className="w-5 h-5 text-primary" />
                            <span>{formatTime(appointment.time)}</span>
                          </div>
                          {appointment.notes && (
                            <div className="flex items-start gap-3 text-gray-600">
                              <DocumentTextIcon className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                              <span className="text-sm">{appointment.notes}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Status & Actions */}
                      <div className="flex-shrink-0 flex flex-col items-end gap-2">
                        <StatusBadge status={appointment.status} />
                        <AppointmentCard appointment={appointment} />
                        {appointment.status === 'pending' && (
                          <button
                            onClick={() => openReschedule(appointment)}
                            className="flex items-center gap-1.5 text-sm text-primary hover:text-luxury-gold transition-colors duration-200 font-medium"
                          >
                            <ArrowPathIcon className="w-4 h-4" />
                            Reschedule
                          </button>
                        )}
                      </div>
                    </div>
                  </PremiumCard>
                ))}
              </AnimatedChildren>
            </>
          )}
        </div>
      </section>

      {/* Reschedule Modal */}
      <Modal
        isOpen={rescheduleModal}
        onClose={() => setRescheduleModal(false)}
        title="Reschedule Appointment"
        size="md"
        dark={isDark}
      >
        <form onSubmit={handleReschedule} className="space-y-1">
          <Select
            label="Service"
            name="service"
            value={rescheduleForm.service}
            onChange={handleServiceChange}
            options={services.map(s => ({ value: s._id, label: s.name }))}
            placeholder="Select a service"
            required
          />
          <Select
            label="Doctor"
            name="doctor"
            value={rescheduleForm.doctor}
            onChange={(e) => setRescheduleForm(prev => ({ ...prev, doctor: e.target.value, date: '', time: '' }))}
            options={doctors.map(d => ({ value: d._id, label: `Dr. ${d.name} — ${d.specialization}` }))}
            placeholder="Select a doctor"
            disabled={!rescheduleForm.service}
            required
          />
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-200 font-medium mb-2">
              Date <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="date"
              min={minDate}
              value={rescheduleForm.date}
              onChange={(e) => setRescheduleForm(prev => ({ ...prev, date: e.target.value, time: '' }))}
              disabled={!rescheduleForm.doctor}
              required
              className="input-field dark:bg-luxury-slate dark:border-white/15 dark:text-gray-100 disabled:bg-gray-100 dark:disabled:bg-luxury-black disabled:cursor-not-allowed"
            />
          </div>
          <Select
            label="Time Slot"
            name="time"
            value={rescheduleForm.time}
            onChange={(e) => setRescheduleForm(prev => ({ ...prev, time: e.target.value }))}
            options={availableSlots.map(slot => ({ value: slot, label: formatTime(slot) }))}
            placeholder={availableSlots.length === 0 ? 'Select date first' : 'Select a time slot'}
            disabled={!rescheduleForm.date || availableSlots.length === 0}
            required
          />
          <div className="pt-2">
            <MagneticButton
              type="submit"
              variant="luxury"
              disabled={rescheduleLoading}
              className="w-full"
            >
              {rescheduleLoading ? 'Rescheduling...' : 'Confirm Reschedule'}
            </MagneticButton>
          </div>
        </form>
      </Modal>


    </div>
  )
}
