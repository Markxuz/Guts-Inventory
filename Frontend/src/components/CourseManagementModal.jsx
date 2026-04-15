import { useState, useEffect } from 'react'
import { X, Trash2, Edit2, Plus, CheckCircle2, RotateCcw } from 'lucide-react'
import Button from './Button'
import { useToast } from '../context/ToastContext'
import { getAllCourses, createCourse, updateCourse, deleteCourse, getArchivedCourses, restoreCourse, hardDeleteCourse } from '../api/courseApi'

const CourseManagementModal = ({ isOpen, onClose, onCoursesUpdated }) => {
  const { success, error: showError } = useToast()
  const [courses, setCourses] = useState([])
  const [archivedCourses, setArchivedCourses] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState(null)
  const [showArchived, setShowArchived] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
  })
  const [formErrors, setFormErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchCourses()
      fetchArchivedCourses()
    }
  }, [isOpen])

  const fetchCourses = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getAllCourses()
      setCourses(data.courses || [])
    } catch (err) {
      setError('Failed to load courses. Please try again.')
      console.error('Error fetching courses:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchArchivedCourses = async () => {
    try {
      const data = await getArchivedCourses()
      setArchivedCourses(data.courses || [])
    } catch (err) {
      console.error('Error fetching archived courses:', err)
    }
  }

  const handleAddCourse = () => {
    setEditingCourse(null)
    setFormData({
      name: '',
      code: '',
      description: '',
    })
    setFormErrors({})
    setIsFormOpen(true)
  }

  const handleEditCourse = (course) => {
    setEditingCourse(course)
    setFormData({
      name: course.name || '',
      code: course.code || '',
      description: course.description || '',
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

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) newErrors.name = 'Course name is required'
    if (!formData.code.trim()) newErrors.code = 'Course code is required'

    setFormErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      if (editingCourse) {
        await updateCourse(editingCourse.id, formData)
        success('Course updated successfully!')
      } else {
        await createCourse(formData)
        success('Course created successfully!')
      }
      onCoursesUpdated?.()
      setIsFormOpen(false)
      fetchCourses()
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to save course'
      showError(`Error: ${errorMsg}`)
      console.error('Error saving course:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return

    try {
      await deleteCourse(courseId)
      success('Course deleted successfully!')
      onCoursesUpdated?.()
      fetchCourses()
      fetchArchivedCourses()
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to delete course'
      showError(`Error: ${errorMsg}`)
      console.error('Error deleting course:', err)
    }
  }

  const handleRestoreCourse = async (courseId) => {
    try {
      await restoreCourse(courseId)
      success('Course restored successfully!')
      fetchCourses()
      fetchArchivedCourses()
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to restore course'
      showError(`Error: ${errorMsg}`)
      console.error('Error restoring course:', err)
    }
  }

  const handleHardDeleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to permanently delete this course? This cannot be undone.')) return

    try {
      await hardDeleteCourse(courseId)
      success('Course permanently deleted!')
      fetchArchivedCourses()
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to delete course'
      showError(`Error: ${errorMsg}`)
      console.error('Error permanently deleting course:', err)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-4xl rounded-2xl bg-white shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 border-b border-slate-200 bg-white px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-title text-lg font-bold text-slate-800">
              Course Management
            </h2>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              type="button"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          {/* Tabs */}
          <div className="flex items-center gap-4 border-b border-slate-200 mb-4">
            <button
              onClick={() => setShowArchived(false)}
              className={`px-4 py-2 font-semibold text-sm transition-colors ${
                !showArchived
                  ? 'text-[var(--brand-primary)] border-b-2 border-[var(--brand-primary)]'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
              type="button"
            >
              Active Courses
            </button>
            <button
              onClick={() => setShowArchived(true)}
              className={`px-4 py-2 font-semibold text-sm transition-colors ${
                showArchived
                  ? 'text-[var(--brand-primary)] border-b-2 border-[var(--brand-primary)]'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
              type="button"
            >
              Archived ({archivedCourses.length})
            </button>
          </div>

          {/* Add Course Button - only show on Active tab */}
          {!showArchived && (
            <div className="flex justify-end">
              <Button
                className="flex items-center gap-2 bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-strong)]"
                onClick={handleAddCourse}
              >
                <Plus className="h-4 w-4" />
                Add Course
              </Button>
            </div>
          )}
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
                  {editingCourse ? 'Edit Course' : 'Add New Course'}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="p-1 text-slate-400 hover:bg-slate-200 rounded"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Course Name */}
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">
                  Course Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  placeholder="e.g., Electrical Installation and Maintenance"
                  className={`w-full rounded-lg border px-4 py-2.5 text-sm ${
                    formErrors.name ? 'border-red-300 focus:ring-red-200' : 'border-slate-300'
                  }`}
                />
                {formErrors.name && <p className="mt-1 text-xs text-red-600">{formErrors.name}</p>}
              </div>

              {/* Course Code */}
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">
                  Course Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleFormChange}
                  placeholder="e.g., EIM, SMAW, CSS"
                  className={`w-full rounded-lg border px-4 py-2.5 text-sm ${
                    formErrors.code ? 'border-red-300 focus:ring-red-200' : 'border-slate-300'
                  }`}
                />
                {formErrors.code && <p className="mt-1 text-xs text-red-600">{formErrors.code}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  placeholder="Brief description of the course (optional)"
                  rows="3"
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm resize-none"
                />
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
                  {isSubmitting ? (editingCourse ? 'Updating...' : 'Creating...') : (editingCourse ? 'Update Course' : 'Add Course')}
                </Button>
              </div>
            </form>
          ) : (
            // List View
            <>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-slate-400 text-sm">Loading courses...</div>
                </div>
              ) : !showArchived ? (
                // Active Courses Tab
                courses.filter(c => c.isActive).length === 0 ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <p className="text-slate-400 text-sm">No active courses. Create your first one!</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {courses.filter(c => c.isActive).map(course => (
                      <div key={course.id} className="flex items-center justify-between border border-slate-200 rounded-lg p-4 bg-white hover:bg-slate-50 transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-slate-900">{course.name}</h3>
                            <span className="inline-block px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-700 rounded">
                              {course.code}
                            </span>
                          </div>
                          {course.description && (
                            <p className="text-xs text-slate-500 mt-1">{course.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditCourse(course)}
                            className="p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 rounded-lg transition-colors"
                            title="Edit course"
                            type="button"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCourse(course.id)}
                            className="p-2 text-red-500 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors"
                            title="Delete course"
                            type="button"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                // Archived Courses Tab
                archivedCourses.length === 0 ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <p className="text-slate-400 text-sm">No archived courses</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {archivedCourses.map(course => (
                      <div key={course.id} className="flex items-center justify-between border border-slate-200 border-yellow-200 rounded-lg p-4 bg-yellow-50 hover:bg-yellow-100 transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-slate-900">{course.name}</h3>
                            <span className="inline-block px-2 py-1 text-xs font-semibold bg-yellow-200 text-yellow-800 rounded">
                              {course.code}
                            </span>
                            <span className="inline-block px-2 py-1 text-xs font-semibold bg-gray-200 text-gray-700 rounded">
                              Archived
                            </span>
                          </div>
                          {course.description && (
                            <p className="text-xs text-slate-500 mt-1">{course.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleRestoreCourse(course.id)}
                            className="p-2 text-green-600 hover:bg-green-50 hover:text-green-700 rounded-lg transition-colors"
                            title="Restore course"
                            type="button"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleHardDeleteCourse(course.id)}
                            className="p-2 text-red-600 hover:bg-red-50 hover:text-red-800 rounded-lg transition-colors"
                            title="Permanently delete course"
                            type="button"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default CourseManagementModal
