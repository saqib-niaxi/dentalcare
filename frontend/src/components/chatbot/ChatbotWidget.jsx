import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useChatSession } from './hooks/useChatSession'
import { chatbotConfig } from './ChatbotConfig'

// ============================================
// ICONS
// ============================================

const ChatIcon = () => (
  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
)

const CloseIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

const SendIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
  </svg>
)

const MinimizeIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
)

const SparkleIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 0L14.59 8.41L23 11L14.59 13.59L12 22L9.41 13.59L1 11L9.41 8.41L12 0Z" />
  </svg>
)

const BotAvatarIcon = () => (
  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg">
    <span className="text-white text-sm">🦷</span>
  </div>
)

// ============================================
// MESSAGE COMPONENT
// ============================================

const Message = ({ message, isBot, isFirst, isError }) => {
  const formatMessage = (text) => {
    if (!text) return ''
    let formatted = text
      .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-emerald-600 font-medium underline decoration-emerald-300 underline-offset-2 hover:text-emerald-700 transition-colors">$1</a>')
      .replace(/^• /gm, '<span class="text-emerald-500 mr-2">•</span>')
      .replace(/^(\d+)️⃣/gm, '<span class="mr-1 text-lg">$1️⃣</span>')
      .replace(/\n/g, '<br/>')
    return formatted
  }

  return (
    <div className={`flex ${isBot ? 'justify-start' : 'justify-end'} mb-4 animate-fadeIn`}>
      {isBot && (
        <div className="flex-shrink-0 mr-3">
          <BotAvatarIcon />
        </div>
      )}
      <div className={`max-w-[80%] ${
        isBot
          ? `bg-white/90 backdrop-blur-sm shadow-lg shadow-gray-200/50 border ${isError ? 'border-red-200' : 'border-gray-100/80'} text-gray-700 rounded-2xl rounded-tl-md`
          : 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/30 rounded-2xl rounded-tr-md'
      } px-4 py-3 transition-all duration-300 hover:shadow-xl`}>
        {isBot && isFirst && (
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100/80">
            <div className="flex items-center gap-1.5">
              <SparkleIcon />
              <span className="text-xs font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Sara</span>
            </div>
            <span className="text-[10px] text-gray-400 font-medium">AI Assistant</span>
          </div>
        )}
        <div
          className={`text-sm leading-relaxed whitespace-pre-wrap ${isBot ? '' : 'text-white/95'}`}
          dangerouslySetInnerHTML={{ __html: formatMessage(message) }}
        />
      </div>
    </div>
  )
}

// ============================================
// QUICK ACTION BUTTON
// ============================================

const QuickAction = ({ action, onClick, index }) => {
  const icons = {
    appointment: '📅',
    services: '✨',
    emergency: '🚨',
    hours: '🕐',
    contact: '📞'
  }

  return (
    <button
      onClick={() => onClick(action)}
      style={{ animationDelay: `${index * 80}ms` }}
      className="group flex items-center gap-2 px-4 py-2.5 bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-xl text-sm font-medium text-gray-700 hover:bg-gradient-to-r hover:from-emerald-500 hover:to-teal-500 hover:text-white hover:border-transparent hover:shadow-lg hover:shadow-emerald-500/25 hover:-translate-y-0.5 transition-all duration-300 whitespace-nowrap animate-slideUp"
    >
      <span className="text-base group-hover:scale-110 transition-transform">{icons[action.id] || '💬'}</span>
      {action.label}
    </button>
  )
}

// ============================================
// TYPING INDICATOR
// ============================================

const TypingIndicator = () => (
  <div className="flex justify-start mb-4 animate-fadeIn">
    <div className="flex-shrink-0 mr-3">
      <BotAvatarIcon />
    </div>
    <div className="bg-white/90 backdrop-blur-sm shadow-lg shadow-gray-200/50 border border-gray-100/80 rounded-2xl rounded-tl-md px-5 py-4">
      <div className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
        <span className="w-2.5 h-2.5 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full animate-pulse" style={{ animationDelay: '200ms' }} />
        <span className="w-2.5 h-2.5 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full animate-pulse" style={{ animationDelay: '400ms' }} />
      </div>
    </div>
  </div>
)

// ============================================
// MAIN CHATBOT WIDGET
// ============================================

export default function ChatbotWidget() {
  // Temporarily disabled
  return null

  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [showQuickActions, setShowQuickActions] = useState(true)
  const messagesEndRef = useRef(null)
  const messagesContainerRef = useRef(null)

  // Use the chat session hook
  const {
    messages,
    isLoading,
    error,
    userContext,
    isAuthenticated,
    user,
    isInitialized,
    sendMessage,
    clearChat,
    setMessages
  } = useChatSession()

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  // Hide quick actions after first message
  useEffect(() => {
    if (messages.length > 0) {
      setShowQuickActions(false)
    }
  }, [messages.length])

  // ============================================
  // MESSAGE HANDLERS
  // ============================================

  const handleSend = async () => {
    const text = inputValue.trim()
    if (!text || isLoading) return

    setInputValue('')
    setShowQuickActions(false)
    await sendMessage(text)
  }

  const handleQuickAction = async (action) => {
    let query = action.label

    if (action.id === 'appointment') query = "I want to book an appointment"
    else if (action.id === 'services') query = "What services do you offer?"
    else if (action.id === 'emergency') query = "I have a dental emergency"
    else if (action.id === 'hours') query = "What are your clinic hours?"
    else if (action.id === 'contact') query = "How can I contact you?"

    setShowQuickActions(false)
    await sendMessage(query)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleClearChat = async () => {
    await clearChat()
    setShowQuickActions(true)
  }

  // ============================================
  // SCROLL HANDLER - Fix for mouse wheel scrolling
  // ============================================

  useEffect(() => {
    const container = messagesContainerRef.current
    if (!container) return

    const handleWheel = (e) => {
      const { scrollTop, scrollHeight, clientHeight } = container
      const atTop = scrollTop === 0
      const atBottom = scrollTop + clientHeight >= scrollHeight - 1

      if ((e.deltaY < 0 && atTop) || (e.deltaY > 0 && atBottom)) {
        e.preventDefault()
      }

      e.stopPropagation()
    }

    container.addEventListener('wheel', handleWheel, { passive: false })
    return () => container.removeEventListener('wheel', handleWheel)
  }, [isOpen])

  // ============================================
  // WELCOME MESSAGE
  // ============================================

  const getWelcomeMessage = () => {
    if (isAuthenticated && user) {
      return `Hello ${user.name}! I'm Sara, your dental assistant at ${chatbotConfig.clinicName}. I can help you book appointments quickly using your account details. How can I assist you today?`
    }
    return `Hello! I'm Sara, your dental assistant at ${chatbotConfig.clinicName}. How can I help you today?`
  }

  // ============================================
  // RENDER
  // ============================================

  return (
    <>
      {/* Custom Styles */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 1; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
        .animate-slideUp { animation: slideUp 0.5s ease-out forwards; }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .chatbot-messages {
          scrollbar-width: thin;
          scrollbar-color: rgba(16, 185, 129, 0.3) transparent;
          overscroll-behavior: contain;
        }
        .chatbot-messages::-webkit-scrollbar {
          width: 6px;
        }
        .chatbot-messages::-webkit-scrollbar-track {
          background: transparent;
        }
        .chatbot-messages::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, rgba(16, 185, 129, 0.4), rgba(20, 184, 166, 0.4));
          border-radius: 10px;
        }
        .chatbot-messages::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, rgba(16, 185, 129, 0.6), rgba(20, 184, 166, 0.6));
        }
      `}</style>

      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 rounded-2xl shadow-2xl shadow-emerald-500/40 flex items-center justify-center text-white hover:scale-105 hover:shadow-emerald-500/50 transition-all duration-300 z-50 animate-float group"
        >
          <ChatIcon />
          {/* Pulse Ring */}
          <span className="absolute inset-0 rounded-2xl bg-emerald-400 animate-ping opacity-20" />
          {/* Online Badge */}
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
            <span className="w-2 h-2 bg-white rounded-full" />
          </span>
          {/* Tooltip */}
          <span className="absolute right-full mr-3 px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl">
            Chat with Sara
            <span className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 border-4 border-transparent border-l-gray-900" />
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[400px] h-[620px] max-h-[85vh] bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 rounded-3xl shadow-2xl shadow-gray-300/50 flex flex-col z-50 border border-white/80 overflow-hidden animate-slideUp backdrop-blur-sm">
          {/* Header */}
          <div className="relative bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 text-white p-4 flex items-center justify-between overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 right-0 w-24 h-24 bg-white rounded-full translate-x-1/2 translate-y-1/2" />
            </div>

            <div className="flex items-center gap-3 relative">
              <div className="relative">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg shadow-emerald-700/20">
                  <span className="text-2xl">🦷</span>
                </div>
                {/* Online indicator */}
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-emerald-500" />
              </div>
              <div>
                <h3 className="font-bold text-lg flex items-center gap-2">
                  Sara
                  <span className="px-2 py-0.5 bg-white/20 rounded-full text-[10px] font-medium backdrop-blur-sm">AI</span>
                </h3>
                <p className="text-xs text-emerald-100 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse" />
                  {isAuthenticated ? `Hi, ${user?.name?.split(' ')[0]}` : 'Online'} • Dental Assistant
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 relative">
              <button
                onClick={handleClearChat}
                className="p-2.5 hover:bg-white/10 rounded-xl transition-colors"
                title="Clear chat"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2.5 hover:bg-white/10 rounded-xl transition-colors"
              >
                <MinimizeIcon />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto p-5 chatbot-messages"
            style={{ overscrollBehavior: 'contain', touchAction: 'pan-y' }}
          >
            {/* Welcome Message */}
            {messages.length === 0 && (
              <Message
                message={getWelcomeMessage()}
                isBot={true}
                isFirst={true}
              />
            )}

            {/* Chat Messages */}
            {messages.map((msg, index) => (
              <Message
                key={msg.id}
                message={msg.text}
                isBot={msg.isBot}
                isFirst={msg.isBot && (index === 0 || !messages[index - 1]?.isBot)}
                isError={msg.isError}
              />
            ))}

            {/* Typing Indicator */}
            {isLoading && <TypingIndicator />}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {showQuickActions && messages.length === 0 && (
            <div className="px-5 pb-3">
              <p className="text-xs font-medium text-gray-500 mb-3 flex items-center gap-1.5">
                <SparkleIcon />
                Quick actions
              </p>
              <div className="flex flex-wrap gap-2">
                {chatbotConfig.quickActions.map((action, index) => (
                  <QuickAction key={action.id} action={action} onClick={handleQuickAction} index={index} />
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 bg-white/80 backdrop-blur-sm border-t border-gray-100/80">
            <div className="flex gap-3 items-center">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={isLoading ? "Sara is typing..." : "Type your message..."}
                  className="w-full px-5 py-3.5 bg-gray-50/80 border border-gray-200/60 rounded-2xl focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 focus:bg-white text-sm transition-all duration-300 placeholder:text-gray-400"
                  disabled={isLoading}
                />
              </div>
              <button
                onClick={handleSend}
                disabled={!inputValue.trim() || isLoading}
                className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl flex items-center justify-center hover:shadow-lg hover:shadow-emerald-500/30 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-40 disabled:hover:shadow-none disabled:hover:translate-y-0"
              >
                <SendIcon />
              </button>
            </div>
            <div className="flex items-center justify-center gap-2 mt-3">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
              <p className="text-[11px] text-gray-400 font-medium">
                Powered by AI • {chatbotConfig.clinicName}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
