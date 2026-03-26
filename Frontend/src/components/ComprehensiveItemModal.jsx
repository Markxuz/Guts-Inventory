import { useState, useEffect } from "react"
import { X, TrendingUp, TrendingDown, Package, Printer } from "lucide-react"
import Button from "./Button"

const ComprehensiveItemModal = ({
  isOpen,
  item,
  onClose,
  itemHistory,
  onAddStock,
  onDeductStock,
}) => {
  const [activeTab, setActiveTab] = useState("purchase")
  const [activeAction, setActiveAction] = useState(null)
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
      setActiveTab("purchase")
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
  }, [isOpen])

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

  const handlePrintReport = () => {
    const historyData = activeTab === "purchase" ? purchaseHistory : consumptionHistory
    const reportTitle = activeTab === "purchase" ? "Purchase History Report" : "Consumption History Report"
    
    const printWindow = window.open("", "", "width=900,height=800")
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${reportTitle}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            color: #333;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #800000;
            padding-bottom: 15px;
          }
          .header h1 {
            margin: 0;
            color: #800000;
            font-size: 24px;
          }
          .header p {
            margin: 5px 0;
            color: #666;
            font-size: 14px;
          }
          .item-info {
            margin-bottom: 20px;
            padding: 15px;
            background-color: #f8eef0;
            border-left: 4px solid #800000;
          }
          .item-info h3 {
            margin: 0 0 10px 0;
            color: #800000;
          }
          .info-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
            font-size: 13px;
          }
          .info-item {
            display: flex;
            flex-direction: column;
          }
          .info-label {
            font-weight: bold;
            color: #666;
            font-size: 11px;
            text-transform: uppercase;
            margin-bottom: 5px;
          }
          .info-value {
            font-size: 14px;
            color: #333;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            font-size: 12px;
          }
          th {
            background-color: #800000;
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: bold;
            border: 1px solid #600000;
          }
          td {
            padding: 10px 12px;
            border: 1px solid #ddd;
          }
          tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          tr:hover {
            background-color: #f0f0f0;
          }
          .text-center {
            text-align: center;
          }
          .text-right {
            text-align: right;
          }
          .positive {
            color: #059669;
            font-weight: bold;
          }
          .negative {
            color: #dc2626;
            font-weight: bold;
          }
          .footer {
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #ddd;
            text-align: center;
            font-size: 11px;
            color: #999;
          }
          .no-data {
            text-align: center;
            padding: 30px;
            color: #999;
            font-style: italic;
          }
          @media print {
            body {
              margin: 0;
            }
            .header {
              page-break-after: avoid;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${reportTitle}</h1>
          <p>The Vail Academy - TESDA Training Center</p>
          <p>Report Generated: ${new Date().toLocaleDateString("en-PH")} ${new Date().toLocaleTimeString("en-PH")}</p>
        </div>

        <div class="item-info">
          <h3>Item Details</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Item Name</span>
              <span class="info-value">${item.itemName}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Category</span>
              <span class="info-value">${item.category}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Current Stock</span>
              <span class="info-value">${item.quantity} ${item.unit}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Reorder Level</span>
              <span class="info-value">${item.reorderLevel}</span>
            </div>
          </div>
        </div>

        ${historyData.length === 0 ? `
          <div class="no-data">
            No ${activeTab === "purchase" ? "purchase" : "consumption"} history records available.
          </div>
        ` : `
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Beginning Inventory</th>
                <th>${activeTab === "purchase" ? "Purchased" : "Consumption"}</th>
                <th>Ending Inventory</th>
                <th>Course</th>
                <th>Trainer</th>
                <th>Performer</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              ${historyData.map(record => `
                <tr>
                  <td class="text-center">${new Date(record.createdAt).toLocaleDateString("en-PH")}</td>
                  <td class="text-center">${record.beginningInventory ?? "—"}</td>
                  <td class="text-center ${record.quantityChanged > 0 ? "positive" : "negative"}">
                    ${Math.abs(record.quantityChanged)}
                  </td>
                  <td class="text-center">${record.endingInventory ?? "—"}</td>
                  <td>${record.course || "—"}</td>
                  <td>${record.trainer || "—"}</td>
                  <td>${record.performedBy}</td>
                  <td>${record.description || record.notes || "—"}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        `}

        <div class="footer">
          <p>This is an automatically generated report. Please verify the information for accuracy.</p>
        </div>
      </body>
      </html>
    `

    printWindow.document.write(htmlContent)
    printWindow.document.close()
    
    setTimeout(() => {
      printWindow.print()
    }, 250)
  }

  // Filter history by action type
  const purchaseHistory = itemHistory?.filter(
    (h) => h.actionType === "Stock In"
  ) || []
  const consumptionHistory = itemHistory?.filter(
    (h) => h.actionType === "Stock Out"
  ) || []

  const currentTab =
    activeTab === "purchase" ? purchaseHistory : consumptionHistory

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
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Total Records
                  </p>
                  <p className="mt-2 font-title text-2xl font-bold text-slate-800">
                    {itemHistory?.length || 0}
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

            {/* Tabs */}
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50">
                <div className="flex flex-1">
                  <button
                    type="button"
                    onClick={() => setActiveTab("purchase")}
                    className={`flex-1 px-6 py-3 font-semibold transition ${
                      activeTab === "purchase"
                        ? "border-b-2 border-[var(--brand-primary)] text-[var(--brand-primary)] bg-white"
                        : "text-slate-600 hover:text-slate-800"
                    }`}
                  >
                    Purchase History ({purchaseHistory.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("consumption")}
                    className={`flex-1 px-6 py-3 font-semibold transition ${
                      activeTab === "consumption"
                        ? "border-b-2 border-[var(--brand-primary)] text-[var(--brand-primary)] bg-white"
                        : "text-slate-600 hover:text-slate-800"
                    }`}
                  >
                    Consumption History ({consumptionHistory.length})
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handlePrintReport}
                  disabled={currentTab.length === 0}
                  className={`px-4 py-3 mr-2 flex items-center gap-2 rounded-lg transition flex-shrink-0 ${
                    currentTab.length === 0
                      ? "text-slate-400 cursor-not-allowed"
                      : "text-[var(--brand-primary)] hover:bg-slate-100"
                  }`}
                  title="Print report"
                >
                  <Printer className="h-5 w-5" />
                  <span className="text-sm font-semibold">Print</span>
                </button>
              </div>

              {/* History Table */}
              <div className="overflow-x-auto">
                {currentTab.length === 0 ? (
                  <div className="flex items-center justify-center py-8 text-slate-500">
                    <Package className="mr-2 h-5 w-5" />
                    <p>No history records yet</p>
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="bg-slate-100">
                      <tr className="border-b border-slate-200">
                        <th className="px-4 py-3 text-left font-semibold text-slate-700">
                          Date
                        </th>
                        <th className="px-4 py-3 text-left font-semibold text-slate-700">
                          Beginning
                        </th>
                        <th className="px-4 py-3 text-center font-semibold text-slate-700">
                          {activeTab === "purchase" ? "Purchased" : "Consumption"}
                        </th>
                        <th className="px-4 py-3 text-center font-semibold text-slate-700">
                          Ending
                        </th>
                        <th className="px-4 py-3 text-left font-semibold text-slate-700">
                          Course
                        </th>
                        <th className="px-4 py-3 text-left font-semibold text-slate-700">
                          Trainer
                        </th>
                        <th className="px-4 py-3 text-left font-semibold text-slate-700">
                          Performer
                        </th>
                        <th className="px-4 py-3 text-left font-semibold text-slate-700">
                          Notes
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentTab.map((record, idx) => (
                        <tr
                          key={record.id}
                          className={`border-b border-slate-200 ${
                            idx % 2 === 0 ? "bg-white" : "bg-slate-50"
                          } hover:bg-blue-50 transition`}
                        >
                          <td className="px-4 py-3 text-slate-600">
                            {new Date(record.createdAt).toLocaleDateString(
                              "en-PH"
                            )}
                          </td>
                          <td className="px-4 py-3 font-semibold text-slate-800">
                            {record.beginningInventory ?? "—"}
                          </td>
                          <td className={`px-4 py-3 text-center font-semibold ${
                            record.quantityChanged > 0
                              ? "text-emerald-600"
                              : "text-red-600"
                          }`}>
                            {Math.abs(record.quantityChanged)}
                          </td>
                          <td className="px-4 py-3 text-center font-semibold text-slate-800">
                            {record.endingInventory ?? "—"}
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {record.course || "—"}
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {record.trainer || "—"}
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {record.performedBy}
                          </td>
                          <td className="px-4 py-3 text-slate-600 max-w-xs truncate">
                            {record.description || record.notes || "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
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
