import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useAppointments } from '../../hooks/useAppointments'
import { useServices } from '../../hooks/useServices'
import { useDoctors } from '../../hooks/useDoctors'
import { appointmentsAPI } from '../../api/appointments'
import { ratingsAPI } from '../../api/ratings'
import { liveChatAPI } from '../../api/liveChat'
import { messagesAPI } from '../../api/messages'
import { useSocket } from '../../context/SocketContext'
import { PageLoader } from '../../components/ui/LoadingSpinner'
import AppointmentsTab from './AppointmentsTab'
import ServicesTab from './ServicesTab'
import DoctorsTab from './DoctorsTab'
import PatientsTab from './PatientsTab'
import RatingsTab from './RatingsTab'
import MessagesTab from './MessagesTab'
import {
  CalendarIcon,
  UserGroupIcon,
  UserCircleIcon,
  SparklesIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowRightOnRectangleIcon,
  HomeIcon,
  BellIcon,
  ChartBarIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
  StarIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline'
import {
  CalendarIcon as CalendarSolid,
  UserGroupIcon as UserGroupSolid,
  UserCircleIcon as UserCircleSolid,
  SparklesIcon as SparklesSolid,
  StarIcon as StarSolid,
  ChatBubbleLeftRightIcon as ChatBubbleLeftRightSolid
} from '@heroicons/react/24/solid'

export default function AdminPanel() {
  const navigate = useNavigate()
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const { socket } = useSocket()
  const [activeTab, setActiveTab] = useState('appointments')
  const [selectedConvId, setSelectedConvId] = useState(null)
  const { appointments, fetchAppointments } = useAppointments()
  const { services, fetchServices } = useServices()
  const { doctors, fetchDoctors } = useDoctors()
  const [patients, setPatients] = useState([])
  const [ratings, setRatings] = useState([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [chatNotifications, setChatNotifications] = useState([])
  const [apptMsgNotifications, setApptMsgNotifications] = useState([]) // { appointmentId, patientName, serviceName, count }
  const notificationRef = useRef(null)
  const userMenuRef = useRef(null)

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      navigate('/login')
      return
    }

    const loadData = async () => {
      setLoading(true)
      try {
        await Promise.all([
          fetchAppointments(),
          fetchServices(),
          fetchDoctors(),
          fetchAllPatients(),
          fetchAllRatings()
        ])
      } catch (error) {
        console.error('Error loading admin data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [isAuthenticated, isAdmin, navigate])

  const fetchAllPatients = async () => {
    try {
      const response = await appointmentsAPI.getAllPatients()
      if (response.data.success) {
        setPatients(response.data.patients)
      }
    } catch (error) {
      console.error('Error fetching patients:', error)
      setPatients([])
    }
  }

  const fetchAllRatings = async () => {
    try {
      const response = await ratingsAPI.getAllRatings('all')
      setRatings(response.data.ratings || [])
    } catch (error) {
      console.error('Error fetching ratings:', error)
      setRatings([])
    }
  }

  // Load unread chat conversations on mount
  const fetchChatNotifications = useCallback(async () => {
    try {
      const res = await liveChatAPI.getConversations()
      const unread = res.data.conversations
        .filter(c => c.unreadCountAdmin > 0)
        .map(c => ({
          convId: c._id,
          patientName: c.patient?.name || 'Unknown',
          preview: c.lastMessage?.content || 'New message',
          count: c.unreadCountAdmin
        }))
      setChatNotifications(unread)
    } catch (err) {
      console.error('Error fetching chat notifications:', err)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetchChatNotifications()
    }
  }, [isAuthenticated, isAdmin, fetchChatNotifications])

  // Poll unread appointment messages every 30s
  const fetchApptMsgNotifications = useCallback(async () => {
    try {
      const res = await messagesAPI.getUnreadCounts()
      const unreadCounts = res.data.unreadCounts || {}
      const notifs = Object.entries(unreadCounts)
        .filter(([, count]) => count > 0)
        .map(([appointmentId, count]) => {
          // Find appointment details from already-loaded appointments
          const apt = appointments.find(a => a._id === appointmentId)
          return {
            appointmentId,
            patientName: apt?.patient?.name || 'A patient',
            serviceName: apt?.service?.name || 'Appointment',
            count
          }
        })
      setApptMsgNotifications(notifs)
    } catch (err) {
      // Silently fail
    }
  }, [appointments])

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) return
    fetchApptMsgNotifications()
    const interval = setInterval(fetchApptMsgNotifications, 30000)
    return () => clearInterval(interval)
  }, [isAuthenticated, isAdmin, fetchApptMsgNotifications])

  // Socket: listen for new messages from patients
  useEffect(() => {
    if (!socket) return

    const handleConversationUpdated = async ({ conversationId }) => {
      try {
        const res = await liveChatAPI.getConversations()
        const conv = res.data.conversations.find(c => c._id === conversationId)
        if (!conv) return

        setChatNotifications(prev => {
          const existing = prev.find(n => n.convId === conversationId)
          const newNotif = {
            convId: conversationId,
            patientName: conv.patient?.name || 'Unknown',
            preview: conv.lastMessage?.content || 'New message',
            count: existing ? existing.count + 1 : 1
          }
          // Replace if exists, else add at top
          const filtered = prev.filter(n => n.convId !== conversationId)
          return [newNotif, ...filtered]
        })
      } catch (err) {
        // Silently fail
      }
    }

    socket.on('conversation_updated', handleConversationUpdated)
    return () => socket.off('conversation_updated', handleConversationUpdated)
  }, [socket])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationOpen(false)
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!isAuthenticated || !isAdmin) {
    return <PageLoader />
  }

  const stats = {
    totalAppointments: appointments.length,
    pending: appointments.filter(a => a.status === 'pending').length,
    approved: appointments.filter(a => a.status === 'approved').length,
    completed: appointments.filter(a => a.status === 'completed').length,
    totalServices: services.length,
    totalDoctors: doctors.filter(d => d.isActive).length,
    totalPatients: patients.length
  }

  const pendingAppointments = appointments
    .filter(a => a.status === 'pending')
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)

  const tabs = [
    { id: 'appointments', label: 'Appointments', icon: CalendarIcon, activeIcon: CalendarSolid },
    { id: 'messages', label: 'Messages', icon: ChatBubbleLeftRightIcon, activeIcon: ChatBubbleLeftRightSolid },
    { id: 'services', label: 'Services', icon: SparklesIcon, activeIcon: SparklesSolid },
    { id: 'doctors', label: 'Doctors', icon: UserCircleIcon, activeIcon: UserCircleSolid },
    { id: 'ratings', label: 'Ratings', icon: StarIcon, activeIcon: StarSolid },
    { id: 'patients', label: 'Patients', icon: UserGroupIcon, activeIcon: UserGroupSolid }
  ]

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 17) return 'Good Afternoon'
    return 'Good Evening'
  }

  const handleTabChange = (tabId) => {
    setActiveTab(tabId)
    setSidebarOpen(false) // Close sidebar on mobile after tab change
  }

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed left-0 top-0 h-full bg-slate-900/95 backdrop-blur-xl border-r border-white/10 z-50
        transition-all duration-300 w-72 flex flex-col
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between flex-shrink-0">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center">
              <span className="text-slate-900 font-bold text-lg">HN</span>
            </div>
            <div>
              <h1 className="text-white font-bold">Dr. Hanif Niazi</h1>
              <p className="text-amber-400/80 text-xs tracking-wider">DENTAL CARE</p>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation - Scrollable */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          {tabs.map(tab => {
            const Icon = activeTab === tab.id ? tab.activeIcon : tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${activeTab === tab.id
                    ? 'bg-gradient-to-r from-amber-500/20 to-amber-600/10 text-amber-400 border border-amber-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
              >
                <Icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-amber-400' : 'group-hover:text-amber-400/70'}`} />
                <span className="font-medium flex-1 text-left">{tab.label}</span>
                {tab.id === 'messages' && chatNotifications.length > 0 && (
                  <span className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {chatNotifications.length}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-white/10 flex-shrink-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all duration-200 mt-2"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className="h-full transition-all duration-300 lg:ml-72 overflow-y-auto modal-scrollbar"
        data-lenis-prevent
      >
        {/* Top Header */}
        <header className="bg-slate-900/50 backdrop-blur-xl border-b border-white/10 sticky top-0 z-30">
          <div className="px-4 lg:px-8 py-4 flex items-center justify-between">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl mr-4"
            >
              <Bars3Icon className="w-6 h-6" />
            </button>

            <div className="hidden sm:block">
              <p className="text-slate-400 text-sm">{getGreeting()}</p>
              <h2 className="text-white text-xl font-bold">{user?.name || 'Admin'}</h2>
            </div>

            <div className="flex items-center gap-2 sm:gap-4 ml-auto">
              {/* Notification Dropdown */}
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => {
                    setNotificationOpen(!notificationOpen)
                    setUserMenuOpen(false)
                  }}
                  className="relative p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                >
                  <BellIcon className="w-6 h-6" />
                  {(stats.pending + chatNotifications.length + apptMsgNotifications.length) > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                      {stats.pending + chatNotifications.length + apptMsgNotifications.length}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown Menu */}
                {notificationOpen && (
                  <div className="absolute right-0 mt-3 w-96 bg-slate-800/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden z-[1000] transition-all duration-200 origin-top-right animate-in fade-in slide-in-from-top-2" style={{ position: 'absolute', top: '100%', right: 0 }}>
                    <div className="px-6 py-4 border-b border-white/10 bg-gradient-to-r from-slate-800 to-slate-700">
                      <h3 className="text-white font-bold text-lg">Notifications</h3>
                      <p className="text-slate-300 text-sm mt-1">
                        {[
                          stats.pending > 0 && `${stats.pending} pending appointment${stats.pending > 1 ? 's' : ''}`,
                          apptMsgNotifications.length > 0 && `${apptMsgNotifications.length} appointment message${apptMsgNotifications.length > 1 ? 's' : ''}`,
                          chatNotifications.length > 0 && `${chatNotifications.length} live chat${chatNotifications.length > 1 ? 's' : ''}`
                        ].filter(Boolean).join(' · ') || 'All caught up!'}
                      </p>
                    </div>
                    <div className="max-h-96 overflow-y-auto p-2">
                      {/* Chat message notifications */}
                      {chatNotifications.length > 0 && (
                        <>
                          <p className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            New Messages
                          </p>
                          {chatNotifications.map(notif => (
                            <button
                              key={notif.convId}
                              onClick={() => {
                                setSelectedConvId(notif.convId)
                                setActiveTab('messages')
                                setNotificationOpen(false)
                                setChatNotifications(prev => prev.filter(n => n.convId !== notif.convId))
                              }}
                              className="w-full px-4 py-3 mb-1 hover:bg-white/10 bg-blue-500/10 rounded-lg transition-all border border-blue-500/20 hover:border-blue-400/40 text-left"
                            >
                              <div className="flex items-center gap-3">
                                <div className="relative w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <ChatBubbleLeftRightIcon className="w-4 h-4 text-blue-400" />
                                  {notif.count > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                                      {notif.count}
                                    </span>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-white text-sm font-medium truncate">{notif.patientName}</p>
                                  <p className="text-slate-400 text-xs truncate">{notif.preview}</p>
                                </div>
                                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full flex-shrink-0">
                                  Message
                                </span>
                              </div>
                            </button>
                          ))}
                        </>
                      )}

                      {/* Appointment message notifications */}
                      {apptMsgNotifications.length > 0 && (
                        <>
                          <p className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Appointment Messages
                          </p>
                          {apptMsgNotifications.map(notif => (
                            <button
                              key={notif.appointmentId}
                              onClick={() => {
                                setActiveTab('appointments')
                                setNotificationOpen(false)
                                setApptMsgNotifications(prev => prev.filter(n => n.appointmentId !== notif.appointmentId))
                              }}
                              className="w-full px-4 py-3 mb-1 hover:bg-white/10 bg-violet-500/10 rounded-lg transition-all border border-violet-500/20 hover:border-violet-400/40 text-left"
                            >
                              <div className="flex items-center gap-3">
                                <div className="relative w-8 h-8 bg-violet-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <ChatBubbleLeftRightIcon className="w-4 h-4 text-violet-400" />
                                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                                    {notif.count}
                                  </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-white text-sm font-medium truncate">{notif.patientName}</p>
                                  <p className="text-slate-400 text-xs truncate">{notif.serviceName}</p>
                                </div>
                                <span className="px-2 py-1 bg-violet-500/20 text-violet-400 text-xs rounded-full flex-shrink-0">
                                  Reply
                                </span>
                              </div>
                            </button>
                          ))}
                        </>
                      )}

                      {/* Appointment notifications */}
                      {pendingAppointments.length > 0 && (
                        <>
                          <p className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Pending Appointments
                          </p>
                          {pendingAppointments.map(apt => (
                            <button
                              key={apt._id}
                              onClick={() => {
                                setActiveTab('appointments')
                                setNotificationOpen(false)
                              }}
                              className="w-full px-4 py-3 mb-1 hover:bg-white/10 bg-white/5 rounded-lg transition-all border border-white/5 hover:border-white/20 text-left"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <CalendarIcon className="w-4 h-4 text-amber-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-white text-sm font-medium truncate">
                                    {apt.patient?.name || 'Unknown'}
                                  </p>
                                  <p className="text-slate-400 text-xs truncate">
                                    {apt.service?.name || 'General'} · {new Date(apt.date).toLocaleDateString()}
                                  </p>
                                </div>
                                <span className="px-2 py-1 bg-amber-500/20 text-amber-400 text-xs rounded-full flex-shrink-0">
                                  Pending
                                </span>
                              </div>
                            </button>
                          ))}
                        </>
                      )}

                      {/* Empty state */}
                      {pendingAppointments.length === 0 && chatNotifications.length === 0 && apptMsgNotifications.length === 0 && (
                        <div className="px-6 py-12 text-center">
                          <BellIcon className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                          <p className="text-slate-400 text-sm font-medium">No new notifications</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Menu Dropdown */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => {
                    setUserMenuOpen(!userMenuOpen)
                    setNotificationOpen(false)
                  }}
                  className="flex items-center gap-2 p-1.5 hover:bg-white/5 rounded-xl transition-all"
                >
                  <div className="w-9 h-9 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center">
                    <span className="text-slate-900 font-bold">{user?.name?.charAt(0) || 'A'}</span>
                  </div>
                  <ChevronDownIcon className={`w-4 h-4 text-slate-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* User Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-slate-800 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-white/10">
                      <p className="text-white font-semibold">{user?.name || 'Admin'}</p>
                      <p className="text-slate-400 text-sm truncate">{user?.email}</p>
                    </div>
                    <div className="py-2">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
                      >
                        <ArrowRightOnRectangleIcon className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 lg:p-8">
          {loading ? (
            <PageLoader />
          ) : (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4 mb-6 lg:mb-8">
                {/* Total Appointments */}
                <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 backdrop-blur-xl rounded-2xl p-4 lg:p-5 border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 group">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <CalendarIcon className="w-5 h-5 lg:w-6 lg:h-6 text-blue-400" />
                    </div>
                    <ChartBarIcon className="w-4 h-4 lg:w-5 lg:h-5 text-blue-400/50 hidden sm:block" />
                  </div>
                  <p className="text-2xl lg:text-3xl font-bold text-white">{stats.totalAppointments}</p>
                  <p className="text-blue-300/70 text-xs lg:text-sm mt-1">Total Appointments</p>
                </div>

                {/* Pending */}
                <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/10 backdrop-blur-xl rounded-2xl p-4 lg:p-5 border border-amber-500/20 hover:border-amber-500/40 transition-all duration-300 group">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 bg-amber-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <ClockIcon className="w-5 h-5 lg:w-6 lg:h-6 text-amber-400" />
                    </div>
                    <span className="px-2 py-1 bg-amber-500/20 rounded-lg text-amber-400 text-xs font-medium hidden sm:block">Pending</span>
                  </div>
                  <p className="text-2xl lg:text-3xl font-bold text-white">{stats.pending}</p>
                  <p className="text-amber-300/70 text-xs lg:text-sm mt-1">Awaiting Review</p>
                </div>

                {/* Approved */}
                <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 backdrop-blur-xl rounded-2xl p-4 lg:p-5 border border-emerald-500/20 hover:border-emerald-500/40 transition-all duration-300 group">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <CheckCircleIcon className="w-5 h-5 lg:w-6 lg:h-6 text-emerald-400" />
                    </div>
                    <span className="px-2 py-1 bg-emerald-500/20 rounded-lg text-emerald-400 text-xs font-medium hidden sm:block">Active</span>
                  </div>
                  <p className="text-2xl lg:text-3xl font-bold text-white">{stats.approved}</p>
                  <p className="text-emerald-300/70 text-xs lg:text-sm mt-1">Approved</p>
                </div>

                {/* Completed */}
                <div className="bg-gradient-to-br from-violet-500/20 to-violet-600/10 backdrop-blur-xl rounded-2xl p-4 lg:p-5 border border-violet-500/20 hover:border-violet-500/40 transition-all duration-300 group">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 bg-violet-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <CheckCircleIcon className="w-5 h-5 lg:w-6 lg:h-6 text-violet-400" />
                    </div>
                  </div>
                  <p className="text-2xl lg:text-3xl font-bold text-white">{stats.completed}</p>
                  <p className="text-violet-300/70 text-xs lg:text-sm mt-1">Completed</p>
                </div>

                {/* Services */}
                <div className="bg-gradient-to-br from-pink-500/20 to-pink-600/10 backdrop-blur-xl rounded-2xl p-4 lg:p-5 border border-pink-500/20 hover:border-pink-500/40 transition-all duration-300 group">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 bg-pink-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <SparklesIcon className="w-5 h-5 lg:w-6 lg:h-6 text-pink-400" />
                    </div>
                  </div>
                  <p className="text-2xl lg:text-3xl font-bold text-white">{stats.totalServices}</p>
                  <p className="text-pink-300/70 text-xs lg:text-sm mt-1">Services</p>
                </div>

                {/* Patients */}
                <div className="bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 backdrop-blur-xl rounded-2xl p-4 lg:p-5 border border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-300 group">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <UserGroupIcon className="w-5 h-5 lg:w-6 lg:h-6 text-cyan-400" />
                    </div>
                  </div>
                  <p className="text-2xl lg:text-3xl font-bold text-white">{stats.totalPatients}</p>
                  <p className="text-cyan-300/70 text-xs lg:text-sm mt-1">Patients</p>
                </div>
              </div>

              {/* Content Area */}
              <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
                <div className="p-4 lg:p-6">
                  {activeTab === 'appointments' && (
                    <AppointmentsTab
                      appointments={appointments}
                      onRefresh={fetchAppointments}
                    />
                  )}
                  {activeTab === 'messages' && (
                    <MessagesTab
                      initialConvId={selectedConvId}
                      onConvOpened={() => setSelectedConvId(null)}
                    />
                  )}
                  {activeTab === 'services' && (
                    <ServicesTab
                      services={services}
                      onRefresh={fetchServices}
                    />
                  )}
                  {activeTab === 'doctors' && (
                    <DoctorsTab
                      doctors={doctors}
                      onRefresh={fetchDoctors}
                    />
                  )}
                  {activeTab === 'ratings' && (
                    <RatingsTab
                      ratings={ratings}
                      onRefresh={fetchAllRatings}
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
      </main>
    </div>
  )
}
