import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '../../../context/AuthContext'
import * as chatbotAPI from '../../../api/chatbot'

const SESSION_STORAGE_KEY = 'chatbot_session_id'
const GUEST_ID_KEY = 'chatbot_guest_id'

/**
 * Custom hook for managing chatbot session
 */
export function useChatSession() {
  const { user, isAuthenticated } = useAuth()
  const [sessionId, setSessionId] = useState(null)
  const [guestId, setGuestId] = useState(null)
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [userContext, setUserContext] = useState('new_guest')
  const [isInitialized, setIsInitialized] = useState(false)

  const prevAuthState = useRef(isAuthenticated)

  // Initialize session on mount
  useEffect(() => {
    initializeSession()
  }, [])

  // Handle auth state changes
  useEffect(() => {
    if (prevAuthState.current !== isAuthenticated && isInitialized) {
      handleAuthChange()
    }
    prevAuthState.current = isAuthenticated
  }, [isAuthenticated, isInitialized])

  // Initialize or restore session
  const initializeSession = useCallback(async () => {
    try {
      // Get stored session and guest IDs
      const storedSessionId = localStorage.getItem(SESSION_STORAGE_KEY)
      const storedGuestId = localStorage.getItem(GUEST_ID_KEY)

      if (storedGuestId) {
        setGuestId(storedGuestId)
      }

      if (storedSessionId) {
        // Try to restore existing session
        try {
          const response = await chatbotAPI.getSession(storedSessionId)
          if (response.success) {
            setSessionId(storedSessionId)
            setUserContext(response.session.userContext)

            // Convert messages to our format
            const formattedMessages = response.messages.map((msg, index) => ({
              id: Date.now() + index,
              text: msg.content,
              isBot: msg.role === 'assistant'
            }))
            setMessages(formattedMessages)
            setIsInitialized(true)
            return
          }
        } catch (e) {
          // Session expired or invalid, will create new one
          console.log('Previous session expired, creating new one')
        }
      }

      // Create new session
      await createNewSession(storedGuestId)
      setIsInitialized(true)
    } catch (err) {
      console.error('Initialize session error:', err)
      setError('Failed to initialize chat session')
      setIsInitialized(true)
    }
  }, [])

  // Create a new session
  const createNewSession = useCallback(async (existingGuestId = null) => {
    try {
      const response = await chatbotAPI.createSession(existingGuestId)

      if (response.success) {
        setSessionId(response.sessionId)
        setUserContext(response.userContext)

        if (response.guestId) {
          setGuestId(response.guestId)
          localStorage.setItem(GUEST_ID_KEY, response.guestId)
        }

        localStorage.setItem(SESSION_STORAGE_KEY, response.sessionId)
        setMessages([])
        return response.sessionId
      }
    } catch (err) {
      console.error('Create session error:', err)
      throw err
    }
  }, [])

  // Handle auth state change (login/logout)
  const handleAuthChange = useCallback(async () => {
    if (isAuthenticated && sessionId) {
      // User just logged in - update session
      try {
        await chatbotAPI.updateSessionAuth(sessionId)
        setUserContext('logged_in')
      } catch (err) {
        console.log('Failed to update session auth:', err)
      }
    } else if (!isAuthenticated && userContext === 'logged_in') {
      // User logged out
      setUserContext('returning_guest')
    }
  }, [isAuthenticated, sessionId, userContext])

  // Send a message
  const sendMessage = useCallback(async (messageText) => {
    if (!messageText.trim()) return null

    setIsLoading(true)
    setError(null)

    // Add user message immediately
    const userMessage = {
      id: Date.now(),
      text: messageText,
      isBot: false
    }
    setMessages(prev => [...prev, userMessage])

    try {
      const response = await chatbotAPI.sendMessage(sessionId, messageText, guestId)

      if (response.success) {
        // Update session ID if changed
        if (response.sessionId && response.sessionId !== sessionId) {
          setSessionId(response.sessionId)
          localStorage.setItem(SESSION_STORAGE_KEY, response.sessionId)
        }

        // Update user context
        if (response.userContext) {
          setUserContext(response.userContext)
        }

        // Add bot response
        const botMessage = {
          id: Date.now() + 1,
          text: response.message,
          isBot: true,
          functionCalls: response.functionCalls
        }
        setMessages(prev => [...prev, botMessage])

        return response
      } else {
        throw new Error(response.message || 'Failed to get response')
      }
    } catch (err) {
      console.error('Send message error:', err)
      setError(err.message || 'Failed to send message')

      // Add error message
      const errorMessage = {
        id: Date.now() + 1,
        text: err.message || "Sorry, I couldn't process your message. Please try again or call us at +92 320 2067666.",
        isBot: true,
        isError: true
      }
      setMessages(prev => [...prev, errorMessage])

      return null
    } finally {
      setIsLoading(false)
    }
  }, [sessionId, guestId])

  // Clear chat
  const clearChat = useCallback(async () => {
    try {
      if (sessionId) {
        await chatbotAPI.clearSession(sessionId)
      }

      // Create new session
      await createNewSession(guestId)
      setError(null)
    } catch (err) {
      console.error('Clear chat error:', err)
      // Still clear local messages even if API fails
      setMessages([])
    }
  }, [sessionId, guestId, createNewSession])

  // Get user data for pre-filling
  const getUserData = useCallback(() => {
    if (isAuthenticated && user) {
      return {
        name: user.name,
        email: user.email,
        phone: user.phone
      }
    }
    return null
  }, [isAuthenticated, user])

  return {
    sessionId,
    messages,
    isLoading,
    error,
    userContext,
    isAuthenticated,
    user,
    isInitialized,
    sendMessage,
    clearChat,
    getUserData,
    setMessages
  }
}

export default useChatSession
