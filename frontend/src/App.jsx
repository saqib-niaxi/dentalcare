import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/layout/Layout'

// Public Pages
import Home from './pages/Home'
import About from './pages/About'
import Services from './pages/Services'
import Doctors from './pages/Doctors'
import Contact from './pages/Contact'

// Auth Pages
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'

// Protected Pages
import BookAppointment from './pages/BookAppointment'
import MyAppointments from './pages/MyAppointments'
import Profile from './pages/Profile'

// Admin Pages
import AdminPanel from './pages/admin/AdminPanel'

// Protected Route Wrapper
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

// Admin Route Wrapper
function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/login" replace />
  }

  return children
}

// Public/Patient Route Wrapper - redirects admin to admin panel
function PublicRoute({ children }) {
  const { isAdmin, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (isAdmin) {
    return <Navigate to="/admin" replace />
  }

  return children
}

export default function App() {
  return (
    <Routes>
      {/* Public Routes with Layout - admin gets redirected to /admin */}
      <Route path="/" element={<PublicRoute><Layout><Home /></Layout></PublicRoute>} />
      <Route path="/about" element={<PublicRoute><Layout><About /></Layout></PublicRoute>} />
      <Route path="/services" element={<PublicRoute><Layout><Services /></Layout></PublicRoute>} />
      <Route path="/doctors" element={<PublicRoute><Layout><Doctors /></Layout></PublicRoute>} />
      <Route path="/contact" element={<PublicRoute><Layout><Contact /></Layout></PublicRoute>} />

      {/* Auth Routes with Layout - admin gets redirected to /admin */}
      <Route path="/login" element={<PublicRoute><Layout><Login /></Layout></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Layout><Register /></Layout></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><Layout><ForgotPassword /></Layout></PublicRoute>} />

      {/* Protected Patient Routes with Layout */}
      <Route
        path="/book-appointment"
        element={
          <PublicRoute>
            <Layout>
              <ProtectedRoute>
                <BookAppointment />
              </ProtectedRoute>
            </Layout>
          </PublicRoute>
        }
      />
      <Route
        path="/my-appointments"
        element={
          <PublicRoute>
            <Layout>
              <ProtectedRoute>
                <MyAppointments />
              </ProtectedRoute>
            </Layout>
          </PublicRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <PublicRoute>
            <Layout>
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            </Layout>
          </PublicRoute>
        }
      />

      {/* Admin Routes (no Layout - AdminPanel has its own) */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminPanel />
          </AdminRoute>
        }
      />

      {/* 404 - Redirect to Home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
