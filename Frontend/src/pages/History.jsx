import { useEffect, useMemo, useState } from "react"
import Button from "../components/Button"
import { useSearch } from "../context/SearchContext"
import { getHistoryLogs } from "../api/historyApi"

const History = () => {
  const [logs, setLogs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
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

  const filteredLogs = useMemo(
    () =>
      logs.filter((log) =>
        log.itemName.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [logs, searchQuery]
  )

  return (
    <section className="space-y-4">
      <div>
        <h2 className="font-title text-2xl font-bold text-[var(--brand-primary)]">Transaction History</h2>
        <p className="text-sm text-slate-600">Recent stock and inventory changes.</p>
      </div>

      <div className="flex justify-end print:hidden">
        <Button onClick={() => window.print()}>Print Report</Button>
      </div>

      {isLoading ? (
        <div className="rounded-2xl border border-[var(--brand-secondary-soft)] bg-white p-6 text-sm text-slate-500">
          Loading history...
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[var(--brand-secondary-soft)] bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-[#f8eef0]">
                <tr>
                  <th className="px-5 py-4 font-semibold text-[var(--brand-primary)]">Item Name</th>
                  <th className="px-5 py-4 font-semibold text-[var(--brand-primary)]">Action</th>
                  <th className="px-5 py-4 font-semibold text-[var(--brand-primary)]">Quantity</th>
                  <th className="px-5 py-4 font-semibold text-[var(--brand-primary)]">Performed By</th>
                  <th className="px-5 py-4 font-semibold text-[var(--brand-primary)]">Description</th>
                  <th className="px-5 py-4 font-semibold text-[var(--brand-primary)]">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70">
                    <td className="px-5 py-4 font-medium text-slate-700">{log.itemName}</td>
                    <td className="px-5 py-4 text-slate-700">{log.actionType}</td>
                    <td className="px-5 py-4 text-slate-700">{log.quantityChanged}</td>
                    <td className="px-5 py-4 text-slate-700">{log.performedBy || "System"}</td>
                    <td className="px-5 py-4 text-slate-600">{log.description || "-"}</td>
                    <td className="px-5 py-4 text-slate-600">
                      {new Date(log.createdAt).toLocaleString("en-PH")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  )
}

export default History
