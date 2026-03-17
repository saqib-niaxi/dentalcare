import { useState, useEffect, useRef, useCallback } from 'react'
import { messagesAPI } from '../../api/messages'
import { PaperAirplaneIcon } from '@heroicons/react/24/solid'

export default function MessageThread({ appointmentId, currentUserRole, dark = false }) {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef(null)
  const pollRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchMessages = useCallback(async () => {
    try {
      const res = await messagesAPI.getMessages(appointmentId)
      setMessages(res.data.messages)
      // Mark as read
      await messagesAPI.markAsRead(appointmentId)
    } catch (err) {
      console.error('Error fetching messages:', err)
    } finally {
      setLoading(false)
    }
  }, [appointmentId])

  useEffect(() => {
    fetchMessages()
    // Poll every 15 seconds
    pollRef.current = setInterval(fetchMessages, 15000)
    return () => clearInterval(pollRef.current)
  }, [fetchMessages])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || sending) return

    setSending(true)
    try {
      const res = await messagesAPI.sendMessage(appointmentId, newMessage.trim())
      setMessages(prev => [...prev, res.data.message])
      setNewMessage('')
    } catch (err) {
      console.error('Error sending message:', err)
    } finally {
      setSending(false)
    }
  }

  const formatTime = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) return 'Today'
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  // Group messages by date
  const groupedMessages = messages.reduce((groups, msg) => {
    const dateKey = new Date(msg.createdAt).toDateString()
    if (!groups[dateKey]) groups[dateKey] = []
    groups[dateKey].push(msg)
    return groups
  }, {})

  if (loading) {
    return (
      <div className={`flex items-center justify-center py-12 ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-current mr-3" />
        Loading messages...
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div className={`flex-1 overflow-y-auto p-4 space-y-1 min-h-[200px] max-h-[400px] ${dark ? 'bg-slate-900/50' : 'bg-gray-50'} rounded-xl`}>
        {messages.length === 0 ? (
          <div className={`flex items-center justify-center h-full ${dark ? 'text-slate-500' : 'text-gray-400'}`}>
            <p className="text-sm">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          Object.entries(groupedMessages).map(([dateKey, msgs]) => (
            <div key={dateKey}>
              {/* Date Separator */}
              <div className="flex items-center justify-center my-3">
                <span className={`text-xs px-3 py-1 rounded-full ${dark ? 'bg-slate-700 text-slate-400' : 'bg-gray-200 text-gray-500'}`}>
                  {formatDate(msgs[0].createdAt)}
                </span>
              </div>
              {msgs.map((msg) => {
                const isMine = msg.senderRole === currentUserRole
                return (
                  <div key={msg._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-2`}>
                    <div className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                      isMine
                        ? 'bg-amber-500 text-white rounded-br-md'
                        : dark
                          ? 'bg-slate-700 text-white rounded-bl-md'
                          : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md'
                    }`}>
                      {!isMine && (
                        <p className={`text-xs font-medium mb-1 ${dark ? 'text-amber-400' : 'text-amber-600'}`}>
                          {msg.sender?.name || (msg.senderRole === 'admin' ? 'Admin' : 'Patient')}
                        </p>
                      )}
                      <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                      <p className={`text-xs mt-1 ${isMine ? 'text-white/70' : dark ? 'text-slate-400' : 'text-gray-400'}`}>
                        {formatTime(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="flex items-center gap-2 mt-3">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          maxLength={2000}
          className={`flex-1 px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 ${
            dark
              ? 'bg-slate-700 border-white/10 text-white placeholder-slate-400'
              : 'bg-white border-gray-200 text-gray-800 placeholder-gray-400'
          }`}
        />
        <button
          type="submit"
          disabled={!newMessage.trim() || sending}
          className="p-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <PaperAirplaneIcon className="w-5 h-5" />
        </button>
      </form>
    </div>
  )
}
