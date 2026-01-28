import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/layout/Layout'

// Public Pages
import Home from './pages/Home'
import About from './pages/About'
import Services from './pages/Services'
import Contact from './pages/Contact'

// Auth Pages
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'

// Protected Pages
import BookAppointment from './pages/BookAppointment'
import MyAppointments from './pages/MyAppointments'

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

export default function App() {
  return (
    <Routes>
      {/* Public Routes with Layout */}
      <Route path="/" element={<Layout><Home /></Layout>} />
      <Route path="/about" element={<Layout><About /></Layout>} />
      <Route path="/services" element={<Layout><Services /></Layout>} />
      <Route path="/contact" element={<Layout><Contact /></Layout>} />

      {/* Auth Routes with Layout */}
      <Route path="/login" element={<Layout><Login /></Layout>} />
      <Route path="/register" element={<Layout><Register /></Layout>} />
      <Route path="/forgot-password" element={<Layout><ForgotPassword /></Layout>} />

      {/* Protected Patient Routes with Layout */}
      <Route
        path="/book-appointment"
        element={
          <Layout>
            <ProtectedRoute>
              <BookAppointment />
            </ProtectedRoute>
          </Layout>
        }
      />
      <Route
        path="/my-appointments"
        element={
          <Layout>
            <ProtectedRoute>
              <MyAppointments />
            </ProtectedRoute>
          </Layout>
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
