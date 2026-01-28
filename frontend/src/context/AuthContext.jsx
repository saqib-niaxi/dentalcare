import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../api/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    const token = localStorage.getItem('token')

    if (storedUser && token) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    const response = await authAPI.login({ email, password })
    const { token, user: userData } = response.data

    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)

    return userData
  }

  const register = async (userData) => {
    const response = await authAPI.register(userData)
    return response.data
  }

  const verifyOTP = async (email, otp) => {
    const response = await authAPI.verifyOTP({ email, otp })
    const { token, user: userData } = response.data

    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)

    return userData
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  const isAuthenticated = !!user
  const isAdmin = user?.role === 'admin'

  const value = {
    user,
    loading,
    isAuthenticated,
    isAdmin,
    login,
    register,
    verifyOTP,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
