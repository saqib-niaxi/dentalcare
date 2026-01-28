import client from './client'

export const authAPI = {
  register: (data) => client.post('/auth/register', data),

  verifyOTP: (data) => client.post('/auth/verify-email', data),

  resendOTP: (email) => client.post('/auth/resend-otp', { email }),

  login: (data) => client.post('/auth/login', data),

  forgotPassword: (email) => client.post('/auth/forgot-password', { email }),

  resetPassword: (data) => client.post('/auth/reset-password', data),

  getProfile: () => client.get('/auth/profile')
}
