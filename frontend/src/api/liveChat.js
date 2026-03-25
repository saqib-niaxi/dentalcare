import client from './client'

export const liveChatAPI = {
  getConversations: () => client.get('/live-chat/conversations'),
  getConversation: (id) => client.get(`/live-chat/conversations/${id}`),
  getMessages: (id, since = null) => client.get(`/live-chat/conversations/${id}/messages${since ? `?since=${encodeURIComponent(since)}` : ''}`),
  createConversation: () => client.post('/live-chat/conversations'),
  closeConversation: (id) => client.put(`/live-chat/conversations/${id}/close`),
  sendMessage: (id, content) => client.post(`/live-chat/conversations/${id}/messages`, { content }),
  markRead: (id) => client.put(`/live-chat/conversations/${id}/read`),
  getUnread: () => client.get('/live-chat/unread'),
  deleteConversation: (id) => client.delete(`/live-chat/conversations/${id}`)
}
