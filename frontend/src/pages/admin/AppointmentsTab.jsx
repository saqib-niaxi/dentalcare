import { useState } from 'react'
import { appointmentsAPI } from '../../api/appointments'
import { useNotification } from '../../context/NotificationContext'
import { formatShortDate, formatTime } from '../../utils/formatters'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import {
  ArrowPathIcon,
  EyeIcon,
  CheckIcon,
  XMarkIcon,
  TrashIcon,
  CalendarDaysIcon,
  ClockIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'

const StatusBadge = ({ status }) => {
  const styles = {
    pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    approved: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    completed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    cancelled: 'bg-red-500/20 text-red-400 border-red-500/30'
  }

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[status] || styles.pending}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

export default function AppointmentsTab({ appointments, onRefresh }) {
  const { success, error } = useNotification()
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('all')

  const handleStatusUpdate = async (id, status) => {
    setLoading(true)
    try {
      await appointmentsAPI.update(id, { status })
      success(`Appointment ${status}!`)
      onRefresh()
      setSelectedAppointment(null)
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update appointment')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this appointment?')) return

    setLoading(true)
    try {
      await appointmentsAPI.delete(id)
      success('Appointment deleted!')
      onRefresh()
      setSelectedAppointment(null)
    } catch (err) {
      error(err.response?.data?.message || 'Failed to delete appointment')
    } finally {
      setLoading(false)
    }
  }

  const filteredAppointments = appointments.filter(apt => {
    if (filter === 'all') return true
    return apt.status === filter
  })

  const sortedAppointments = [...filteredAppointments].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  )

  const filters = [
    { id: 'all', label: 'All', count: appointments.length },
    { id: 'pending', label: 'Pending', count: appointments.filter(a => a.status === 'pending').length },
    { id: 'approved', label: 'Approved', count: appointments.filter(a => a.status === 'approved').length },
    { id: 'completed', label: 'Completed', count: appointments.filter(a => a.status === 'completed').length }
  ]

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Appointments</h2>
          <p className="text-slate-400 text-sm mt-1">Manage and track all patient appointments</p>
        </div>
        <button
          onClick={onRefresh}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 transition-all"
        >
          <ArrowPathIcon className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {filters.map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === f.id
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10 hover:text-white'
            }`}
          >
            {f.label}
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
              filter === f.id ? 'bg-amber-500/30' : 'bg-white/10'
            }`}>
              {f.count}
            </span>
          </button>
        ))}
      </div>

      {sortedAppointments.length === 0 ? (
        <div className="text-center py-16">
          <CalendarDaysIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-lg">No appointments found</p>
          <p className="text-slate-500 text-sm mt-1">Appointments will appear here when patients book them</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedAppointments.map(appointment => (
            <div
              key={appointment._id}
              className="bg-slate-700/30 hover:bg-slate-700/50 rounded-xl p-4 border border-white/5 hover:border-white/10 transition-all duration-200 group"
            >
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {/* Patient Info */}
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center text-slate-900 font-bold text-lg shrink-0">
                    {appointment.patient?.name?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-white truncate">{appointment.patient?.name || 'Unknown'}</h3>
                    <p className="text-slate-400 text-sm truncate">{appointment.patient?.email}</p>
                  </div>
                </div>

                {/* Service */}
                <div className="lg:w-48">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Service</p>
                  <p className="text-white font-medium truncate">{appointment.service?.name || 'General Consultation'}</p>
                </div>

                {/* Date & Time */}
                <div className="lg:w-40">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Schedule</p>
                  <div className="flex items-center gap-2">
                    <CalendarDaysIcon className="w-4 h-4 text-slate-400" />
                    <span className="text-white">{formatShortDate(appointment.date)}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <ClockIcon className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-300 text-sm">{formatTime(appointment.time)}</span>
                  </div>
                </div>

                {/* Status */}
                <div className="lg:w-32">
                  <StatusBadge status={appointment.status} />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedAppointment(appointment)}
                    className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                    title="View Details"
                  >
                    <EyeIcon className="w-5 h-5" />
                  </button>
                  {appointment.status === 'pending' && (
                    <button
                      onClick={() => handleStatusUpdate(appointment._id, 'approved')}
                      className="p-2 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/20 rounded-lg transition-all"
                      title="Approve"
                    >
                      <CheckIcon className="w-5 h-5" />
                    </button>
                  )}
                  {appointment.status !== 'completed' && appointment.status !== 'cancelled' && (
                    <button
                      onClick={() => handleStatusUpdate(appointment._id, 'completed')}
                      className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-lg transition-all"
                      title="Mark Complete"
                    >
                      <CheckIcon className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Appointment Detail Modal */}
      <Modal
        isOpen={!!selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
        title="Appointment Details"
        dark
      >
        {selectedAppointment && (
          <div className="space-y-6">
            {/* Patient Section */}
            <div className="bg-slate-700/30 rounded-xl p-4 border border-white/5">
              <h4 className="text-amber-400 text-sm font-medium mb-3 flex items-center gap-2">
                <UserIcon className="w-4 h-4" />
                Patient Information
              </h4>
              <div className="space-y-2">
                <p className="text-white font-semibold text-lg">{selectedAppointment.patient?.name || 'N/A'}</p>
                <div className="flex items-center gap-2 text-slate-300">
                  <EnvelopeIcon className="w-4 h-4 text-slate-400" />
                  {selectedAppointment.patient?.email}
                </div>
                {selectedAppointment.patient?.phone && (
                  <div className="flex items-center gap-2 text-slate-300">
                    <PhoneIcon className="w-4 h-4 text-slate-400" />
                    {selectedAppointment.patient?.phone}
                  </div>
                )}
              </div>
            </div>

            {/* Appointment Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-700/30 rounded-xl p-4 border border-white/5">
                <p className="text-slate-400 text-xs uppercase tracking-wider mb-2">Service</p>
                <p className="text-white font-medium">{selectedAppointment.service?.name || 'General Consultation'}</p>
              </div>
              <div className="bg-slate-700/30 rounded-xl p-4 border border-white/5">
                <p className="text-slate-400 text-xs uppercase tracking-wider mb-2">Status</p>
                <StatusBadge status={selectedAppointment.status} />
              </div>
              <div className="bg-slate-700/30 rounded-xl p-4 border border-white/5">
                <p className="text-slate-400 text-xs uppercase tracking-wider mb-2">Date</p>
                <p className="text-white font-medium">{formatShortDate(selectedAppointment.date)}</p>
              </div>
              <div className="bg-slate-700/30 rounded-xl p-4 border border-white/5">
                <p className="text-slate-400 text-xs uppercase tracking-wider mb-2">Time</p>
                <p className="text-white font-medium">{formatTime(selectedAppointment.time)}</p>
              </div>
            </div>

            {/* Notes */}
            {selectedAppointment.notes && (
              <div className="bg-slate-700/30 rounded-xl p-4 border border-white/5">
                <h4 className="text-amber-400 text-sm font-medium mb-2 flex items-center gap-2">
                  <DocumentTextIcon className="w-4 h-4" />
                  Notes
                </h4>
                <p className="text-slate-300">{selectedAppointment.notes}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-4 border-t border-white/10">
              {selectedAppointment.status === 'pending' && (
                <button
                  onClick={() => handleStatusUpdate(selectedAppointment._id, 'approved')}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-all disabled:opacity-50"
                >
                  <CheckIcon className="w-4 h-4" />
                  Approve
                </button>
              )}
              {selectedAppointment.status !== 'completed' && (
                <button
                  onClick={() => handleStatusUpdate(selectedAppointment._id, 'completed')}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-all disabled:opacity-50"
                >
                  <CheckIcon className="w-4 h-4" />
                  Mark Completed
                </button>
              )}
              {selectedAppointment.status !== 'cancelled' && (
                <button
                  onClick={() => handleStatusUpdate(selectedAppointment._id, 'cancelled')}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-xl font-medium transition-all disabled:opacity-50"
                >
                  <XMarkIcon className="w-4 h-4" />
                  Cancel
                </button>
              )}
              <button
                onClick={() => handleDelete(selectedAppointment._id)}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl font-medium transition-all disabled:opacity-50 ml-auto"
              >
                <TrashIcon className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
