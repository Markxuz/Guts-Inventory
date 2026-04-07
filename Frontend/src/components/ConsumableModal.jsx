import { useEffect, useMemo, useState } from "react"
import { X } from "lucide-react"
import Button from "./Button"

const emptyForm = {
  itemName: "",
  category: "EIM",
  quantity: 0,
  unit: "pcs",
  reorderLevel: 10
}

const ConsumableModal = ({
  isOpen,
  title,
  submitLabel,
  initialValues,
  onClose,
  onSubmit
}) => {
  const seed = useMemo(() => ({ ...emptyForm, ...initialValues }), [initialValues])
  const [formData, setFormData] = useState(seed)

  useEffect(() => {
    setFormData(seed)
  }, [seed])

  if (!isOpen) {
    return null
  }

  const handleChange = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    await onSubmit({
      itemName: formData.itemName.trim(),
      category: formData.category,
      quantity: Number(formData.quantity),
      unit: formData.unit.trim(),
      reorderLevel: Number(formData.reorderLevel)
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-xl rounded-2xl border border-[var(--brand-secondary-soft)] bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-[var(--brand-secondary-soft)] px-5 py-4">
          <h3 className="font-title text-lg font-bold text-[var(--brand-primary)]">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-500 transition hover:bg-slate-100"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1 sm:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Item Name</span>
              <input
                required
                value={formData.itemName}
                onChange={(event) => handleChange("itemName", event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-[var(--brand-primary)]"
                placeholder="Enter item name"
              />
            </label>

            <label className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Category/Track</span>
              <select
                required
                value={formData.category}
                onChange={(event) => handleChange("category", event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-[var(--brand-primary)]"
              >
                <option value="EIM">EIM</option>
                <option value="SMAW">SMAW</option>
                <option value="CSS">CSS</option>
              </select>
            </label>

            <label className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Unit</span>
              <input
                required
                value={formData.unit}
                onChange={(event) => handleChange("unit", event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-[var(--brand-primary)]"
                placeholder="pcs, kg, box"
              />
            </label>

            <label className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Quantity</span>
              <input
                required
                min="0"
                type="number"
                value={formData.quantity}
                onChange={(event) => handleChange("quantity", event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-[var(--brand-primary)]"
              />
            </label>

            <label className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Low Stock Threshold
              </span>
              <input
                required
                min="0"
                type="number"
                value={formData.reorderLevel}
                onChange={(event) => handleChange("reorderLevel", event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-[var(--brand-primary)]"
              />
              <p className="text-xs text-slate-500">
                Item is marked Low Stock when quantity is less than or equal to this value.
              </p>
            </label>
          </div>

          <div className="flex justify-end gap-2 border-t border-[var(--brand-secondary-soft)] pt-4">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{submitLabel}</Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ConsumableModal
