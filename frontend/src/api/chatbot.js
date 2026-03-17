import axios from 'axios'

const API_URL = '/api'

// Create axios instance for chatbot
const chatbotApi = axios.create({
  baseURL: `${API_URL}/chatbot`,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add auth token if available
chatbotApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

/**
 * Send a message to the chatbot
 * @param {string} sessionId - Chat session ID
 * @param {string} message - User message
 * @param {string} guestId - Guest ID for non-authenticated users
 */
export const sendMessage = async (sessionId, message, guestId = null) => {
  try {
    const response = await chatbotApi.post('/message', {
      sessionId,
      message,
      guestId
    })
    return response.data
  } catch (error) {
    console.error('Send message error:', error)
    throw error.response?.data || { message: 'Failed to send message' }
  }
}

/**
 * Create a new chat session
 * @param {string} guestId - Guest ID for non-authenticated users
 */
export const createSession = async (guestId = null) => {
  try {
    const response = await chatbotApi.post('/session', { guestId })
    return response.data
  } catch (error) {
    console.error('Create session error:', error)
    throw error.response?.data || { message: 'Failed to create session' }
  }
}

/**
 * Get chat session history
 * @param {string} sessionId - Chat session ID
 */
export const getSession = async (sessionId) => {
  try {
    const response = await chatbotApi.get(`/session/${sessionId}`)
    return response.data
  } catch (error) {
    console.error('Get session error:', error)
    throw error.response?.data || { message: 'Failed to get session' }
  }
}

/**
 * Clear chat session
 * @param {string} sessionId - Chat session ID
 */
export const clearSession = async (sessionId) => {
  try {
    const response = await chatbotApi.delete(`/session/${sessionId}`)
    return response.data
  } catch (error) {
    console.error('Clear session error:', error)
    throw error.response?.data || { message: 'Failed to clear session' }
  }
}

/**
 * Update session with authentication
 * @param {string} sessionId - Chat session ID
 */
export const updateSessionAuth = async (sessionId) => {
  try {
    const response = await chatbotApi.put(`/session/${sessionId}/auth`)
    return response.data
  } catch (error) {
    console.error('Update session auth error:', error)
    throw error.response?.data || { message: 'Failed to update session' }
  }
}

/**
 * Get quick info (services, hours, contact)
 * @param {string} type - Type of info to retrieve
 */
export const getQuickInfo = async (type = 'all') => {
  try {
    const response = await chatbotApi.get('/quick-info', { params: { type } })
    return response.data
  } catch (error) {
    console.error('Get quick info error:', error)
    throw error.response?.data || { message: 'Failed to get info' }
  }
}

export default {
  sendMessage,
  createSession,
  getSession,
  clearSession,
  updateSessionAuth,
  getQuickInfo
}
