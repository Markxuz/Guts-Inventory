import { useEffect, useRef, useState } from "react"
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
  const [purposeFilter, setPurposeFilter] = useState('All')
  const printRef = useRef(null)

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        // Fetch item details
        const inventory = await getInventoryByTrack(track, selectedInventory)
        const items = normalizeItems(inventory)
        const selectedItem = items.find(i => String(i.id) === String(itemId))
        setItem(selectedItem)

        // Fetch history
        const logs = await getHistoryLogs({ itemId })
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

  // Pagination logic with purpose filtering
  const filteredHistory = purposeFilter === 'All' 
    ? allHistory 
    : allHistory.filter(h => h.purpose === purposeFilter)
  
  const totalPages = Math.ceil(filteredHistory.length / ROWS_PER_PAGE)
  const startIndex = (currentPage - 1) * ROWS_PER_PAGE
  const endIndex = startIndex + ROWS_PER_PAGE
  const currentRecords = filteredHistory.slice(startIndex, endIndex)
  
  // Reset to page 1 when filter changes
  const handlePurposeChange = (newPurpose) => {
    setPurposeFilter(newPurpose)
    setCurrentPage(1)
  }

  // Print functionality - uses current tab without opening new window
  const handlePrint = () => {
    if (printRef.current) {
      // Create a temporary iframe for a cleaner print experience
      const printFrame = document.createElement('iframe');
      printFrame.style.display = 'none';
      document.body.appendChild(printFrame);
      
      const printWindow = printFrame.contentWindow;
      const printContent = printRef.current.innerHTML;
      
      printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>History Report - ${item?.itemName}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
              padding: 20px;
              background-color: white;
            }
            .print-header {
              margin-bottom: 30px;
              text-align: center;
              border-bottom: 3px solid #800000;
              padding-bottom: 15px;
            }
            .print-header h1 {
              color: #800000;
              margin-bottom: 10px;
              font-size: 22px;
            }
            .print-header p {
              color: #666;
              margin: 5px 0;
              font-size: 13px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 15px;
              background-color: white;
            }
            thead {
              background-color: #f8eef0;
              border-bottom: 2px solid #800000;
            }
            th {
              padding: 10px;
              text-align: left;
              font-weight: 600;
              color: #800000;
              font-size: 12px;
              text-transform: uppercase;
              white-space: nowrap;
              border: 1px solid #ddd;
            }
            td {
              padding: 9px 10px;
              border-bottom: 1px solid #e5e7eb;
              font-size: 12px;
              border: 1px solid #ddd;
            }
            tbody tr:nth-child(even) {
              background-color: #f9fafb;
            }
            .text-center {
              text-align: center;
            }
            .text-right {
              text-align: right;
            }
            .print-footer {
              margin-top: 30px;
              text-align: center;
              color: #999;
              font-size: 11px;
              border-top: 1px solid #ddd;
              padding-top: 15px;
            }
            @media print {
              body {
                padding: 0;
              }
              table {
                page-break-inside: avoid;
              }
              thead {
                display: table-header-group;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-header">
            <h1>GUTS TESDA INVENTORY</h1>
            <h2 style="color: #666; font-size: 16px; font-weight: 500; margin-bottom: 10px;">History Report</h2>
            <p><strong>Item:</strong> ${item?.itemName || "Unknown"}</p>
            <p><strong>Category:</strong> ${item?.category || "—"} | <strong>Unit:</strong> ${item?.unit || "—"} | <strong>Location:</strong> ${selectedInventory === 'main' ? 'Main Inventory' : 'Training Inventory'}</p>
            <p><strong>Filter:</strong> ${purposeFilter !== 'All' ? 'Purpose = ' + purposeFilter : 'None (All Records)'}</p>
            <p><strong>Generated:</strong> ${new Date().toLocaleDateString('en-PH')} at ${new Date().toLocaleTimeString('en-PH')}</p>
          </div>
          ${printContent}
          <div class="print-footer">
            <p>This is an official inventory history report. Total records shown: ${filteredHistory.length}</p>
            <p>End of Report</p>
          </div>
        </body>
        </html>
      `);
      printWindow.document.close();
      
      // Trigger print dialog after content loads
      setTimeout(() => {
        printWindow.print();
        // Remove iframe after printing
        setTimeout(() => {
          document.body.removeChild(printFrame);
        }, 500);
      }, 250);
    }
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
              <p className="mt-1 font-semibold text-[#800000] text-lg">{filteredHistory.length}</p>
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
                  <th className="px-4 py-3 text-center font-semibold text-[#800000]">Unit</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#800000]">Performed By</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#800000]">Course</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#800000] relative group">
                    <div className="flex items-center gap-2">
                      Purpose
                      <div className="absolute top-full right-0 mt-1 hidden group-hover:block bg-white border border-slate-300 rounded-lg shadow-lg z-50">
                        <button
                          onClick={() => handlePurposeChange('All')}
                          className={`block w-full text-left px-4 py-2 hover:bg-slate-100 transition whitespace-nowrap ${
                            purposeFilter === 'All' ? 'bg-[#f8eef0] text-[#800000] font-semibold' : 'text-slate-700'
                          }`}
                        >
                          All
                        </button>
                        <button
                          onClick={() => handlePurposeChange('Training')}
                          className={`block w-full text-left px-4 py-2 hover:bg-slate-100 transition whitespace-nowrap ${
                            purposeFilter === 'Training' ? 'bg-[#f8eef0] text-[#800000] font-semibold' : 'text-slate-700'
                          }`}
                        >
                          Training
                        </button>
                        <button
                          onClick={() => handlePurposeChange('Assessment')}
                          className={`block w-full text-left px-4 py-2 hover:bg-slate-100 transition whitespace-nowrap ${
                            purposeFilter === 'Assessment' ? 'bg-[#f8eef0] text-[#800000] font-semibold' : 'text-slate-700'
                          }`}
                        >
                          Assessment
                        </button>
                      </div>
                    </div>
                  </th>
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
                    <td className="px-4 py-3 text-center font-semibold text-slate-600">
                      {record.unit || "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{record.performedBy || "System"}</td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{record.course || "—"}</td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{record.purpose || "—"}</td>
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
            Showing {startIndex + 1} to {Math.min(endIndex, filteredHistory.length)} of {filteredHistory.length} records {purposeFilter !== 'All' && `(filtered by ${purposeFilter})`}
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
              Next 
            </button>
          </div>
        </div>
      )}

      {/* Hidden Printable Content (All Filtered Records) */}
      <div ref={printRef} style={{ display: 'none' }}>
        <table className="w-full text-sm">
          <thead className="bg-[#f8eef0]">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-[#800000]">Inventory Date</th>
              <th className="px-4 py-3 text-center font-semibold text-[#800000]">Beginning Inv.</th>
              <th className="px-4 py-3 text-center font-semibold text-[#800000]">Purchase</th>
              <th className="px-4 py-3 text-center font-semibold text-[#800000]">Stock-on-hand</th>
              <th className="px-4 py-3 text-center font-semibold text-[#800000]">Consumption</th>
              <th className="px-4 py-3 text-center font-semibold text-[#800000]">Ending Inv.</th>
              <th className="px-4 py-3 text-center font-semibold text-[#800000]">Unit</th>
              <th className="px-4 py-3 text-left font-semibold text-[#800000]">Performed By</th>
              <th className="px-4 py-3 text-left font-semibold text-[#800000]">Course</th>
              <th className="px-4 py-3 text-left font-semibold text-[#800000]">Purpose</th>
              <th className="px-4 py-3 text-left font-semibold text-[#800000]">Trainer</th>
              <th className="px-4 py-3 text-left font-semibold text-[#800000]">Remarks</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredHistory.map((record) => (
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
                <td className="px-4 py-3 text-center font-semibold text-slate-600">
                  {record.unit || "—"}
                </td>
                <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{record.performedBy || "System"}</td>
                <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{record.course || "—"}</td>
                <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{record.purpose || "—"}</td>
                <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{record.trainer || "—"}</td>
                <td className="px-4 py-3 text-slate-600">{record.description || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default HistoryPage
