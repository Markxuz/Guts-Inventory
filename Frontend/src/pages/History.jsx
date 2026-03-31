import { useEffect, useMemo, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Button from "../components/Button"
import { useSearch } from "../context/SearchContext"
import { getHistoryLogs } from "../api/historyApi"

const ITEMS_PER_PAGE = 10

const ACTION_TYPES = {
  'Check In': { color: 'bg-green-100', textColor: 'text-green-700', badge: 'bg-green-500' },
  'Check Out': { color: 'bg-blue-100', textColor: 'text-blue-700', badge: 'bg-blue-500' },
  'Adjustment': { color: 'bg-yellow-100', textColor: 'text-yellow-700', badge: 'bg-yellow-500' },
  'Checkout': { color: 'bg-purple-100', textColor: 'text-purple-700', badge: 'bg-purple-500' },
  'Stock In': { color: 'bg-green-100', textColor: 'text-green-700', badge: 'bg-green-500' },
  'Stock Out': { color: 'bg-red-100', textColor: 'text-red-700', badge: 'bg-red-500' },
  'Delete': { color: 'bg-red-100', textColor: 'text-red-700', badge: 'bg-red-500' },
  'Archive': { color: 'bg-gray-100', textColor: 'text-gray-700', badge: 'bg-gray-500' },
}

const getActionColor = (actionType) => {
  return ACTION_TYPES[actionType] || { color: 'bg-slate-100', textColor: 'text-slate-700', badge: 'bg-slate-500' }
}

const History = () => {
  const [logs, setLogs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedAction, setSelectedAction] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const { searchQuery } = useSearch()

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)

      try {
        const data = await getHistoryLogs()
        setLogs(data)
      } catch {
        setLogs([])
      }

      setIsLoading(false)
    }

    load()
  }, [])

  const uniqueActions = useMemo(
    () => [...new Set(logs.map((log) => log.actionType))],
    [logs]
  )

  const filteredLogs = useMemo(
    () =>
      logs.filter((log) => {
        const matchesSearch = log.itemName.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesAction = !selectedAction || log.actionType === selectedAction
        const matchesDate = !selectedDate || new Date(log.createdAt).toLocaleDateString('en-CA') === selectedDate
        return matchesSearch && matchesAction && matchesDate
      }),
    [logs, searchQuery, selectedAction, selectedDate]
  )

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedAction, selectedDate])

  // Pagination calculations
  const totalPages = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedLogs = filteredLogs.slice(startIndex, endIndex)

  return (
    <section className="space-y-6">
      <div>
        <h2 className="font-title text-3xl font-bold text-[var(--brand-primary)]">Activity Logs</h2>
        <p className="mt-1 text-sm text-slate-600">Complete system activity history including all item movements, updates, and actions.</p>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-4">
        {/* Date Filter */}
        <div>
          <label className="text-sm font-semibold text-slate-700 block mb-2">Filter by Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
          />
          {selectedDate && (
            <button
              onClick={() => setSelectedDate('')}
              className="ml-2 text-xs text-red-600 hover:text-red-700 font-medium"
            >
              Clear Date
            </button>
          )}
        </div>

        {/* Action Type Filter */}
        <div>
          <p className="mb-3 text-sm font-semibold text-slate-700">Filter by Action Type:</p>
          <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedAction('')}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              selectedAction === ''
                ? 'bg-[var(--brand-primary)] text-white'
                : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            All Actions
          </button>
          {uniqueActions.map((action) => {
            const colors = getActionColor(action)
            return (
              <button
                key={action}
                onClick={() => setSelectedAction(action)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  selectedAction === action
                    ? `${colors.badge} text-white`
                    : `${colors.color} ${colors.textColor} hover:opacity-80`
                }`}
              >
                {action}
              </button>
            )
          })}          </div>        </div>
      </div>

      {/* Print Button */}
      <div className="flex justify-end print:hidden">
        <Button onClick={() => window.print()}>📄 Print Report</Button>
      </div>

      {/* Logs Table */}
      {isLoading ? (
        <div className="rounded-2xl border border-[var(--brand-secondary-soft)] bg-white p-8 text-center text-sm text-slate-500">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-[var(--brand-primary)]"></div>
          <p className="mt-3">Loading activity logs...</p>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="rounded-2xl border border-[var(--brand-secondary-soft)] bg-white p-8 text-center text-sm text-slate-500">
          No activity logs found {selectedAction && `for action "${selectedAction}"`}.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[var(--brand-secondary-soft)] bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-[#f8eef0]">
                <tr>
                  <th className="px-5 py-4 font-semibold text-[var(--brand-primary)]">Item Name</th>
                  <th className="px-5 py-4 font-semibold text-[var(--brand-primary)]">Action</th>
                  <th className="px-5 py-4 font-semibold text-[var(--brand-primary)]">Quantity Changed</th>
                  <th className="px-5 py-4 font-semibold text-[var(--brand-primary)]">Performed By</th>
                  <th className="px-5 py-4 font-semibold text-[var(--brand-primary)]">Details</th>
                  <th className="px-5 py-4 font-semibold text-[var(--brand-primary)]">Date & Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {paginatedLogs.map((log) => {
                  const colors = getActionColor(log.actionType)
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/70 transition">
                      <td className="px-5 py-4 font-medium text-slate-800">{log.itemName}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${colors.color} ${colors.textColor}`}>
                          {log.actionType}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`font-semibold ${log.quantityChanged > 0 ? 'text-green-600' : log.quantityChanged < 0 ? 'text-red-600' : 'text-slate-600'}`}>
                          {log.quantityChanged > 0 ? '+' : ''}{log.quantityChanged}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-700">
                        <div className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium">
                          {log.performedBy || 'System'}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-600 max-w-xs truncate">
                        {log.description || '-'}
                      </td>
                      <td className="px-5 py-4 text-slate-600 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString("en-PH", {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Summary Footer and Pagination */}
          <div className="bg-slate-50 px-5 py-4 text-sm border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div className="font-semibold text-slate-700">
                Total Records: <span className="text-[var(--brand-primary)]">{filteredLogs.length}</span> {selectedAction && `| Filter: ${selectedAction}`}
              </div>
              
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-600">
                    Page <span className="font-semibold">{currentPage}</span> of <span className="font-semibold">{totalPages}</span>
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default History
