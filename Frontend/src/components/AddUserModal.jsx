import { useState } from 'react'
import { X, User, Mail, Lock, UserCog } from 'lucide-react'
import Button from './Button'
import { createUser } from '../api/authApi'

const AddUserModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    role: 'staff'
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.username.trim()) newErrors.username = 'Username is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format'
    }
    if (!formData.password.trim()) newErrors.password = 'Password is required'
    else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      await createUser(formData)
      
      // Reset form
      setFormData({
        username: '',
        email: '',
        password: '',
        fullName: '',
        role: 'staff'
      })
      setErrors({})
      
      // Close modal and show success
      onClose()
      if (onSuccess) {
        onSuccess(formData.fullName, formData.role)
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to create user'
      if (errorMsg.includes('already exists')) {
        setErrors({ submit: 'Username or email already exists' })
      } else {
        setErrors({ submit: errorMsg })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="flex items-center gap-2 font-title text-lg font-bold text-slate-800">
            <UserCog className="h-5 w-5 text-[var(--brand-primary)]" />
            Add New User
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {errors.submit && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {errors.submit}
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="e.g., John Doe"
              className={`w-full rounded-lg border px-4 py-2.5 text-sm text-slate-900 placeholder-slate-500 transition-colors focus:outline-none focus:ring-2 ${
                errors.fullName
                  ? 'border-red-300 focus:ring-red-200'
                  : 'border-slate-300 focus:ring-[var(--brand-primary)]/20'
              }`}
            />
            {errors.fullName && (
              <p className="mt-1 text-xs text-red-600">{errors.fullName}</p>
            )}
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">
              <User className="inline h-4 w-4 mr-1" />
              Username <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="e.g., john.doe"
              className={`w-full rounded-lg border px-4 py-2.5 text-sm text-slate-900 placeholder-slate-500 transition-colors focus:outline-none focus:ring-2 ${
                errors.username
                  ? 'border-red-300 focus:ring-red-200'
                  : 'border-slate-300 focus:ring-[var(--brand-primary)]/20'
              }`}
            />
            {errors.username && (
              <p className="mt-1 text-xs text-red-600">{errors.username}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">
              <Mail className="inline h-4 w-4 mr-1" />
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g., john@example.com"
              className={`w-full rounded-lg border px-4 py-2.5 text-sm text-slate-900 placeholder-slate-500 transition-colors focus:outline-none focus:ring-2 ${
                errors.email
                  ? 'border-red-300 focus:ring-red-200'
                  : 'border-slate-300 focus:ring-[var(--brand-primary)]/20'
              }`}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">
              <Lock className="inline h-4 w-4 mr-1" />
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Min. 6 characters"
              className={`w-full rounded-lg border px-4 py-2.5 text-sm text-slate-900 placeholder-slate-500 transition-colors focus:outline-none focus:ring-2 ${
                errors.password
                  ? 'border-red-300 focus:ring-red-200'
                  : 'border-slate-300 focus:ring-[var(--brand-primary)]/20'
              }`}
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-600">{errors.password}</p>
            )}
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">
              <UserCog className="inline h-4 w-4 mr-1" />
              Role <span className="text-red-500">*</span>
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20"
            >
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Add User Button */}
          <div className="pt-4">
            <Button
              className="w-full bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-strong)]"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? 'Creating...' : 'Add User'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddUserModal
