import { useState, useEffect, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import { doctorsAPI } from '../../api/doctors'
import { servicesAPI } from '../../api/services'
import { useNotification } from '../../context/NotificationContext'
import Modal from '../../components/ui/Modal'
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  UserCircleIcon,
  StarIcon,
  BriefcaseIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'

const specializationColors = {
  'General Dentist': 'from-blue-500/20 to-blue-600/10 border-blue-500/20',
  'Orthodontist': 'from-purple-500/20 to-purple-600/10 border-purple-500/20',
  'Oral Surgeon': 'from-red-500/20 to-red-600/10 border-red-500/20',
  'Periodontist': 'from-green-500/20 to-green-600/10 border-green-500/20',
  'Endodontist': 'from-orange-500/20 to-orange-600/10 border-orange-500/20',
  'Pediatric Dentist': 'from-pink-500/20 to-pink-600/10 border-pink-500/20',
  'Cosmetic Dentist': 'from-amber-500/20 to-amber-600/10 border-amber-500/20'
}

const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

// Utility: create a cropped image blob from crop data
function createImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (e) => reject(e))
    image.crossOrigin = 'anonymous'
    image.src = url
  })
}

async function getCroppedImg(imageSrc, pixelCrop) {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  )

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob)
    }, 'image/jpeg', 0.95)
  })
}

export default function DoctorsTab({ doctors: initialDoctors, onRefresh }) {
  const { success, error } = useNotification()
  const [doctors, setDoctors] = useState(initialDoctors || [])
  const [services, setServices] = useState([])
  const [filter, setFilter] = useState('all') // all, active, inactive
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingDoctor, setEditingDoctor] = useState(null)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)
  const [imageFile, setImageFile] = useState(null)

  // Crop state
  const [isCropModalOpen, setIsCropModalOpen] = useState(false)
  const [rawImageSrc, setRawImageSrc] = useState(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    photo: '',
    bio: '',
    specialization: 'General Dentist',
    experience: '0',
    qualifications: '',
    services: [],
    workingDays: {
      monday: { isWorking: true, start: '09:00', end: '18:00', breakStart: '13:00', breakEnd: '14:00' },
      tuesday: { isWorking: true, start: '09:00', end: '18:00', breakStart: '13:00', breakEnd: '14:00' },
      wednesday: { isWorking: true, start: '09:00', end: '18:00', breakStart: '13:00', breakEnd: '14:00' },
      thursday: { isWorking: true, start: '09:00', end: '18:00', breakStart: '13:00', breakEnd: '14:00' },
      friday: { isWorking: true, start: '09:00', end: '18:00', breakStart: '13:00', breakEnd: '14:00' },
      saturday: { isWorking: true, start: '09:00', end: '14:00', breakStart: '', breakEnd: '' },
      sunday: { isWorking: false, start: '', end: '', breakStart: '', breakEnd: '' }
    }
  })

  useEffect(() => {
    setDoctors(initialDoctors || [])
  }, [initialDoctors])

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      const response = await servicesAPI.getAll()
      setServices(response.data.services || [])
    } catch (err) {
      console.error('Failed to fetch services:', err)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleServiceToggle = (serviceId) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(serviceId)
        ? prev.services.filter(id => id !== serviceId)
        : [...prev.services, serviceId]
    }))
  }

  const handleWorkingDayChange = (day, field, value) => {
    setFormData(prev => ({
      ...prev,
      workingDays: {
        ...prev.workingDays,
        [day]: {
          ...prev.workingDays[day],
          [field]: value
        }
      }
    }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        error('Please select an image file')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        error('Image size must be less than 5MB')
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        setRawImageSrc(reader.result)
        setCrop({ x: 0, y: 0 })
        setZoom(1)
        setIsCropModalOpen(true)
      }
      reader.readAsDataURL(file)
    }
  }

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const handleCropConfirm = async () => {
    try {
      const croppedBlob = await getCroppedImg(rawImageSrc, croppedAreaPixels)
      const croppedFile = new File([croppedBlob], `doctor-cropped-${Date.now()}.jpg`, { type: 'image/jpeg' })

      setImageFile(croppedFile)
      setImagePreview(URL.createObjectURL(croppedBlob))
      setIsCropModalOpen(false)
      setRawImageSrc(null)
    } catch (err) {
      error('Failed to crop image')
    }
  }

  const handleCropCancel = () => {
    setIsCropModalOpen(false)
    setRawImageSrc(null)
  }

  const uploadImage = async () => {
    if (!imageFile) return null

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('image', imageFile)

      const token = localStorage.getItem('token')
      const response = await fetch('/api/upload/image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to upload image')
      }

      return data.url
    } catch (err) {
      error(err.message || 'Failed to upload image')
      return null
    } finally {
      setUploading(false)
    }
  }

  const openAddModal = () => {
    setEditingDoctor(null)
    setImageFile(null)
    setImagePreview(null)
    setFormData({
      name: '',
      email: '',
      phone: '',
      photo: '',
      bio: '',
      specialization: 'General Dentist',
      experience: '0',
      qualifications: '',
      services: [],
      workingDays: {
        monday: { isWorking: true, start: '09:00', end: '18:00', breakStart: '13:00', breakEnd: '14:00' },
        tuesday: { isWorking: true, start: '09:00', end: '18:00', breakStart: '13:00', breakEnd: '14:00' },
        wednesday: { isWorking: true, start: '09:00', end: '18:00', breakStart: '13:00', breakEnd: '14:00' },
        thursday: { isWorking: true, start: '09:00', end: '18:00', breakStart: '13:00', breakEnd: '14:00' },
        friday: { isWorking: true, start: '09:00', end: '18:00', breakStart: '13:00', breakEnd: '14:00' },
        saturday: { isWorking: true, start: '09:00', end: '14:00', breakStart: '', breakEnd: '' },
        sunday: { isWorking: false, start: '', end: '', breakStart: '', breakEnd: '' }
      }
    })
    setIsModalOpen(true)
  }

  const openEditModal = (doctor) => {
    setEditingDoctor(doctor)
    setImageFile(null)
    setImagePreview(doctor.photo || null)
    setFormData({
      name: doctor.name,
      email: doctor.email,
      phone: doctor.phone,
      photo: doctor.photo || '',
      bio: doctor.bio || '',
      specialization: doctor.specialization,
      experience: doctor.experience.toString(),
      qualifications: doctor.qualifications?.join(', ') || '',
      services: doctor.services?.map(s => typeof s === 'object' ? s._id : s) || [],
      workingDays: doctor.workingDays
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Upload image if a new one was selected
      let photoUrl = formData.photo
      if (imageFile) {
        const uploadedUrl = await uploadImage()
        if (uploadedUrl) {
          photoUrl = uploadedUrl
        } else {
          setLoading(false)
          return // Stop if image upload failed
        }
      }

      const data = {
        ...formData,
        photo: photoUrl,
        experience: parseInt(formData.experience),
        qualifications: formData.qualifications.split(',').map(q => q.trim()).filter(Boolean)
      }

      if (editingDoctor) {
        await doctorsAPI.update(editingDoctor._id, data)
        success('Doctor updated successfully!')
      } else {
        await doctorsAPI.create(data)
        success('Doctor added successfully!')
      }
      onRefresh()
      setIsModalOpen(false)
    } catch (err) {
      error(err.response?.data?.message || 'Failed to save doctor')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to deactivate Dr. ${name}? Their appointment history will be preserved.`)) return

    setLoading(true)
    try {
      await doctorsAPI.delete(id)
      success('Doctor deactivated successfully!')
      onRefresh()
    } catch (err) {
      error(err.response?.data?.message || 'Failed to deactivate doctor')
    } finally {
      setLoading(false)
    }
  }

  const filteredDoctors = doctors.filter(doc => {
    if (filter === 'active') return doc.isActive
    if (filter === 'inactive') return !doc.isActive
    return true
  })

  const getWorkingDaysString = (workingDays) => {
    const working = daysOfWeek.filter(day => workingDays[day]?.isWorking)
    if (working.length === 0) return 'No days set'
    if (working.length === 7) return 'All days'
    return working.map(day => day.slice(0, 3).toUpperCase()).join(', ')
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Doctors</h2>
          <p className="text-slate-400 text-sm mt-1">Manage dental practitioners and their schedules</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Filter */}
          <div className="flex items-center gap-2 bg-slate-700/30 rounded-xl p-1 border border-white/5">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${filter === 'all'
                ? 'bg-amber-500 text-slate-900'
                : 'text-slate-400 hover:text-white'
                }`}
            >
              All ({doctors.length})
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${filter === 'active'
                ? 'bg-green-500 text-white'
                : 'text-slate-400 hover:text-white'
                }`}
            >
              Active ({doctors.filter(d => d.isActive).length})
            </button>
            <button
              onClick={() => setFilter('inactive')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${filter === 'inactive'
                ? 'bg-red-500 text-white'
                : 'text-slate-400 hover:text-white'
                }`}
            >
              Inactive ({doctors.filter(d => !d.isActive).length})
            </button>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-900 rounded-xl font-medium transition-all shadow-lg shadow-amber-500/25"
          >
            <PlusIcon className="w-5 h-5" />
            Add Doctor
          </button>
        </div>
      </div>

      {filteredDoctors.length === 0 ? (
        <div className="text-center py-16">
          <UserCircleIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-lg">No doctors found</p>
          <p className="text-slate-500 text-sm mt-1">
            {filter === 'all' ? 'Add your first doctor to get started' : `No ${filter} doctors`}
          </p>
          {filter === 'all' && (
            <button
              onClick={openAddModal}
              className="mt-4 px-6 py-2 bg-amber-500/20 text-amber-400 rounded-xl font-medium hover:bg-amber-500/30 transition-all"
            >
              Add Your First Doctor
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredDoctors.map(doctor => (
            <div
              key={doctor._id}
              className={`bg-slate-700/30 hover:bg-slate-700/50 rounded-2xl p-5 border ${doctor.isActive ? 'border-white/5 hover:border-amber-500/30' : 'border-red-500/20'
                } transition-all duration-300 group relative`}
            >
              {/* Status Badge */}
              <div className="absolute top-3 right-3">
                {doctor.isActive ? (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded-full border border-green-500/20">
                    <CheckCircleIcon className="w-3 h-3" />
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-400 text-xs font-medium rounded-full border border-red-500/20">
                    <XCircleIcon className="w-3 h-3" />
                    Inactive
                  </span>
                )}
              </div>

              {/* Doctor Info */}
              <div className="flex items-start gap-3 mb-4 pr-20">
                <div className={`w-14 h-14 bg-gradient-to-br ${specializationColors[doctor.specialization] || specializationColors['General Dentist']} rounded-xl flex items-center justify-center text-2xl border`}>
                  👨‍⚕️
                </div>
                <div>
                  <h3 className="font-semibold text-white group-hover:text-amber-400 transition-colors text-lg">
                    Dr. {doctor.name}
                  </h3>
                  <p className="text-amber-400 text-sm">{doctor.specialization}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <BriefcaseIcon className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-slate-400 text-xs">{doctor.experience} years exp</span>
                  </div>
                </div>
              </div>

              {/* Bio */}
              {doctor.bio && (
                <p className="text-slate-400 text-sm leading-relaxed mb-3 line-clamp-2">
                  {doctor.bio}
                </p>
              )}

              {/* Contact */}
              <div className="space-y-1 mb-3 text-xs">
                <p className="text-slate-400">📧 {doctor.email}</p>
                <p className="text-slate-400">📞 {doctor.phone}</p>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1 mb-3">
                <StarIcon className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="text-white font-semibold">{doctor.rating.toFixed(1)}</span>
                <span className="text-slate-500 text-xs">/5.0</span>
              </div>

              {/* Services */}
              <div className="mb-3">
                <p className="text-xs text-slate-500 mb-2">Services Provided:</p>
                <div className="flex flex-wrap gap-1">
                  {doctor.services?.slice(0, 3).map(service => (
                    <span
                      key={typeof service === 'object' ? service._id : service}
                      className="px-2 py-1 bg-slate-600/50 text-slate-300 text-xs rounded-lg border border-white/5"
                    >
                      {typeof service === 'object' ? service.name : 'Service'}
                    </span>
                  ))}
                  {doctor.services?.length > 3 && (
                    <span className="px-2 py-1 bg-slate-600/50 text-slate-400 text-xs rounded-lg border border-white/5">
                      +{doctor.services.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              {/* Working Days */}
              <div className="mb-4">
                <p className="text-xs text-slate-500 mb-2 flex items-center gap-1">
                  <CalendarDaysIcon className="w-3.5 h-3.5" />
                  Working Days:
                </p>
                <p className="text-slate-300 text-sm">{getWorkingDaysString(doctor.workingDays)}</p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 pt-3 border-t border-white/5">
                <button
                  onClick={() => openEditModal(doctor)}
                  className="flex-1 flex items-center justify-center gap-1 p-2 text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-all"
                  title="Edit"
                >
                  <PencilSquareIcon className="w-4 h-4" />
                  <span className="text-xs">Edit</span>
                </button>
                {doctor.isActive && (
                  <button
                    onClick={() => handleDelete(doctor._id, doctor.name)}
                    className="flex-1 flex items-center justify-center gap-1 p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                    title="Deactivate"
                  >
                    <TrashIcon className="w-4 h-4" />
                    <span className="text-xs">Deactivate</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image Crop Modal */}
      {isCropModalOpen && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-800 rounded-2xl border border-white/10 w-full max-w-lg mx-4 overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-white/10">
              <h3 className="text-lg font-semibold text-white">Crop Profile Photo</h3>
              <p className="text-slate-400 text-sm mt-1">Zoom and drag to position the photo</p>
            </div>

            {/* Crop Area */}
            <div className="relative w-full h-80 bg-slate-900">
              <Cropper
                image={rawImageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>

            {/* Zoom Slider */}
            <div className="px-6 py-4 space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-slate-400 text-sm shrink-0">Zoom</span>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.05}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <span className="text-slate-400 text-sm w-10 text-right">{zoom.toFixed(1)}x</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 px-6 py-4 border-t border-white/10">
              <button
                onClick={handleCropConfirm}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-900 rounded-xl font-medium transition-all shadow-lg shadow-amber-500/25"
              >
                Crop & Use Photo
              </button>
              <button
                onClick={handleCropCancel}
                className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDoctor ? `Edit Dr. ${editingDoctor.name}` : 'Add New Doctor'}
        dark
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <UserCircleIcon className="w-5 h-5 text-amber-400" />
              Personal Information
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Ahmed Khan"
                    className="w-full px-4 py-3 bg-slate-700/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="doctor@ahmeddental.com"
                    className="w-full px-4 py-3 bg-slate-700/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+92 300 1234567"
                    className="w-full px-4 py-3 bg-slate-700/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Doctor Photo
                  </label>
                  <div className="flex items-start gap-4">
                    {/* Image Preview - circular */}
                    {imagePreview && (
                      <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-amber-500/50 shrink-0 shadow-lg shadow-amber-500/10">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    {/* File Input */}
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="w-full px-4 py-3 bg-slate-700/50 border border-white/10 rounded-xl text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-amber-500 file:text-slate-900 hover:file:bg-amber-600 cursor-pointer focus:outline-none focus:border-amber-500/50 transition-all"
                      />
                      <p className="text-xs text-slate-500 mt-2">
                        Any image works — you'll crop it to a circle after selecting
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Brief description about the doctor..."
                  rows={2}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all resize-none"
                />
              </div>
            </div>
          </div>

          {/* Professional Details */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <BriefcaseIcon className="w-5 h-5 text-amber-400" />
              Professional Details
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Specialization *
                  </label>
                  <select
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all"
                    required
                  >
                    <option value="General Dentist">General Dentist</option>
                    <option value="Orthodontist">Orthodontist</option>
                    <option value="Oral Surgeon">Oral Surgeon</option>
                    <option value="Periodontist">Periodontist</option>
                    <option value="Endodontist">Endodontist</option>
                    <option value="Pediatric Dentist">Pediatric Dentist</option>
                    <option value="Cosmetic Dentist">Cosmetic Dentist</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Experience (years) *
                  </label>
                  <input
                    type="number"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-3 bg-slate-700/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Qualifications (comma-separated)
                </label>
                <input
                  type="text"
                  name="qualifications"
                  value={formData.qualifications}
                  onChange={handleChange}
                  placeholder="BDS, MDS, FCPS"
                  className="w-full px-4 py-3 bg-slate-700/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">
              Services Provided *
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {services.map(service => (
                <label
                  key={service._id}
                  className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${formData.services.includes(service._id)
                    ? 'bg-amber-500/20 border-amber-500/50 text-white'
                    : 'bg-slate-700/30 border-white/10 text-slate-400 hover:border-white/20'
                    }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.services.includes(service._id)}
                    onChange={() => handleServiceToggle(service._id)}
                    className="w-4 h-4 rounded border-white/20 bg-slate-700 text-amber-500 focus:ring-amber-500/50"
                  />
                  <span className="text-sm line-clamp-1">{service.name}</span>
                </label>
              ))}
            </div>
            {formData.services.length === 0 && (
              <p className="text-red-400 text-xs mt-2">Please select at least one service</p>
            )}
          </div>

          {/* Working Schedule */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <CalendarDaysIcon className="w-5 h-5 text-amber-400" />
              Working Schedule
            </h3>
            <div className="space-y-3">
              {daysOfWeek.map(day => (
                <div key={day} className="bg-slate-700/30 rounded-lg p-3 border border-white/5">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                    <div className="flex items-center gap-3 min-w-[120px]">
                      <input
                        type="checkbox"
                        id={`work-${day}`}
                        checked={formData.workingDays[day].isWorking}
                        onChange={(e) => handleWorkingDayChange(day, 'isWorking', e.target.checked)}
                        className="w-4 h-4 rounded border-white/20 bg-slate-700 text-amber-500 focus:ring-amber-500/50"
                      />
                      <label htmlFor={`work-${day}`} className="text-sm font-medium text-white capitalize cursor-pointer">{day}</label>
                    </div>

                    {formData.workingDays[day].isWorking ? (
                      <div className="flex flex-wrap items-center gap-y-3 gap-x-4 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500 text-xs uppercase tracking-wider font-semibold w-8">Shift:</span>
                          <input
                            type="time"
                            value={formData.workingDays[day].start}
                            onChange={(e) => handleWorkingDayChange(day, 'start', e.target.value)}
                            className="px-2 py-1 bg-slate-600/50 border border-white/10 rounded text-white text-sm focus:outline-none focus:border-amber-500/50"
                          />
                          <span className="text-slate-500 text-xs">to</span>
                          <input
                            type="time"
                            value={formData.workingDays[day].end}
                            onChange={(e) => handleWorkingDayChange(day, 'end', e.target.value)}
                            className="px-2 py-1 bg-slate-600/50 border border-white/10 rounded text-white text-sm focus:outline-none focus:border-amber-500/50"
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-slate-500 text-xs uppercase tracking-wider font-semibold w-8">Break:</span>
                          <input
                            type="time"
                            value={formData.workingDays[day].breakStart}
                            onChange={(e) => handleWorkingDayChange(day, 'breakStart', e.target.value)}
                            className="px-2 py-1 bg-slate-600/50 border border-white/10 rounded text-white text-sm focus:outline-none focus:border-amber-500/50"
                            placeholder="Start"
                          />
                          <span className="text-slate-500 text-xs">-</span>
                          <input
                            type="time"
                            value={formData.workingDays[day].breakEnd}
                            onChange={(e) => handleWorkingDayChange(day, 'breakEnd', e.target.value)}
                            className="px-2 py-1 bg-slate-600/50 border border-white/10 rounded text-white text-sm focus:outline-none focus:border-amber-500/50"
                            placeholder="End"
                          />
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-500 text-sm italic">Not working today</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-white/5 mt-6">
            <button
              type="submit"
              disabled={loading || uploading || formData.services.length === 0}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-900 rounded-xl font-medium transition-all disabled:opacity-50 shadow-lg shadow-amber-500/25"
            >
              {uploading ? 'Uploading image...' : loading ? 'Saving...' : (editingDoctor ? 'Update Doctor' : 'Add Doctor')}
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
