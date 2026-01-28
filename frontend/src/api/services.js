import client from './client'

export const servicesAPI = {
  getAll: () => client.get('/services'),

  getById: (id) => client.get(`/services/${id}`),

  // Admin endpoints
  create: (data) => client.post('/services', data),

  update: (id, data) => client.put(`/services/${id}`, data),

  delete: (id) => client.delete(`/services/${id}`)
}
