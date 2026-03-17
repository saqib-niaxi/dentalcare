import client from './client'

export const liveChatAPI = {
  getConversations: () => client.get('/live-chat/conversations'),
  getConversation: (id, page = 1) => client.get(`/live-chat/conversations/${id}?page=${page}`),
  createConversation: () => client.post('/live-chat/conversations'),
  closeConversation: (id) => client.put(`/live-chat/conversations/${id}/close`),
  getUnread: () => client.get('/live-chat/unread'),
  deleteConversation: (id) => client.delete(`/live-chat/conversations/${id}`)
}
