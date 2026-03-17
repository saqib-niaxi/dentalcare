import client from './client'

export const messagesAPI = {
  getMessages: (appointmentId) => client.get(`/appointments/${appointmentId}/messages`),
  sendMessage: (appointmentId, content) => client.post(`/appointments/${appointmentId}/messages`, { content }),
  markAsRead: (appointmentId) => client.put(`/appointments/${appointmentId}/messages/read`),
  getUnreadCounts: () => client.get('/appointments/messages/unread-counts')
}
