import client from './client'

export const doctorsAPI = {
  // Public endpoints
  getAll: () => client.get('/doctors'),

  getById: (id) => client.get(`/doctors/${id}`),

  getByService: (serviceId) => client.get(`/doctors/service/${serviceId}`),

  getAvailability: (doctorId, date) =>
    client.get(`/doctors/${doctorId}/availability`, { params: { date } }),

  // Admin endpoints
  getAllAdmin: () => client.get('/doctors/admin/all'),

  create: (data) => client.post('/doctors', data),

  update: (id, data) => client.put(`/doctors/${id}`, data),

  delete: (id) => client.delete(`/doctors/${id}`)
}
