import client from './client'

export const appointmentsAPI = {
  // Patient endpoints
  create: (data) => client.post('/appointments', data),

  getMyAppointments: () => client.get('/appointments/my-appointments'),

  // Admin endpoints
  getAll: () => client.get('/appointments'),

  getAllPatients: () => client.get('/appointments/all-patients'),

  getById: (id) => client.get(`/appointments/${id}`),

  update: (id, data) => client.put(`/appointments/${id}/status`, data),

  delete: (id) => client.delete(`/appointments/${id}`),

  reschedule: (id, data) => client.put(`/appointments/${id}/reschedule`, data)
}
