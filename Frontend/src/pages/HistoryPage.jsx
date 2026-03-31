import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ChevronLeft, Printer } from "lucide-react"
import { getInventoryByTrack } from "../api/inventoryApi"
import { getHistoryLogs } from "../api/historyApi"
import { useInventoryLocation } from "../context/InventoryLocationContext"
import { normalizeItems } from "../utils/inventory"

const ROWS_PER_PAGE = 20

const HistoryPage = () => {
  const { track, itemId } = useParams()
  const navigate = useNavigate()
  const { selectedInventory } = useInventoryLocation()
  const [item, setItem] = useState(null)
  const [allHistory, setAllHistory] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        // Fetch item details
        const inventory = await getInventoryByTrack(track, selectedInventory)
        const items = normalizeItems(inventory)
        const selectedItem = items.find(i => i.id === parseInt(itemId))
        setItem(selectedItem)

        // Fetch history
        const logs = await getHistoryLogs({ itemId: parseInt(itemId) })
        const filtered = (logs || [])
          .filter(h => h.location === selectedInventory)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        setAllHistory(filtered)
        setCurrentPage(1)
      } catch (error) {
        console.error("Failed to load history:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [track, itemId, selectedInventory])

  // Pagination logic
  const totalPages = Math.ceil(allHistory.length / ROWS_PER_PAGE)
  const startIndex = (currentPage - 1) * ROWS_PER_PAGE
  const endIndex = startIndex + ROWS_PER_PAGE
  const currentRecords = allHistory.slice(startIndex, endIndex)

  // Print functionality
  const handlePrint = () => {
    const printWindow = window.open("", "_blank")
    const tableHTML = document.getElementById("history-table").outerHTML
    
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>History Report - ${item?.itemName}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            background-color: #f9fafb;
          }
          .header {
            margin-bottom: 30px;
            text-align: center;
          }
          .header h1 {
            color: #800000;
            margin: 0 0 10px 0;
            font-size: 24px;
          }
          .header p {
            color: #666;
            margin: 5px 0;
            font-size: 14px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            background-color: white;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          thead {
            background-color: #f8eef0;
            border-bottom: 2px solid #800000;
          }
          th {
            padding: 12px;
            text-align: left;
            font-weight: bold;
            color: #800000;
            font-size: 12px;
            text-transform: uppercase;
          }
          td {
            padding: 10px 12px;
            border-bottom: 1px solid #e5e7eb;
            font-size: 13px;
          }
          tbody tr:hover {
            background-color: #f3f4f6;
          }
          .text-center {
            text-align: center;
          }
          .text-right {
            text-align: right;
          }
          .badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 9999px;
            font-size: 11px;
            font-weight: bold;
          }
          .badge-in {
            background-color: #d1fae5;
            color: #065f46;
          }
          .badge-out {
            background-color: #fee2e2;
            color: #991b1b;
          }
          .text-emerald {
            color: #059669;
          }
          .text-red {
            color: #dc2626;
          }
          @media print {
            body {
              margin: 0;
              background-color: white;
            }
            table {
              box-shadow: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>GUTS TESDA INVENTORY - History Report</h1>
          <p><strong>Item:</strong> ${item?.itemName || "Unknown"}</p>
          <p><strong>Category:</strong> ${item?.category || "—"} | <strong>Location:</strong> ${selectedInventory.toUpperCase()}</p>
          <p><strong>Generated:</strong> ${new Date().toLocaleDateString("en-PH")} ${new Date().toLocaleTimeString("en-PH")}</p>
        </div>
        ${tableHTML}
        <div style="margin-top: 30px; text-align: center; color: #999; font-size: 12px;">
          <p>This is an official inventory history report. Total records: ${allHistory.length}</p>
        </div>
      </body>
      </html>
    `
    
    printWindow.document.write(htmlContent)
    printWindow.document.close()
    
    // Print after content loads
    setTimeout(() => {
      printWindow.print()
    }, 250)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#800000]"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header and Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-[#800000] hover:text-[#660000] font-semibold transition"
        >
          <ChevronLeft size={20} />
          Back
        </button>
        <h1 className="text-3xl font-bold text-[#800000]">Full History Report</h1>
        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 bg-[#800000] text-white px-6 py-2 rounded-lg hover:bg-[#660000] transition font-semibold"
        >
          <Printer size={20} />
          Print Report
        </button>
      </div>

      {/* Item Info Card */}
      {item && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-2xl font-bold text-[#800000] mb-4">{item.itemName}</h2>
          <div className="grid gap-4 sm:grid-cols-4">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">Category</p>
              <p className="mt-1 font-semibold text-slate-800">{item.category}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">Unit</p>
              <p className="mt-1 font-semibold text-slate-800">{item.unit}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">Current Stock</p>
              <p className="mt-1 font-semibold text-[#800000] text-lg">{item.quantity}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">Total Records</p>
              <p className="mt-1 font-semibold text-[#800000] text-lg">{allHistory.length}</p>
            </div>
          </div>
        </div>
      )}

      {/* History Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {currentRecords.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-slate-500">
              <p>No history records available</p>
            </div>
          ) : (
            <table id="history-table" className="w-full text-sm">
              <thead className="bg-[#f8eef0]">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-[#800000]">Inventory Date</th>
                  <th className="px-4 py-3 text-center font-semibold text-[#800000]">Beginning Inv.</th>
                  <th className="px-4 py-3 text-center font-semibold text-[#800000]">Purchase</th>
                  <th className="px-4 py-3 text-center font-semibold text-[#800000]">Stock-on-hand</th>
                  <th className="px-4 py-3 text-center font-semibold text-[#800000]">Consumption</th>
                  <th className="px-4 py-3 text-center font-semibold text-[#800000]">Ending Inv.</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#800000]">Performed By</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#800000]">Course</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#800000]">Trainer</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#800000]">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                      {new Date(record.createdAt).toLocaleDateString("en-PH")}
                    </td>
                    <td className="px-4 py-3 text-center font-semibold text-slate-600">
                      {record.beginningInventory || "—"}
                    </td>
                    <td className="px-4 py-3 text-center font-semibold text-emerald-600">
                      {record.quantityChanged > 0 ? record.quantityChanged : "—"}
                    </td>
                    <td className="px-4 py-3 text-center font-semibold text-slate-600">
                      {record.quantityChanged > 0 
                        ? (record.beginningInventory + record.quantityChanged) || "—"
                        : record.beginningInventory || "—"
                      }
                    </td>
                    <td className="px-4 py-3 text-center font-semibold text-red-600">
                      {record.quantityChanged < 0 ? Math.abs(record.quantityChanged) : "—"}
                    </td>
                    <td className="px-4 py-3 text-center font-semibold text-slate-600">
                      {record.endingInventory || "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{record.performedBy || "System"}</td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{record.course || "—"}</td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{record.trainer || "—"}</td>
                    <td className="px-4 py-3 text-slate-600">{record.description || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-6">
          <div className="text-slate-600">
            Showing {startIndex + 1} to {Math.min(endIndex, allHistory.length)} of {allHistory.length} records
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition"
            >
              ← Previous
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 rounded-lg font-semibold transition ${
                    currentPage === page
                      ? "bg-[#800000] text-white"
                      : "border border-slate-300 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default HistoryPage
