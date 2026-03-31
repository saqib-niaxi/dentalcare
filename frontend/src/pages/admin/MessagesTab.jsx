import { useState, useEffect, useRef, useCallback } from 'react'
import { useSocket } from '../../context/SocketContext'
import { liveChatAPI } from '../../api/liveChat'
import {
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  XMarkIcon
} from '@heroicons/react/24/solid'

export default function MessagesTab({ initialConvId = null, onConvOpened, onConvRead }) {
  const { socket } = useSocket()
  const [conversations, setConversations] = useState([])
  const [activeConv, setActiveConv] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [typing, setTyping] = useState(null)
  const messagesEndRef = useRef(null)
  const typingTimeoutRef = useRef(null)
  const initialConvHandled = useRef(false)

  const fetchConversations = useCallback(async () => {
    try {
      const res = await liveChatAPI.getConversations()
      setConversations(res.data.conversations)
      return res.data.conversations
    } catch (err) {
      console.error('Error fetching conversations:', err)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchConversations().then(convs => {
      // Auto-open the conversation coming from notification
      if (initialConvId && !initialConvHandled.current && convs.length > 0) {
        const target = convs.find(c => c._id === initialConvId)
        if (target) {
          initialConvHandled.current = true
          selectConversation(target)
          onConvOpened?.()
        }
      }
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const selectConversation = async (conv) => {
    // Leave previous room
    if (activeConv && socket) {
      socket.emit('leave_conversation', activeConv._id)
    }

    setActiveConv(conv)
    setMessages([])
    setTyping(null)

    try {
      const res = await liveChatAPI.getConversation(conv._id)
      setMessages(res.data.messages)

      if (socket) {
        socket.emit('join_conversation', conv._id)
        socket.emit('mark_read', { conversationId: conv._id })
      }

      // Clear unread locally + notify AdminPanel to clear bell notification
      setConversations(prev => prev.map(c =>
        c._id === conv._id ? { ...c, unreadCountAdmin: 0 } : c
      ))
      onConvRead?.(conv._id)
    } catch (err) {
      console.error('Error loading conversation:', err)
    }
  }

  const closePanel = () => {
    if (activeConv && socket) {
      socket.emit('leave_conversation', activeConv._id)
    }
    setActiveConv(null)
    setMessages([])
    setTyping(null)
  }

  // Socket events
  useEffect(() => {
    if (!socket) return

    const handleNewMessage = ({ conversationId, message }) => {
      if (activeConv && conversationId === activeConv._id) {
        setMessages(prev => [...prev, message])
        socket.emit('mark_read', { conversationId })
      } else if (message.senderRole === 'patient') {
        // Increment unread badge on the conversation row
        setConversations(prev => prev.map(c =>
          c._id === conversationId
            ? { ...c, unreadCountAdmin: (c.unreadCountAdmin || 0) + 1, lastMessage: { content: message.content, timestamp: message.createdAt } }
            : c
        ))
      }
      fetchConversations()
    }

    const handleTyping = ({ conversationId, name, isTyping }) => {
      if (activeConv && conversationId === activeConv._id) {
        setTyping(isTyping ? name : null)
      }
    }

    const handleConvUpdated = () => {
      fetchConversations()
    }

    socket.on('new_message', handleNewMessage)
    socket.on('user_typing', handleTyping)
    socket.on('conversation_updated', handleConvUpdated)

    return () => {
      socket.off('new_message', handleNewMessage)
      socket.off('user_typing', handleTyping)
      socket.off('conversation_updated', handleConvUpdated)
    }
  }, [socket, activeConv, fetchConversations])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !activeConv || activeConv.status === 'closed') return

    if (socket) {
      socket.emit('send_message', { conversationId: activeConv._id, content: newMessage.trim() })
      socket.emit('typing', { conversationId: activeConv._id, isTyping: false })
    }
    setNewMessage('')
  }

  const handleTypingInput = (e) => {
    setNewMessage(e.target.value)
    if (socket && activeConv) {
      socket.emit('typing', { conversationId: activeConv._id, isTyping: true })
      clearTimeout(typingTimeoutRef.current)
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing', { conversationId: activeConv._id, isTyping: false })
      }, 2000)
    }
  }

  const formatTime = (dateStr) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    const now = new Date()
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Messages</h2>
          <p className="text-slate-400 text-sm mt-1">Live chat conversations with patients</p>
        </div>
      </div>

      <div className="flex gap-4 h-[600px]">
        {/* Conversation List */}
        <div className="w-80 flex-shrink-0 bg-slate-700/30 rounded-xl border border-white/5 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-white/10">
            <h3 className="text-white font-medium text-sm">Conversations ({conversations.length})</h3>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12 text-slate-400">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mr-2" />
                Loading...
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <ChatBubbleLeftRightIcon className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No conversations yet</p>
              </div>
            ) : (
              conversations.map(conv => (
                <div
                  key={conv._id}
                  className={`border-b border-white/5 transition-all hover:bg-white/5 ${
                    activeConv?._id === conv._id ? 'bg-amber-500/10 border-l-2 border-l-amber-500' : ''
                  }`}
                >
                  <button
                    onClick={() => selectConversation(conv)}
                    className="w-full text-left p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center text-slate-900 font-bold text-sm flex-shrink-0">
                        {conv.patient?.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-white font-medium text-sm truncate">{conv.patient?.name || 'Unknown'}</p>
                          {conv.unreadCountAdmin > 0 && (
                            <span className="flex-shrink-0 min-w-[20px] h-5 bg-red-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center px-1">
                              {conv.unreadCountAdmin > 9 ? '9+' : conv.unreadCountAdmin}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <p className={`text-xs truncate flex-1 ${conv.unreadCountAdmin > 0 ? 'text-white font-medium' : 'text-slate-400'}`}>
                            {conv.lastMessage?.content || 'No messages'}
                          </p>
                          <span className="text-slate-500 text-xs ml-2 flex-shrink-0">
                            {formatTime(conv.lastMessage?.timestamp || conv.createdAt)}
                          </span>
                        </div>
                        {conv.status === 'closed' && (
                          <span className="text-xs text-red-400 mt-1 inline-block">Closed</span>
                        )}
                      </div>
                    </div>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 bg-slate-700/30 rounded-xl border border-white/5 overflow-hidden flex flex-col">
          {!activeConv ? (
            <div className="flex-1 flex items-center justify-center text-slate-500">
              <div className="text-center">
                <ChatBubbleLeftRightIcon className="w-16 h-16 mx-auto mb-3 opacity-30" />
                <p className="font-medium">Select a conversation</p>
                <p className="text-sm mt-1">Choose from the list to start messaging</p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-white/10 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center text-slate-900 font-bold text-sm">
                    {activeConv.patient?.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">{activeConv.patient?.name}</p>
                    <p className="text-slate-400 text-xs">{activeConv.patient?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={closePanel}
                    className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                    title="Close chat"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-slate-500">
                    <p className="text-sm">No messages in this conversation</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMine = msg.senderRole === 'admin'
                    return (
                      <div key={msg._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] rounded-2xl px-3.5 py-2 ${
                          isMine
                            ? 'bg-amber-500 text-white rounded-br-md'
                            : 'bg-slate-600/50 text-white rounded-bl-md'
                        }`}>
                          <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                          <p className={`text-xs mt-1 ${isMine ? 'text-white/60' : 'text-slate-400'}`}>
                            {formatTime(msg.createdAt)}
                          </p>
                        </div>
                      </div>
                    )
                  })
                )}
                {typing && (
                  <div className="flex justify-start">
                    <div className="bg-slate-600/50 rounded-2xl px-4 py-2 rounded-bl-md">
                      <p className="text-xs text-slate-400 italic">{typing} is typing...</p>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleSend} className="flex items-center gap-2 p-3 border-t border-white/10 flex-shrink-0">
                <input
                  type="text"
                  value={newMessage}
                  onChange={handleTypingInput}
                  placeholder="Type a reply..."
                  maxLength={2000}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-700 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 placeholder-slate-400"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="p-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <PaperAirplaneIcon className="w-5 h-5" />
                </button>
              </form>
            </>
          )}
        </div>
      </div>

    </div>
  )
}
