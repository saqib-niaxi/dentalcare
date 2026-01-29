import { useState } from 'react'
import { servicesAPI } from '../../api/services'
import { useNotification } from '../../context/NotificationContext'
import { formatCurrency } from '../../utils/formatters'
import Modal from '../../components/ui/Modal'
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  ClockIcon,
  CurrencyDollarIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'

const serviceIcons = {
  'Dental Checkup': '🦷',
  'Teeth Cleaning': '✨',
  'Teeth Whitening': '💎',
  'Root Canal Treatment': '🔧',
  'Dental Implants': '🦿',
  'Dental Filling': '🪥',
  'Dental Braces': '😁',
  'Tooth Extraction': '🦷',
  'Dental Crown': '👑',
  'Teeth Replacement': '🔄',
  default: '🦷'
}

export default function ServicesTab({ services, onRefresh }) {
  const { success, error } = useNotification()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingService, setEditingService] = useState(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: ''
  })

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const openAddModal = () => {
    setEditingService(null)
    setFormData({ name: '', description: '', price: '', duration: '' })
    setIsModalOpen(true)
  }

  const openEditModal = (service) => {
    setEditingService(service)
    setFormData({
      name: service.name,
      description: service.description,
      price: service.price.toString(),
      duration: service.duration.toString()
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const data = {
      ...formData,
      price: parseFloat(formData.price),
      duration: parseInt(formData.duration)
    }

    try {
      if (editingService) {
        await servicesAPI.update(editingService._id, data)
        success('Service updated!')
      } else {
        await servicesAPI.create(data)
        success('Service added!')
      }
      onRefresh()
      setIsModalOpen(false)
    } catch (err) {
      error(err.response?.data?.message || 'Failed to save service')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return

    setLoading(true)
    try {
      await servicesAPI.delete(id)
      success('Service deleted!')
      onRefresh()
    } catch (err) {
      error(err.response?.data?.message || 'Failed to delete service')
    } finally {
      setLoading(false)
    }
  }

  const getServiceIcon = (name) => {
    return serviceIcons[name] || serviceIcons.default
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Services</h2>
          <p className="text-slate-400 text-sm mt-1">Manage dental services and pricing</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-900 rounded-xl font-medium transition-all shadow-lg shadow-amber-500/25"
        >
          <PlusIcon className="w-5 h-5" />
          Add Service
        </button>
      </div>

      {services.length === 0 ? (
        <div className="text-center py-16">
          <SparklesIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-lg">No services found</p>
          <p className="text-slate-500 text-sm mt-1">Add your first service to get started</p>
          <button
            onClick={openAddModal}
            className="mt-4 px-6 py-2 bg-amber-500/20 text-amber-400 rounded-xl font-medium hover:bg-amber-500/30 transition-all"
          >
            Add Your First Service
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {services.map(service => (
            <div
              key={service._id}
              className="bg-slate-700/30 hover:bg-slate-700/50 rounded-2xl p-5 border border-white/5 hover:border-amber-500/30 transition-all duration-300 group"
            >
              {/* Header with Icon */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500/20 to-amber-600/10 rounded-xl flex items-center justify-center text-2xl border border-amber-500/20">
                    {getServiceIcon(service.name)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white group-hover:text-amber-400 transition-colors">
                      {service.name}
                    </h3>
                    <div className="flex items-center gap-1 text-slate-400 text-sm">
                      <ClockIcon className="w-3.5 h-3.5" />
                      {service.duration} mins
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-slate-400 text-sm leading-relaxed mb-4 line-clamp-2">
                {service.description}
              </p>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="flex items-center gap-1">
                  <span className="text-2xl font-bold text-amber-400">{formatCurrency(service.price)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(service)}
                    className="p-2 text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-all"
                    title="Edit"
                  >
                    <PencilSquareIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(service._id, service.name)}
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                    title="Delete"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingService ? 'Edit Service' : 'Add New Service'}
        dark
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Service Name */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Service Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Teeth Cleaning"
              className="w-full px-4 py-3 bg-slate-700/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the service..."
              rows={3}
              className="w-full px-4 py-3 bg-slate-700/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all resize-none"
              required
            />
          </div>

          {/* Price & Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Price (PKR)
              </label>
              <div className="relative">
                <CurrencyDollarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="2000"
                  min="0"
                  className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Duration (mins)
              </label>
              <div className="relative">
                <ClockIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  placeholder="30"
                  min="5"
                  className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all"
                  required
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-900 rounded-xl font-medium transition-all disabled:opacity-50 shadow-lg shadow-amber-500/25"
            >
              {loading ? 'Saving...' : (editingService ? 'Update Service' : 'Add Service')}
            </button>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
