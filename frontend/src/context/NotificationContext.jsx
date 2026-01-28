import { createContext, useContext, useState, useCallback } from 'react'

const NotificationContext = createContext(null)

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([])

  const addNotification = useCallback((message, type = 'info') => {
    const id = Date.now()
    setNotifications(prev => [...prev, { id, message, type }])

    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id))
    }, 5000)

    return id
  }, [])

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const success = useCallback((message) => addNotification(message, 'success'), [addNotification])
  const error = useCallback((message) => addNotification(message, 'error'), [addNotification])
  const info = useCallback((message) => addNotification(message, 'info'), [addNotification])
  const warning = useCallback((message) => addNotification(message, 'warning'), [addNotification])

  const value = {
    notifications,
    addNotification,
    removeNotification,
    success,
    error,
    info,
    warning
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationContainer notifications={notifications} onRemove={removeNotification} />
    </NotificationContext.Provider>
  )
}

function NotificationContainer({ notifications, onRemove }) {
  if (notifications.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px] animate-fadeIn ${
            notification.type === 'success' ? 'bg-green-500 text-white' :
            notification.type === 'error' ? 'bg-red-500 text-white' :
            notification.type === 'warning' ? 'bg-yellow-500 text-white' :
            'bg-blue-500 text-white'
          }`}
        >
          <span className="flex-1">{notification.message}</span>
          <button
            onClick={() => onRemove(notification.id)}
            className="text-white hover:opacity-70"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}

export function useNotification() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider')
  }
  return context
}
