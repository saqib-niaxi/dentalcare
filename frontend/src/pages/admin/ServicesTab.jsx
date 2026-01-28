import { useState } from 'react'
import { servicesAPI } from '../../api/services'
import { useNotification } from '../../context/NotificationContext'
import { formatCurrency } from '../../utils/formatters'
import Button from '../../components/ui/Button'
import Input, { Textarea } from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'

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

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return

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

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-dark">Manage Services</h2>
        <Button onClick={openAddModal} size="sm">
          Add Service
        </Button>
      </div>

      {services.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No services found. Add your first service!
        </div>
      ) : (
        <div className="grid gap-4">
          {services.map(service => (
            <div key={service._id} className="bg-light rounded-lg p-4 flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1">
                <h3 className="font-semibold text-dark">{service.name}</h3>
                <p className="text-gray-600 text-sm mt-1">{service.description}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="font-bold text-primary">{formatCurrency(service.price)}</div>
                  <div className="text-sm text-gray-500">{service.duration} mins</div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(service)}
                    className="text-primary hover:underline text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(service._id)}
                    className="text-red-500 hover:underline text-sm"
                  >
                    Delete
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
      >
        <form onSubmit={handleSubmit}>
          <Input
            label="Service Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., Teeth Cleaning"
            required
          />

          <Textarea
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe the service..."
            rows={3}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Price (PKR)"
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="e.g., 2000"
              min="0"
              required
            />

            <Input
              label="Duration (minutes)"
              type="number"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              placeholder="e.g., 30"
              min="5"
              required
            />
          </div>

          <div className="flex gap-2 mt-6">
            <Button type="submit" loading={loading}>
              {editingService ? 'Update' : 'Add'} Service
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
