import { useState, useCallback } from 'react'
import { appointmentsAPI } from '../api/appointments'

export function useAppointments() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchAppointments = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await appointmentsAPI.getAll()
      setAppointments(response.data.appointments || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch appointments')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchMyAppointments = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await appointmentsAPI.getMyAppointments()
      setAppointments(response.data.appointments || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch appointments')
    } finally {
      setLoading(false)
    }
  }, [])

  const createAppointment = useCallback(async (data) => {
    setLoading(true)
    setError(null)
    try {
      const response = await appointmentsAPI.create(data)
      setAppointments(prev => [...prev, response.data.appointment])
      return response.data.appointment
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create appointment')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updateAppointment = useCallback(async (id, data) => {
    setLoading(true)
    setError(null)
    try {
      const response = await appointmentsAPI.update(id, data)
      setAppointments(prev =>
        prev.map(apt => apt._id === id ? response.data.appointment : apt)
      )
      return response.data.appointment
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update appointment')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteAppointment = useCallback(async (id) => {
    setLoading(true)
    setError(null)
    try {
      await appointmentsAPI.delete(id)
      setAppointments(prev => prev.filter(apt => apt._id !== id))
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete appointment')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    appointments,
    loading,
    error,
    fetchAppointments,
    fetchMyAppointments,
    createAppointment,
    updateAppointment,
    deleteAppointment
  }
}
