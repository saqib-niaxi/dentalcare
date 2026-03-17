import { useState, useCallback } from 'react'
import { doctorsAPI } from '../api/doctors'

export function useDoctors() {
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchDoctors = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await doctorsAPI.getAll()
      setDoctors(response.data.doctors || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch doctors')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchDoctorsByService = useCallback(async (serviceId) => {
    setLoading(true)
    setError(null)
    try {
      const response = await doctorsAPI.getByService(serviceId)
      setDoctors(response.data.doctors || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch doctors for this service')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchDoctorById = useCallback(async (id) => {
    setLoading(true)
    setError(null)
    try {
      const response = await doctorsAPI.getById(id)
      return response.data.doctor
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch doctor')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchDoctorAvailability = useCallback(async (doctorId, date) => {
    setLoading(true)
    setError(null)
    try {
      const response = await doctorsAPI.getAvailability(doctorId, date)
      return response.data.slots || []
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch availability')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const createDoctor = useCallback(async (data) => {
    setLoading(true)
    setError(null)
    try {
      const response = await doctorsAPI.create(data)
      setDoctors(prev => [...prev, response.data.doctor])
      return response.data.doctor
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create doctor')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updateDoctor = useCallback(async (id, data) => {
    setLoading(true)
    setError(null)
    try {
      const response = await doctorsAPI.update(id, data)
      setDoctors(prev =>
        prev.map(doc => doc._id === id ? response.data.doctor : doc)
      )
      return response.data.doctor
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update doctor')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteDoctor = useCallback(async (id) => {
    setLoading(true)
    setError(null)
    try {
      await doctorsAPI.delete(id)
      setDoctors(prev => prev.map(doc =>
        doc._id === id ? { ...doc, isActive: false } : doc
      ))
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete doctor')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    doctors,
    loading,
    error,
    fetchDoctors,
    fetchDoctorsByService,
    fetchDoctorById,
    fetchDoctorAvailability,
    createDoctor,
    updateDoctor,
    deleteDoctor
  }
}
