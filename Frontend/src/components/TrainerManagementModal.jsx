import { useState, useEffect } from 'react'
import { X, Trash2, Edit2, Plus, CheckCircle2 } from 'lucide-react'
import Button from './Button'
import { createTrainer, getAllTrainers, updateTrainer, deleteTrainer } from '../api/authApi'
import { getActiveCourses } from '../api/courseApi'

const TrainerManagementModal = ({ isOpen, onClose }) => {
  const [trainers, setTrainers] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTrainer, setEditingTrainer] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    categories: [],
  })
  const [formErrors, setFormErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchData()
    }
  }, [isOpen])

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [trainersData, coursesData] = await Promise.all([
        getAllTrainers(),
        getActiveCourses(),
      ])
      setTrainers(trainersData.trainers || [])
      setCourses(coursesData.courses || [])
    } catch (err) {
      setError('Failed to load data. Please try again.')
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchTrainers = async () => {
    await fetchData()
  }

  const handleAddTrainer = () => {
    setEditingTrainer(null)
    setFormData({
      name: '',
      email: '',
      phone: '',
      categories: [],
    })
    setFormErrors({})
    setIsFormOpen(true)
  }

  const handleEditTrainer = (trainer) => {
    setEditingTrainer(trainer)
    setFormData({
      name: trainer.name || '',
      email: trainer.email || '',
      phone: trainer.phone || '',
      categories: Array.isArray(trainer.categories) ? trainer.categories : [],
    })
    setFormErrors({})
    setIsFormOpen(true)
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const toggleCategory = (category) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }))
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format'
    }
    if (formData.categories.length === 0) newErrors.categories = 'Select at least one category'

    setFormErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      if (editingTrainer) {
        await updateTrainer(editingTrainer.id, {
          name: formData.name,
          email: formData.email,
          phone: formData.phone || null,
          categories: formData.categories,
        })
        alert('✓ Trainer updated successfully!')
      } else {
        await createTrainer({
          name: formData.name,
          email: formData.email,
          phone: formData.phone || null,
          categories: formData.categories,
        })
        alert('✓ Trainer created successfully!')
      }

      setIsFormOpen(false)
      fetchTrainers()
    } catch (err) {
      const errorMsg = err.response?.data?.error || `Failed to ${editingTrainer ? 'update' : 'create'} trainer`
      alert(`✗ Error: ${errorMsg}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteTrainer = async (trainerId, trainerName) => {
    if (window.confirm(`Are you sure you want to deactivate trainer "${trainerName}"?`)) {
      try {
        await deleteTrainer(trainerId)
        alert(`✓ Trainer "${trainerName}" has been deactivated.`)
        fetchTrainers()
      } catch (err) {
        const errorMsg = err.response?.data?.error || 'Failed to delete trainer'
        alert(`✗ Error: ${errorMsg}`)
      }
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-4xl rounded-2xl bg-white shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <h2 className="font-title text-lg font-bold text-slate-800">
            Trainer Management
          </h2>
          <div className="flex items-center gap-2">
            <Button
              className="flex items-center gap-2 bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-strong)]"
              onClick={handleAddTrainer}
            >
              <Plus className="h-4 w-4" />
              Add Trainer
            </Button>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              type="button"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {isFormOpen ? (
            // Form View
            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-4 border border-slate-200 rounded-lg p-6 bg-slate-50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-800">
                  {editingTrainer ? 'Edit Trainer' : 'Add New Trainer'}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="p-1 text-slate-400 hover:bg-slate-200 rounded"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  placeholder="e.g., John Instructor"
                  className={`w-full rounded-lg border px-4 py-2.5 text-sm ${
                    formErrors.name ? 'border-red-300 focus:ring-red-200' : 'border-slate-300'
                  }`}
                />
                {formErrors.name && <p className="mt-1 text-xs text-red-600">{formErrors.name}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  placeholder="e.g., john@example.com"
                  className={`w-full rounded-lg border px-4 py-2.5 text-sm ${
                    formErrors.email ? 'border-red-300 focus:ring-red-200' : 'border-slate-300'
                  }`}
                />
                {formErrors.email && <p className="mt-1 text-xs text-red-600">{formErrors.email}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">
                  Phone
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleFormChange}
                  placeholder="e.g., 09xxxxxxxxx"
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm"
                />
              </div>

              {/* Categories */}
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-3">
                  Courses Assigned <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {courses.length === 0 ? (
                    <p className="text-xs text-slate-500">No courses available. Please create courses first.</p>
                  ) : (
                    courses.map(course => (
                      <label key={course.id} className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={formData.categories.includes(course.code)}
                          onChange={() => toggleCategory(course.code)}
                          className="h-4 w-4 rounded text-[var(--brand-primary)]"
                        />
                        <div className="flex-1">
                          <span className="font-medium text-slate-900">{course.name}</span>
                          <span className="ml-2 text-xs text-slate-500">({course.code})</span>
                        </div>
                      </label>
                    ))
                  )}
                </div>
                {formErrors.categories && <p className="mt-2 text-xs text-red-600">{formErrors.categories}</p>}
              </div>

              {/* Submit */}
              <div className="pt-4 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <Button
                  className="bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-strong)]"
                  disabled={isSubmitting}
                  type="submit"
                >
                  {isSubmitting ? (editingTrainer ? 'Updating...' : 'Creating...') : (editingTrainer ? 'Update Trainer' : 'Add Trainer')}
                </Button>
              </div>
            </form>
          ) : (
            // List View
            <>
              {loading ? (
                <div className="text-center py-8 text-slate-600">Loading trainers...</div>
              ) : trainers.length === 0 ? (
                <div className="text-center py-8 text-slate-600">No trainers found.</div>
              ) : (
                <div className="grid gap-4">
                  {trainers.map((trainer) => (
                    <div
                      key={trainer.id}
                      className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900">{trainer.name}</h4>
                        <p className="text-sm text-slate-600">{trainer.email}</p>
                        {trainer.phone && <p className="text-sm text-slate-600">{trainer.phone}</p>}
                        <div className="flex flex-wrap gap-2 mt-2">
                          {Array.isArray(trainer.categories) && trainer.categories.map(category => (
                            <span
                              key={category}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]"
                            >
                              <CheckCircle2 className="h-3 w-3" />
                              {category}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          trainer.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {trainer.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <button
                          onClick={() => handleEditTrainer(trainer)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit trainer"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTrainer(trainer.id, trainer.name)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Deactivate trainer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default TrainerManagementModal
