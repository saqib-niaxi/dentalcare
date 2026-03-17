import client from './client';

export const ratingsAPI = {
  // Public - Get approved ratings for a doctor
  getDoctorRatings: (doctorId) => client.get(`/ratings/doctor/${doctorId}`),

  // Protected - User rating management
  createRating: (data) => client.post('/ratings', data),
  getMyRating: (doctorId) => client.get(`/ratings/my-rating/${doctorId}`),
  updateRating: (id, data) => client.put(`/ratings/${id}`, data),
  deleteRating: (id) => client.delete(`/ratings/${id}`),

  // Admin endpoints
  getAllRatings: (status) => client.get('/ratings/admin/all', { params: { status } }),
  approveRating: (id) => client.put(`/ratings/admin/${id}/approve`),
  rejectRating: (id, reason) => client.put(`/ratings/admin/${id}/reject`, { reason }),
  deleteRatingAdmin: (id) => client.delete(`/ratings/admin/${id}`)
};
