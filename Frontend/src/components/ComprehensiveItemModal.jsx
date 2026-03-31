import { useState, useEffect } from "react"
import { X, TrendingUp, TrendingDown } from "lucide-react"
import Button from "./Button"

const ComprehensiveItemModal = ({
  isOpen,
  item,
  onClose,
  onAddStock,
  onDeductStock,
  action, // "add" or "deduct"
}) => {
  const [activeAction, setActiveAction] = useState(action || null)
  const [formData, setFormData] = useState({
    quantity: "",
    performedBy: "",
    trainer: "",
    course: "",
    notes: "",
    purpose: "Training",
  })

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveAction(action || null)
      setFormData({
        quantity: "",
        performedBy: "",
        trainer: "",
        course: "",
        notes: "",
        purpose: "Training",
      })
    }
  }, [isOpen, action])

  if (!isOpen || !item) return null

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleReset = () => {
    setActiveAction(null)
    setFormData({
      quantity: "",
      performedBy: "",
      trainer: "",
      course: "",
      notes: "",
      purpose: "Training",
    })
  }

  const handleSubmit = (type) => {
    if (!formData.quantity || !formData.performedBy) {
      alert("Please fill in Quantity and Performer fields")
      return
    }

    if (type === "add") {
      onAddStock({
        ...formData,
        quantity: parseInt(formData.quantity, 10),
      })
    } else {
      onDeductStock({
        ...formData,
        quantity: parseInt(formData.quantity, 10),
      })
    }
    handleReset()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-5xl max-h-[90vh] rounded-2xl border border-[var(--brand-secondary-soft)] bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--brand-secondary-soft)] px-6 py-4">
          <h2 className="font-title text-2xl font-bold text-[var(--brand-primary)]">
            {item.itemName}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Item Info Card */}
            <div className="rounded-xl bg-gradient-to-r from-[#f8eef0] to-slate-50 border border-[var(--brand-secondary-soft)] p-5">
              <div className="grid gap-4 sm:grid-cols-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Current Stock
                  </p>
                  <p className="mt-2 font-title text-2xl font-bold text-slate-800">
                    {item.quantity}
                  </p>
                  <p className="text-xs text-slate-600">{item.unit}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </p>
                  <div className="mt-2">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        item.status === "In Stock"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-[#fbe9ed] text-[#800000]"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Reorder Level
                  </p>
                  <p className="mt-2 font-title text-xl font-bold text-slate-800">
                    {item.reorderLevel}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Category
                  </p>
                  <p className="mt-2 inline-block rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700">
                    {item.category}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Section (When not showing form) */}
            {!activeAction && (
              <div className="rounded-xl border border-slate-200 p-5">
                <h3 className="mb-4 font-title text-lg font-bold text-slate-800">
                  Stock Management
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setActiveAction("add")}
                    className="group flex items-center justify-center gap-3 rounded-xl border-2 border-emerald-200 bg-emerald-50 px-5 py-4 transition hover:border-emerald-400 hover:bg-emerald-100"
                  >
                    <TrendingUp className="h-5 w-5 text-emerald-600 transition group-hover:scale-110" />
                    <div className="text-left">
                      <p className="font-semibold text-emerald-700">Add Stock</p>
                      <p className="text-xs text-emerald-600">Increase quantity (Restock)</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveAction("deduct")}
                    className="group flex items-center justify-center gap-3 rounded-xl border-2 border-red-200 bg-red-50 px-5 py-4 transition hover:border-red-400 hover:bg-red-100"
                  >
                    <TrendingDown className="h-5 w-5 text-red-600 transition group-hover:scale-110" />
                    <div className="text-left">
                      <p className="font-semibold text-red-700">Deduct Stock</p>
                      <p className="text-xs text-red-600">Decrease quantity (Usage)</p>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Form Section */}
            {activeAction && (
              <div className={`rounded-xl border-2 p-5 ${
                activeAction === "add"
                  ? "border-emerald-200 bg-emerald-50"
                  : "border-red-200 bg-red-50"
              }`}>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-title text-lg font-bold text-slate-800">
                    {activeAction === "add" ? "Add Stock" : "Deduct Stock"}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveAction(null)}
                    className="text-slate-500 hover:text-slate-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleSubmit(activeAction)
                  }}
                  className="space-y-4"
                >
                  {/* Quantity */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.quantity}
                      onChange={(e) => handleChange("quantity", e.target.value)}
                      placeholder="Enter quantity"
                      className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-[var(--brand-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20"
                      required
                    />
                  </div>

                  {/* Performer */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700">
                      Performed By *
                    </label>
                    <input
                      type="text"
                      value={formData.performedBy}
                      onChange={(e) =>
                        handleChange("performedBy", e.target.value)
                      }
                      placeholder="Enter name"
                      className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-[var(--brand-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20"
                      required
                    />
                  </div>

                  {/* Purpose (For) - Training/Assessment for Deduct, Replenishment for Add */}
                  {activeAction === "add" && (
                    <div>
                      <label className="block text-sm font-semibold text-slate-700">
                        Purpose
                      </label>
                      <select
                        value={formData.purpose}
                        onChange={(e) => handleChange("purpose", e.target.value)}
                        className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-[var(--brand-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20"
                      >
                        <option value="Replenishment">Replenishment</option>
                      </select>
                    </div>
                  )}

                  {activeAction === "deduct" && (
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
                      </select>
                    </div>
                  )}

                  {/* Trainer */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700">
                      Trainer
                    </label>
                    <input
                      type="text"
                      value={formData.trainer}
                      onChange={(e) => handleChange("trainer", e.target.value)}
                      placeholder="Enter trainer name"
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

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700">
                      Notes
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => handleChange("notes", e.target.value)}
                      placeholder="Enter any additional notes"
                      rows="3"
                      className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-[var(--brand-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-2">
                    <Button
                      type="submit"
                      className={`flex-1 ${
                        activeAction === "add"
                          ? "bg-emerald-600 hover:bg-emerald-700"
                          : "bg-red-600 hover:bg-red-700"
                      }`}
                    >
                      {activeAction === "add" ? "Add Stock" : "Deduct Stock"}
                    </Button>
                    <Button
                      type="button"
                      onClick={handleReset}
                      variant="secondary"
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
          <Button onClick={onClose} variant="secondary">
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ComprehensiveItemModal
