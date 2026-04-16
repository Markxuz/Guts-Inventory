import { useState, useEffect } from "react"
import { X } from "lucide-react"
import Button from "./Button"
import { useToast } from "../context/ToastContext"
import { getTrainers } from "../api/authApi"
import api from "../api/axios"

const RequestStockModal = ({
  isOpen,
  item,
  onClose,
  onRequestSubmitted,
}) => {
  const { success, error: showError } = useToast()
  const [formData, setFormData] = useState({
    quantity: "",
    reason: "",
    course: "",
    trainer: "",
    purpose: "Training",
    startDate: "",
    endDate: "",
  })
  const [trainers, setTrainers] = useState([])
  const [loadingTrainers, setLoadingTrainers] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch trainers on component mount
  useEffect(() => {
    const fetchTrainers = async () => {
      setLoadingTrainers(true)
      try {
        const data = await getTrainers()
        setTrainers(data.trainers || [])
      } catch (error) {
        console.error("Failed to fetch trainers:", error)
        setTrainers([])
      } finally {
        setLoadingTrainers(false)
      }
    }
    fetchTrainers()
  }, [])

  // Initialize form when modal opens
  useEffect(() => {
    if (isOpen) {
      const today = new Date().toISOString().split('T')[0]
      setFormData({
        quantity: "",
        reason: "",
        course: "",
        trainer: "",
        purpose: "Training",
        startDate: today,
        endDate: today,
      })
    }
  }, [isOpen])

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.quantity || parseInt(formData.quantity) < 1) {
      showError("Please enter a valid quantity.")
      return
    }

    if (!item) {
      showError("Item not found.")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await api.post('/requests', {
        consumableId: item.id,
        requestType: 'Stock In',
        quantity: parseInt(formData.quantity, 10),
        reason: formData.reason || null,
        course: formData.course || null,
        trainer: formData.trainer || null,
        purpose: formData.purpose,
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
      })

      success("✓ Request submitted successfully! Administrators will review your request shortly.")
      onClose()
      
      if (onRequestSubmitted) {
        onRequestSubmitted(response.data.request)
      }
    } catch (error) {
      showError(error.response?.data?.error || "Failed to submit request.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-title text-2xl font-bold text-[#800000]">
            Request Stock Modification
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <X size={24} />
          </button>
        </div>

        {/* Item Info */}
        {item && (
          <div className="mb-6 rounded-lg bg-slate-50 p-4">
            <p className="text-sm text-slate-600">Item</p>
            <p className="font-semibold text-slate-800">{item.itemName}</p>
            <p className="text-xs text-slate-500 mt-1">
              Current Stock: <span className="font-semibold text-[#800000]">{item.quantityMain} {item.unit}</span>
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Quantity */}
          <div>
            <label className="block text-sm font-semibold text-slate-700">
              Quantity Requested *
            </label>
            <input
              type="number"
              min="1"
              value={formData.quantity}
              onChange={(e) => handleChange("quantity", e.target.value)}
              placeholder="Enter quantity needed"
              className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-[var(--brand-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20"
              required
            />
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-semibold text-slate-700">
              Reason / Notes
            </label>
            <textarea
              value={formData.reason}
              onChange={(e) => handleChange("reason", e.target.value)}
              placeholder="Why do you need this stock modification?"
              rows="3"
              className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-[var(--brand-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20"
            />
          </div>

          {/* Course */}
          <div>
            <label className="block text-sm font-semibold text-slate-700">
              Course
            </label>
            <input
              type="text"
              value={formData.course}
              onChange={(e) => handleChange("course", e.target.value)}
              placeholder="Enter course name"
              className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-[var(--brand-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20"
            />
          </div>

          {/* Trainer */}
          <div>
            <label className="block text-sm font-semibold text-slate-700">
              Trainer
            </label>
            <select
              value={formData.trainer}
              onChange={(e) => handleChange("trainer", e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-[var(--brand-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20"
            >
              <option value="">Select a trainer</option>
              {loadingTrainers ? (
                <option disabled>Loading trainers...</option>
              ) : (
                trainers.map((trainer) => (
                  <option key={trainer.id} value={trainer.name}>
                    {trainer.name}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Purpose */}
          <div>
            <label className="block text-sm font-semibold text-slate-700">
              Purpose
            </label>
            <select
              value={formData.purpose}
              onChange={(e) => handleChange("purpose", e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-[var(--brand-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20"
            >
              <option value="Training">Training</option>
              <option value="Assessment">Assessment</option>
              <option value="Replenishment">Replenishment</option>
            </select>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-slate-700">
                Start Date
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => handleChange("startDate", e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-[var(--brand-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700">
                End Date
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => handleChange("endDate", e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-[var(--brand-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-lg bg-[#800000] px-4 py-2 font-semibold text-white hover:bg-[#660000] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default RequestStockModal
