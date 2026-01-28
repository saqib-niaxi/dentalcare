import { useState, useCallback } from 'react'
import { servicesAPI } from '../api/services'

export function useServices() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchServices = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await servicesAPI.getAll()
      setServices(response.data.services || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch services')
    } finally {
      setLoading(false)
    }
  }, [])

  const createService = useCallback(async (data) => {
    setLoading(true)
    setError(null)
    try {
      const response = await servicesAPI.create(data)
      setServices(prev => [...prev, response.data.service])
      return response.data.service
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create service')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updateService = useCallback(async (id, data) => {
    setLoading(true)
    setError(null)
    try {
      const response = await servicesAPI.update(id, data)
      setServices(prev =>
        prev.map(svc => svc._id === id ? response.data.service : svc)
      )
      return response.data.service
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update service')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteService = useCallback(async (id) => {
    setLoading(true)
    setError(null)
    try {
      await servicesAPI.delete(id)
      setServices(prev => prev.filter(svc => svc._id !== id))
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete service')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    services,
    loading,
    error,
    fetchServices,
    createService,
    updateService,
    deleteService
  }
}
