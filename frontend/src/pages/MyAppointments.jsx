import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useAppointments } from '../hooks/useAppointments'
import { formatDate, formatTime } from '../utils/formatters'
import StatusBadge from '../components/ui/StatusBadge'
import { PageLoader } from '../components/ui/LoadingSpinner'
import AnimatedSection, { AnimatedChildren } from '../components/animations/AnimatedSection'
import { AnimatedHeading, GradientText } from '../components/ui/AnimatedText'
import PremiumCard from '../components/ui/PremiumCard'
import MagneticButton from '../components/ui/MagneticButton'
import { CalendarDaysIcon, ClockIcon, DocumentTextIcon } from '@heroicons/react/24/solid'

export default function MyAppointments() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { appointments, loading, fetchMyAppointments } = useAppointments()

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/my-appointments' } } })
      return
    }
    fetchMyAppointments()
  }, [isAuthenticated, navigate, fetchMyAppointments])

  if (!isAuthenticated) {
    return <PageLoader />
  }

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

                      {/* Status */}
                      <div className="flex-shrink-0">
                        <StatusBadge status={appointment.status} />
                      </div>
                    </div>
                  </PremiumCard>
                ))}
              </AnimatedChildren>
            </>
          )}
        </div>
      </section>
    </div>
  )
}
