import { useState } from "react"
import { X, Package, ShoppingCart, TrendingUp, TrendingDown } from "lucide-react"
import Button from "./Button"

const ItemDetailsModal = ({
  isOpen,
  item,
  onClose,
  onPurchaseHistory,
  onConsumptionHistory
}) => {
  const [activeAction, setActiveAction] = useState(null)
  const [formData, setFormData] = useState({
    quantity: 1,
    performedBy: "",
    destination: "",
    notes: ""
  })

  if (!isOpen || !item) return null

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleReset = () => {
    setActiveAction(null)
    setFormData({
      quantity: 1,
      performedBy: "",
      destination: "",
      notes: ""
    })
  }

  const handleSubmit = (type) => {
    if (type === "purchase") {
      onPurchaseHistory({
        ...formData,
        quantity: Number(formData.quantity)
      })
    } else {
      onConsumptionHistory({
        ...formData,
        quantity: Number(formData.quantity)
      })
    }
    handleReset()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-[var(--brand-secondary-soft)] bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--brand-secondary-soft)] px-6 py-5">
          <div>
            <h3 className="font-title text-xl font-bold text-[var(--brand-primary)]">{item.itemName}</h3>
            <p className="mt-1 text-sm text-slate-500">Manage stock and track inventory movements</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Item Details Card */}
          <div className="mb-6 rounded-xl bg-gradient-to-r from-[#f8eef0] to-slate-50 border border-[var(--brand-secondary-soft)] p-5">
            <div className="grid gap-4 sm:grid-cols-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Current Stock</p>
                <p className="mt-2 font-title text-2xl font-bold text-slate-800">{item.quantity}</p>
                <p className="text-xs text-slate-600 mt-1">{item.unit}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Status</p>
                <div className="mt-2">
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                    item.status === "In Stock" 
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-[#fbe9ed] text-[#800000]"
                  }`}>
                    {item.status}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Reorder Level</p>
                <p className="mt-2 font-title text-xl font-bold text-slate-800">{item.reorderLevel}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Category</p>
                <p className="mt-2 font-semibold text-slate-700 inline-block px-3 py-1 rounded-full bg-slate-100">
                  {item.category}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {!activeAction && (
            <div className="grid gap-3 sm:grid-cols-2 mb-6">
              <button
                type="button"
                onClick={() => setActiveAction("purchase")}
                className="group flex items-center justify-center gap-3 rounded-xl border-2 border-emerald-200 bg-emerald-50 px-5 py-4 transition hover:border-emerald-400 hover:bg-emerald-100"
              >
                <TrendingUp className="h-5 w-5 text-emerald-600 group-hover:scale-110 transition" />
                <div className="text-left">
                  <p className="font-semibold text-emerald-700">Add Stock</p>
                  <p className="text-xs text-emerald-600">Increase quantity (Restock)</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActiveAction("consumption")}
                className="group flex items-center justify-center gap-3 rounded-xl border-2 border-red-200 bg-red-50 px-5 py-4 transition hover:border-red-400 hover:bg-red-100"
              >
                <TrendingDown className="h-5 w-5 text-red-600 group-hover:scale-110 transition" />
                <div className="text-left">
                  <p className="font-semibold text-red-700">Deduct Stock</p>
                  <p className="text-xs text-red-600">Decrease quantity (Usage)</p>
                </div>
              </button>
            </div>
          )}

          {/* Form Section */}
          {activeAction && (
            <form onSubmit={(e) => {
              e.preventDefault()
              handleSubmit(activeAction)
            }} className="space-y-4 border-t border-slate-200 pt-6">
              <div className={`rounded-lg px-4 py-3 flex items-center gap-2 ${
                activeAction === "purchase"
                  ? "bg-emerald-50 border border-emerald-200"
                  : "bg-red-50 border border-red-200"
              }`}>
                {activeAction === "purchase" ? (
                  <>
                    <ShoppingCart className="h-4 w-4 text-emerald-600" />
                    <p className="text-sm font-medium text-emerald-700">Adding Stock to Inventory</p>
                  </>
                ) : (
                  <>
                    <Package className="h-4 w-4 text-red-600" />
                    <p className="text-sm font-medium text-red-700">Deducting Stock from Inventory</p>
                  </>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Quantity to {activeAction === "purchase" ? "Add" : "Deduct"}</span>
                  <input
                    required
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => handleChange("quantity", e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-[var(--brand-primary)]"
                    placeholder="Enter quantity"
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Performed By</span>
                  <input
                    required
                    type="text"
                    value={formData.performedBy}
                    onChange={(e) => handleChange("performedBy", e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-[var(--brand-primary)]"
                    placeholder="Your name"
                  />
                </label>

                {activeAction === "consumption" && (
                  <label className="space-y-1">
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Usage/Destination</span>
                    <input
                      required
                      type="text"
                      value={formData.destination}
                      onChange={(e) => handleChange("destination", e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-[var(--brand-primary)]"
                      placeholder="Where/how used"
                    />
                  </label>
                )}

                <label className="space-y-1 sm:col-span-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Notes (Optional)</span>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleChange("notes", e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-[var(--brand-primary)]"
                    placeholder="Optional notes..."
                    rows="2"
                  />
                </label>
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setActiveAction(null)}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  className={activeAction === "purchase" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"}
                >
                  {activeAction === "purchase" ? "Confirm Add Stock" : "Confirm Deduct Stock"}
                </Button>
              </div>
            </form>
          )}

          {/* Close Button */}
          {!activeAction && (
            <div className="flex justify-end border-t border-slate-200 pt-4">
              <Button variant="secondary" onClick={onClose}>
                Close
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ItemDetailsModal
