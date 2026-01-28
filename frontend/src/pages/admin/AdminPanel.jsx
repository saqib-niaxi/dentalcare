import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useAppointments } from '../../hooks/useAppointments'
import { useServices } from '../../hooks/useServices'
import { PageLoader } from '../../components/ui/LoadingSpinner'
import AppointmentsTab from './AppointmentsTab'
import ServicesTab from './ServicesTab'
import PatientsTab from './PatientsTab'
import {
  CalendarIcon,
  UserGroupIcon,
  SparklesIcon
} from '@heroicons/react/24/solid'

export default function AdminPanel() {
  const navigate = useNavigate()
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('appointments')
  const { appointments, fetchAppointments } = useAppointments()
  const { services, fetchServices } = useServices()
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      navigate('/login')
      return
    }

    const loadData = async () => {
      setLoading(true)
      await Promise.all([fetchAppointments(), fetchServices()])
      // Extract unique patients from appointments
      setLoading(false)
    }

    loadData()
  }, [isAuthenticated, isAdmin, navigate, fetchAppointments, fetchServices])

  useEffect(() => {
    // Extract unique patients from appointments
    const uniquePatients = appointments.reduce((acc, apt) => {
      if (apt.patient && !acc.find(p => p._id === apt.patient._id)) {
        acc.push(apt.patient)
      }
      return acc
    }, [])
    setPatients(uniquePatients)
  }, [appointments])

  if (!isAuthenticated || !isAdmin) {
    return <PageLoader />
  }

  // Stats
  const stats = {
    totalAppointments: appointments.length,
    pending: appointments.filter(a => a.status === 'pending').length,
    approved: appointments.filter(a => a.status === 'approved').length,
    totalServices: services.length,
    totalPatients: patients.length
  }

  const tabs = [
    { id: 'appointments', label: 'Appointments', icon: CalendarIcon, iconColor: 'text-blue-500' },
    { id: 'services', label: 'Services', icon: SparklesIcon, iconColor: 'text-green-500' },
    { id: 'patients', label: 'Patients', icon: UserGroupIcon, iconColor: 'text-purple-500' }
  ]

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-light">
      {/* Header with Logout */}
      <div className="bg-dark text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 border-b border-gray-700">
            <Link to="/" className="text-xl font-bold text-primary">
              Dr. Ahmed Dental Care
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-gray-300">Welcome, {user?.name}</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
          <div className="py-6">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-gray-300 mt-1">Manage appointments, services, and patients</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <PageLoader />
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              <div className="bg-white rounded-lg p-4 shadow">
                <div className="text-3xl font-bold text-primary">{stats.totalAppointments}</div>
                <div className="text-gray-600 text-sm">Total Appointments</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow">
                <div className="text-3xl font-bold text-yellow-500">{stats.pending}</div>
                <div className="text-gray-600 text-sm">Pending</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow">
                <div className="text-3xl font-bold text-green-500">{stats.approved}</div>
                <div className="text-gray-600 text-sm">Approved</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow">
                <div className="text-3xl font-bold text-blue-500">{stats.totalServices}</div>
                <div className="text-gray-600 text-sm">Services</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow">
                <div className="text-3xl font-bold text-purple-500">{stats.totalPatients}</div>
                <div className="text-gray-600 text-sm">Patients</div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow">
              <div className="border-b">
                <div className="flex overflow-x-auto">
                  {tabs.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-6 py-4 font-medium whitespace-nowrap transition-colors ${
                        activeTab === tab.id
                          ? 'text-primary border-b-2 border-primary'
                          : 'text-gray-600 hover:text-primary'
                      }`}
                    >
                      <tab.icon className={`w-5 h-5 ${tab.iconColor}`} />
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6">
                {activeTab === 'appointments' && (
                  <AppointmentsTab
                    appointments={appointments}
                    onRefresh={fetchAppointments}
                  />
                )}
                {activeTab === 'services' && (
                  <ServicesTab
                    services={services}
                    onRefresh={fetchServices}
                  />
                )}
                {activeTab === 'patients' && (
                  <PatientsTab patients={patients} />
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
