import { useState } from 'react'
import { appointmentsAPI } from '../../api/appointments'
import { useNotification } from '../../context/NotificationContext'
import { formatShortDate, formatTime } from '../../utils/formatters'
import Button from '../../components/ui/Button'
import StatusBadge from '../../components/ui/StatusBadge'
import Modal from '../../components/ui/Modal'

export default function AppointmentsTab({ appointments, onRefresh }) {
  const { success, error } = useNotification()
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [loading, setLoading] = useState(false)

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

  const sortedAppointments = [...appointments].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  )

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-dark">All Appointments</h2>
        <Button onClick={onRefresh} variant="ghost" size="sm">
          Refresh
        </Button>
      </div>

      {appointments.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No appointments found
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-light">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Patient</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Service</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Date & Time</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedAppointments.map(appointment => (
                <tr key={appointment._id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <div className="font-medium">{appointment.patient?.name || 'N/A'}</div>
                    <div className="text-sm text-gray-500">{appointment.patient?.email}</div>
                  </td>
                  <td className="px-4 py-4">
                    {appointment.service?.name || 'General Consultation'}
                  </td>
                  <td className="px-4 py-4">
                    <div>{formatShortDate(appointment.date)}</div>
                    <div className="text-sm text-gray-500">{formatTime(appointment.time)}</div>
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge status={appointment.status} />
                  </td>
                  <td className="px-4 py-4">
                    <button
                      onClick={() => setSelectedAppointment(appointment)}
                      className="text-primary hover:underline"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Appointment Detail Modal */}
      <Modal
        isOpen={!!selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
        title="Appointment Details"
      >
        {selectedAppointment && (
          <div>
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-sm text-gray-500">Patient</label>
                <p className="font-medium">{selectedAppointment.user?.name}</p>
                <p className="text-sm text-gray-600">{selectedAppointment.user?.email}</p>
                <p className="text-sm text-gray-600">{selectedAppointment.user?.phone}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Service</label>
                <p className="font-medium">{selectedAppointment.service?.name || 'General Consultation'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500">Date</label>
                  <p className="font-medium">{formatShortDate(selectedAppointment.date)}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Time</label>
                  <p className="font-medium">{formatTime(selectedAppointment.time)}</p>
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-500">Status</label>
                <div className="mt-1">
                  <StatusBadge status={selectedAppointment.status} />
                </div>
              </div>
              {selectedAppointment.notes && (
                <div>
                  <label className="text-sm text-gray-500">Notes</label>
                  <p className="text-gray-700">{selectedAppointment.notes}</p>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {selectedAppointment.status === 'pending' && (
                <Button
                  onClick={() => handleStatusUpdate(selectedAppointment._id, 'approved')}
                  loading={loading}
                  size="sm"
                >
                  Approve
                </Button>
              )}
              {selectedAppointment.status !== 'completed' && (
                <Button
                  onClick={() => handleStatusUpdate(selectedAppointment._id, 'completed')}
                  loading={loading}
                  variant="secondary"
                  size="sm"
                >
                  Mark Completed
                </Button>
              )}
              <Button
                onClick={() => handleDelete(selectedAppointment._id)}
                loading={loading}
                variant="danger"
                size="sm"
              >
                Delete
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
