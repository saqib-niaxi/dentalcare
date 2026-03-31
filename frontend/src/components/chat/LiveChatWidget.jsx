import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useSocket } from '../../context/SocketContext'
import { useNotification } from '../../context/NotificationContext'
import { liveChatAPI } from '../../api/liveChat'
import {
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  MinusIcon
} from '@heroicons/react/24/solid'

// Fallback polling only used when socket is disconnected
const POLL_INTERVAL = 3000

export default function LiveChatWidget() {
  const { isAuthenticated, isAdmin } = useAuth()
  const { socket, isConnected } = useSocket()
  const { info } = useNotification()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [conversation, setConversation] = useState(null)
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [closed, setClosed] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const messagesEndRef = useRef(null)
  const isOpenRef = useRef(false)
  const conversationRef = useRef(null)
  const lastTimestampRef = useRef(null)
  const pollIntervalRef = useRef(null)

  const shouldShow = isAuthenticated && !isAdmin

  useEffect(() => { isOpenRef.current = isOpen }, [isOpen])
  useEffect(() => { conversationRef.current = conversation }, [conversation])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // ── Socket event listeners ──────────────────────────────────────────────────
  useEffect(() => {
    if (!socket) return

    const handleNewMessage = ({ conversationId, message }) => {
      if (!conversationRef.current || conversationId !== conversationRef.current._id) return

      if (isOpenRef.current) {
        setMessages(prev => {
          // Deduplicate in case HTTP fallback also added it
          if (prev.some(m => m._id === message._id)) return prev
          return [...prev, message]
        })
        lastTimestampRef.current = message.createdAt
        liveChatAPI.markRead(conversationId).catch(() => {})
      } else {
        // Chat minimized — show unread badge + clickable notification
        if (message.senderRole === 'admin') {
          setUnreadCount(prev => prev + 1)
          const senderName = message.sender?.name || 'Support'
          info(`💬 New message from ${senderName}: "${message.content.slice(0, 50)}${message.content.length > 50 ? '…' : ''}"`, () => {
            setIsOpen(true)
            setUnreadCount(0)
          })
        }
      }
    }

    const handleConversationUpdated = ({ conversationId }) => {
      // Fired when someone sends a message while we are not in the room
      if (!conversationRef.current && !isOpenRef.current) {
        liveChatAPI.getUnread().then(res => setUnreadCount(res.data.total || 0)).catch(() => {})
      }
    }

    socket.on('new_message', handleNewMessage)
    socket.on('conversation_updated', handleConversationUpdated)

    return () => {
      socket.off('new_message', handleNewMessage)
      socket.off('conversation_updated', handleConversationUpdated)
    }
  }, [socket])

  // ── Join / leave socket room when conversation changes ──────────────────────
  useEffect(() => {
    if (!socket || !conversation) return
    socket.emit('join_conversation', conversation._id)
    return () => {
      socket.emit('leave_conversation', conversation._id)
    }
  }, [socket, conversation])

  // ── Fallback HTTP polling — only when socket is disconnected ────────────────
  const pollMessages = useCallback(async () => {
    if (isConnected) return // socket handles it
    const conv = conversationRef.current
    if (!conv) return
    try {
      const res = await liveChatAPI.getMessages(conv._id, lastTimestampRef.current)
      const newMsgs = res.data.messages
      if (newMsgs.length > 0) {
        lastTimestampRef.current = newMsgs[newMsgs.length - 1].createdAt
        if (isOpenRef.current) {
          setMessages(prev => [...prev, ...newMsgs])
          liveChatAPI.markRead(conv._id).catch(() => {})
        } else {
          const adminMsgs = newMsgs.filter(m => m.senderRole === 'admin')
          if (adminMsgs.length > 0) setUnreadCount(prev => prev + adminMsgs.length)
        }
      }
    } catch {
      // silently ignore poll errors
    }
  }, [isConnected])

  useEffect(() => {
    if (!conversation || isConnected) {
      clearInterval(pollIntervalRef.current)
      return
    }
    // Socket offline — start polling as fallback
    pollIntervalRef.current = setInterval(pollMessages, POLL_INTERVAL)
    return () => clearInterval(pollIntervalRef.current)
  }, [conversation, isConnected, pollMessages])

  // ── Unread count — initial load ─────────────────────────────────────────────
  useEffect(() => {
    if (!shouldShow) return
    liveChatAPI.getUnread().then(res => setUnreadCount(res.data.total || 0)).catch(() => {})
  }, [shouldShow])

  useEffect(() => { scrollToBottom() }, [messages])

  // ── Open / close chat ───────────────────────────────────────────────────────
  const openChat = async () => {
    setIsOpen(true)
    setUnreadCount(0)
    setLoading(true)
    setClosed(false)
    try {
      const res = await liveChatAPI.createConversation()
      const conv = res.data.conversation
      setClosed(conv.status === 'closed')
      setConversation(conv)

      const msgRes = await liveChatAPI.getConversation(conv._id)
      const msgs = msgRes.data.messages
      setMessages(msgs)
      if (msgs.length > 0) {
        lastTimestampRef.current = msgs[msgs.length - 1].createdAt
      }
      liveChatAPI.markRead(conv._id).catch(() => {})
    } catch (err) {
      console.error('Error opening chat:', err)
    } finally {
      setLoading(false)
    }
  }

  const closeChat = () => setIsOpen(false)

  // ── Send message — socket first, HTTP fallback ──────────────────────────────
  const handleSend = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || sending || !conversation || closed) return

    const content = newMessage.trim()
    setNewMessage('')

    if (socket?.connected) {
      // Real-time: server will broadcast new_message back to this socket too
      socket.emit('send_message', { conversationId: conversation._id, content })
    } else {
      // Fallback: HTTP send, add message manually
      setSending(true)
      try {
        const res = await liveChatAPI.sendMessage(conversation._id, content)
        const msg = res.data.message
        setMessages(prev => [...prev, msg])
        lastTimestampRef.current = msg.createdAt
      } catch (err) {
        console.error('Error sending message:', err)
      } finally {
        setSending(false)
      }
    }
  }

  const formatTime = (dateStr) =>
    new Date(dateStr).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

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
            {unreadCount > 0 && (
              <>
                <span className="absolute inset-0 rounded-full bg-red-500 opacity-30 animate-ping" />
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
                <p className="text-white/70 text-xs">{isConnected ? 'Online' : 'Connecting...'}</p>
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
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
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
