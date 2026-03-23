import { useEffect, useMemo, useState } from "react"
import { RotateCcw } from "lucide-react"
import { getArchivedInventory } from "../api/inventoryApi"
import { restoreConsumable } from "../api/inventoryCrudApi"
import { useSearch } from "../context/SearchContext"
import { normalizeItems } from "../utils/inventory"

const Archive = () => {
  const [items, setItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const { searchQuery } = useSearch()

  const loadArchived = async () => {
    setIsLoading(true)

    try {
      const tracks = await getArchivedInventory()
      const combined = [...tracks.iem, ...tracks.smaw, ...tracks.css]
      setItems(normalizeItems(combined))
    } catch {
      setItems([])
    }

    setIsLoading(false)
  }

  useEffect(() => {
    loadArchived()
  }, [])

  const filteredItems = useMemo(
    () =>
      items.filter((item) =>
        item.itemName.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [items, searchQuery]
  )

  const handleRestore = async (item) => {
    const shouldRestore = window.confirm(`Restore ${item.itemName}?`)

    if (!shouldRestore) {
      return
    }

    try {
      await restoreConsumable(item.id)
      await loadArchived()
    } catch (error) {
      alert(error.response?.data?.error || "Failed to restore item.")
    }
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="font-title text-2xl font-bold text-[var(--brand-primary)]">Archive Vault</h2>
        <p className="text-sm text-slate-600">Archived consumables ready for restore.</p>
      </div>

      {isLoading ? (
        <div className="rounded-2xl border border-[var(--brand-secondary-soft)] bg-white p-6 text-sm text-slate-500">
          Loading archived items...
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[var(--brand-secondary-soft)] bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-[#f8eef0]">
                <tr>
                  <th className="px-5 py-4 font-semibold text-[var(--brand-primary)]">Item Name</th>
                  <th className="px-5 py-4 font-semibold text-[var(--brand-primary)]">Category</th>
                  <th className="px-5 py-4 font-semibold text-[var(--brand-primary)]">Quantity</th>
                  <th className="px-5 py-4 font-semibold text-[var(--brand-primary)]">Unit</th>
                  <th className="px-5 py-4 font-semibold text-[var(--brand-primary)]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70">
                    <td className="px-5 py-4 font-medium text-slate-700">{item.itemName}</td>
                    <td className="px-5 py-4 text-slate-700">{item.category}</td>
                    <td className="px-5 py-4 text-slate-700">{item.quantity}</td>
                    <td className="px-5 py-4 text-slate-600">{item.unit}</td>
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => handleRestore(item)}
                        className="inline-flex items-center gap-1 rounded-lg border border-[var(--brand-secondary-soft)] bg-[#f8eef0] px-3 py-2 text-xs font-semibold text-[var(--brand-primary)] transition hover:bg-[#f3dfe3]"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        Restore
                      </button>
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

export default Archive
