export function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

export function validatePhone(phone) {
  const regex = /^(\+92|0)?[0-9]{10}$/
  return regex.test(phone.replace(/[-\s]/g, ''))
}

export function validatePassword(password) {
  return password.length >= 6
}

export function validateRequired(value) {
  return value && value.trim().length > 0
}

export function validateOTP(otp) {
  return /^\d{6}$/.test(otp)
}
