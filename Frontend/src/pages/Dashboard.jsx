import { useEffect, useMemo, useState } from "react"
import { Boxes, PackageOpen, ShieldCheck, Wrench } from "lucide-react"
import Button from "../components/Button"
import SummaryCard from "../components/SummaryCard"
import ConsumableTable from "../components/ConsumableTable"
import ConsumableModal from "../components/ConsumableModal"
import { getDashboardInventory } from "../api/inventoryApi"
import { addConsumable, archiveConsumable, updateConsumable } from "../api/inventoryCrudApi"
import { useSearch } from "../context/SearchContext"
import { normalizeItems, summarizeInventory } from "../utils/inventory"

const trackIconMap = {
  IEM: PackageOpen,
  SMAW: Wrench,
  CSS: ShieldCheck
}

const Dashboard = () => {
  const [summary, setSummary] = useState({ totalsByTrack: [], grandTotal: 0 })
  const [allItems, setAllItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const { searchQuery } = useSearch()

  const loadDashboard = async () => {
    setIsLoading(true)
    const inventoryByTrack = await getDashboardInventory()
    const combinedItems = [
      ...(inventoryByTrack.iem || []),
      ...(inventoryByTrack.smaw || []),
      ...(inventoryByTrack.css || [])
    ]
    setSummary(summarizeInventory(inventoryByTrack))
    setAllItems(normalizeItems(combinedItems))
    setIsLoading(false)
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  const lowStockItems = useMemo(
    () =>
      allItems
        .filter(
          (item) =>
            item.status === "Low Stock" &&
            item.itemName.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => a.quantity - b.quantity),
    [allItems, searchQuery]
  )

  const highStockItems = useMemo(
    () =>
      allItems
        .filter(
          (item) =>
            item.status !== "Low Stock" &&
            item.itemName.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 10),
    [allItems, searchQuery]
  )

  const handleAdd = async (payload) => {
    try {
      await addConsumable(payload)
      setIsAddOpen(false)
      await loadDashboard()
    } catch (error) {
      alert(error.response?.data?.error || "Failed to add item.")
    }
  }

  const handleEdit = async (payload) => {
    try {
      await updateConsumable(editingItem.id, payload)
      setEditingItem(null)
      await loadDashboard()
    } catch (error) {
      alert(error.response?.data?.error || "Failed to update item.")
    }
  }

  const handleArchive = async (item) => {
    const shouldArchive = window.confirm(`Archive ${item.itemName}?`)
    if (!shouldArchive) return
    try {
      await archiveConsumable(item.id)
      await loadDashboard()
    } catch (error) {
      alert(error.response?.data?.error || "Failed to archive item.")
    }
  }

  return (
    <section className="space-y-6 transition-all duration-300">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <h2 className="font-title text-2xl font-bold text-[var(--brand-primary)]">Dashboard Overview</h2>
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={() => window.print()}>Print Report</Button>
          <Button onClick={() => setIsAddOpen(true)}>Add New Consumable</Button>
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
          Loading inventory summary...
        </div>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              label="Total Consumables"
              value={summary.grandTotal}
              subtitle="Grand Total"
              icon={Boxes}
            />
            {summary.totalsByTrack.map((track) => (
              <SummaryCard
                key={track.track}
                label={`${track.track} Total`}
                value={track.total}
                subtitle={`${track.track} Total`}
                icon={trackIconMap[track.track] || PackageOpen}
              />
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2 print:grid-cols-1">
            {/* Low Stock Alerts */}
            <div className="space-y-3">
              <h3 className="font-title flex items-center gap-2 text-lg font-semibold text-slate-800">
                <span className="h-5 w-1 rounded-full bg-[var(--brand-primary)]" />
                Low Stock Alerts
                {lowStockItems.length > 0 ? (
                  <span className="ml-1 rounded-full bg-[#fbe9ed] px-2 py-0.5 text-xs font-semibold text-[#800000]">
                    {lowStockItems.length}
                  </span>
                ) : null}
              </h3>
              {lowStockItems.length > 0 ? (
                <ConsumableTable
                  items={lowStockItems}
                  onEdit={setEditingItem}
                  onArchive={handleArchive}
                />
              ) : (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700">
                  All consumables are currently healthy.
                </div>
              )}
            </div>

            {/* High Stock Inventory */}
            <div className="space-y-3">
              <h3 className="font-title flex items-center gap-2 text-lg font-semibold text-slate-800">
                <span className="h-5 w-1 rounded-full bg-emerald-500" />
                High Stock Inventory
                <span className="ml-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                  Top {highStockItems.length}
                </span>
              </h3>
              {highStockItems.length > 0 ? (
                <ConsumableTable
                  items={highStockItems}
                  onEdit={setEditingItem}
                  onArchive={handleArchive}
                />
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                  No in-stock items found.
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <ConsumableModal
        isOpen={isAddOpen}
        title="Add New Consumable"
        submitLabel="Save Item"
        onClose={() => setIsAddOpen(false)}
        onSubmit={handleAdd}
      />

      <ConsumableModal
        isOpen={Boolean(editingItem)}
        title="Update Consumable"
        submitLabel="Save Changes"
        onClose={() => setEditingItem(null)}
        onSubmit={handleEdit}
        initialValues={editingItem || undefined}
      />
    </section>
  )
}

export default Dashboard
