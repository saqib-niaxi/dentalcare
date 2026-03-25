import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import { liveChatAPI } from '../../api/liveChat'
import {
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  MinusIcon
} from '@heroicons/react/24/solid'

const POLL_INTERVAL = 3000      // 3s when chat is open
const UNREAD_POLL_INTERVAL = 10000 // 10s for unread badge

export default function LiveChatWidget() {
  const { isAuthenticated, isAdmin } = useAuth()
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
  const unreadPollRef = useRef(null)

  const shouldShow = isAuthenticated && !isAdmin

  useEffect(() => { isOpenRef.current = isOpen }, [isOpen])
  useEffect(() => { conversationRef.current = conversation }, [conversation])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const pollMessages = async () => {
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
  }

  const pollUnread = async () => {
    if (isOpenRef.current || conversationRef.current) return
    try {
      const res = await liveChatAPI.getUnread()
      setUnreadCount(res.data.total || 0)
    } catch {
      // silently ignore
    }
  }

  // Start message polling once conversation is set
  useEffect(() => {
    if (!conversation) return
    pollIntervalRef.current = setInterval(pollMessages, POLL_INTERVAL)
    return () => clearInterval(pollIntervalRef.current)
  }, [conversation])

  // Poll unread count when no conversation yet
  useEffect(() => {
    if (!shouldShow) return
    unreadPollRef.current = setInterval(pollUnread, UNREAD_POLL_INTERVAL)
    return () => clearInterval(unreadPollRef.current)
  }, [shouldShow])

  useEffect(() => { scrollToBottom() }, [messages])

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

  const handleSend = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || sending || !conversation || closed) return

    const content = newMessage.trim()
    setNewMessage('')
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
                <p className="text-white/70 text-xs">Online</p>
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
