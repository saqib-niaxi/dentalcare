import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useSocket } from '../../context/SocketContext'
import { liveChatAPI } from '../../api/liveChat'
import {
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  MinusIcon
} from '@heroicons/react/24/solid'

export default function LiveChatWidget() {
  const { isAuthenticated, isAdmin } = useAuth()
  const { socket, isConnected } = useSocket()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [conversation, setConversation] = useState(null)
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [typing, setTyping] = useState(null)
  const [closed, setClosed] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const messagesEndRef = useRef(null)
  const typingTimeoutRef = useRef(null)
  const inputRef = useRef(null)
  const isOpenRef = useRef(false)

  const shouldShow = isAuthenticated && !isAdmin

  // Keep ref in sync with isOpen so socket handlers have current value
  useEffect(() => {
    isOpenRef.current = isOpen
  }, [isOpen])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const openChat = async () => {
    setIsOpen(true)
    setUnreadCount(0)
    setLoading(true)
    setClosed(false)
    try {
      const res = await liveChatAPI.createConversation()
      const conv = res.data.conversation
      setConversation(conv)

      const msgRes = await liveChatAPI.getConversation(conv._id)
      setMessages(msgRes.data.messages)

      if (socket) {
        socket.emit('join_conversation', conv._id)
        socket.emit('mark_read', { conversationId: conv._id })
      }
    } catch (err) {
      console.error('Error opening chat:', err)
    } finally {
      setLoading(false)
    }
  }

  const closeChat = () => {
    if (conversation && socket) {
      socket.emit('leave_conversation', conversation._id)
    }
    setIsOpen(false)
  }

  // Listen for socket events
  useEffect(() => {
    if (!socket || !shouldShow) return

    const handleNewMessage = ({ conversationId, message }) => {
      if (conversation && conversationId === conversation._id) {
        if (isOpenRef.current) {
          // Chat is open — append and mark as read
          setMessages(prev => [...prev, message])
          socket.emit('mark_read', { conversationId })
        } else {
          // Chat is closed — increment badge
          if (message.senderRole === 'admin') {
            setUnreadCount(prev => prev + 1)
          }
        }
      }
    }

    const handleTyping = ({ conversationId, name, isTyping }) => {
      if (conversation && conversationId === conversation._id) {
        setTyping(isTyping ? name : null)
      }
    }

    // Fired on patient's personal room when admin sends — used when chat window is closed
    // and patient hasn't joined the conversation socket room yet
    const handleConversationUpdated = () => {
      if (!isOpenRef.current) {
        setUnreadCount(prev => prev + 1)
      }
    }

    socket.on('new_message', handleNewMessage)
    socket.on('user_typing', handleTyping)
    socket.on('conversation_updated', handleConversationUpdated)

    return () => {
      socket.off('new_message', handleNewMessage)
      socket.off('user_typing', handleTyping)
      socket.off('conversation_updated', handleConversationUpdated)
    }
  }, [socket, conversation, shouldShow])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = (e) => {
    e.preventDefault()
    if (!newMessage.trim() || sending || !conversation || closed) return

    const content = newMessage.trim()
    setNewMessage('')

    if (socket && isConnected) {
      socket.emit('send_message', { conversationId: conversation._id, content })
      socket.emit('typing', { conversationId: conversation._id, isTyping: false })
    }
  }

  const handleTypingInput = (e) => {
    setNewMessage(e.target.value)
    if (socket && conversation) {
      socket.emit('typing', { conversationId: conversation._id, isTyping: true })
      clearTimeout(typingTimeoutRef.current)
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing', { conversationId: conversation._id, isTyping: false })
      }, 2000)
    }
  }

  const formatTime = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  }

  if (!shouldShow) return null

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <div className="fixed bottom-24 right-6 z-50">
          <button
            onClick={openChat}
            className="relative w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-center group"
            title="Live Chat"
          >
            <ChatBubbleLeftRightIcon className="w-7 h-7 group-hover:scale-110 transition-transform" />

            {/* Unread badge */}
            {unreadCount > 0 && (
              <>
                {/* Pulse ring */}
                <span className="absolute inset-0 rounded-full bg-red-500 opacity-30 animate-ping" />
                {/* Count badge */}
                <span className="absolute -top-1.5 -right-1.5 min-w-[22px] h-[22px] bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1 shadow-lg border-2 border-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-3rem)] h-[500px] max-h-[calc(100vh-7rem)] bg-white dark:bg-luxury-charcoal rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <ChatBubbleLeftRightIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">Live Chat</h3>
                <p className="text-white/70 text-xs">
                  {isConnected ? 'Connected' : 'Connecting...'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={closeChat} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors" title="Minimize">
                <MinusIcon className="w-4 h-4 text-white" />
              </button>
              <button onClick={closeChat} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors" title="Close">
                <XMarkIcon className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50 dark:bg-luxury-black/50">
            {loading ? (
              <div className="flex items-center justify-center h-full text-gray-400">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-500 mr-3" />
                Loading...
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-slate-500">
                <ChatBubbleLeftRightIcon className="w-12 h-12 mb-3 opacity-50" />
                <p className="text-sm font-medium">Welcome!</p>
                <p className="text-xs text-center mt-1">Send a message and our team will respond shortly.</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMine = msg.senderRole === 'patient'
                return (
                  <div key={msg._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] rounded-2xl px-3.5 py-2 ${
                      isMine
                        ? 'bg-amber-500 text-white rounded-br-md'
                        : 'bg-white dark:bg-slate-700 text-gray-800 dark:text-white border border-gray-200 dark:border-transparent rounded-bl-md'
                    }`}>
                      {!isMine && (
                        <p className="text-xs font-medium text-amber-600 dark:text-amber-400 mb-0.5">
                          {msg.sender?.name || 'Admin'}
                        </p>
                      )}
                      <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                      <p className={`text-xs mt-1 ${isMine ? 'text-white/60' : 'text-gray-400 dark:text-slate-400'}`}>
                        {formatTime(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                )
              })
            )}
            {typing && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-slate-700 rounded-2xl px-4 py-2 border border-gray-200 dark:border-transparent rounded-bl-md">
                  <p className="text-xs text-gray-500 dark:text-slate-400 italic">{typing} is typing...</p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Closed banner */}
          {closed && (
            <div className="px-4 py-3 bg-gray-100 dark:bg-slate-800 text-center text-sm text-gray-500 dark:text-slate-400 border-t border-gray-200 dark:border-white/10">
              This conversation has been closed.
              <button
                onClick={openChat}
                className="block mx-auto mt-1 text-amber-500 hover:text-amber-600 font-medium text-xs"
              >
                Start New Conversation
              </button>
            </div>
          )}

          {/* Input */}
          {!closed && (
            <form onSubmit={handleSend} className="flex items-center gap-2 p-3 border-t border-gray-200 dark:border-white/10 bg-white dark:bg-luxury-charcoal flex-shrink-0">
              <input
                ref={inputRef}
                type="text"
                value={newMessage}
                onChange={handleTypingInput}
                placeholder="Type a message..."
                maxLength={2000}
                className="flex-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-luxury-black/50 text-gray-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 placeholder-gray-400"
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || sending}
                className="p-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              >
                <PaperAirplaneIcon className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      )}
    </>
  )
}
