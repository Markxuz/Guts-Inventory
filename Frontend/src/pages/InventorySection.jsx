import { useEffect, useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import Button from "../components/Button"
import ConsumableTable from "../components/ConsumableTable"
import ConsumableModal from "../components/ConsumableModal"
import TrackHistory from "../components/TrackHistory"
import { getInventoryByTrack } from "../api/inventoryApi"
import { addConsumable, archiveConsumable, updateConsumable } from "../api/inventoryCrudApi"
import { getHistoryLogs } from "../api/historyApi"
import { useSearch } from "../context/SearchContext"
import { useToast } from "../context/ToastContext"
import { useNotifications } from "../context/NotificationContext"
import { useInventoryLocation } from "../context/InventoryLocationContext"
import { normalizeItems } from "../utils/inventory"

const InventorySection = ({ title, description, track }) => {
  const { error: showError } = useToast()
  const [items, setItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const { searchQuery } = useSearch()
  const { setOnStockUpdate } = useNotifications()
  const { selectedInventory } = useInventoryLocation()
  const navigate = useNavigate()

  const loadItems = async () => {
    setIsLoading(true)
    const inventory = await getInventoryByTrack(track, selectedInventory)
    setItems(normalizeItems(inventory))
    setIsLoading(false)
  }

  // Navigate to item detail page when row is clicked
  const handleSelectItem = (item) => {
    navigate(`/inventory/${track}/${item.id}`)
  }

  useEffect(() => {
    loadItems()
  }, [track, selectedInventory])

  // Create stable callback for stock updates
  const handleStockUpdate = useCallback((data) => {
    console.log('📦 Updating inventory section with stock update:', data)
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === data.id ? { ...item, quantity: data.quantity } : item
      )
    )
  }, [])

  // Register stock update listener
  useEffect(() => {
    setOnStockUpdate(handleStockUpdate)
    
    return () => {
      setOnStockUpdate(null)
    }
  }, [handleStockUpdate, setOnStockUpdate])

  const filteredItems = items.filter((item) =>
    item.itemName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalItems = items.length
  const lowStockCount = items.filter((item) => item.status === "Low Stock").length
  const inStockCount = totalItems - lowStockCount

  const handleAdd = async (payload) => {
    try {
      await addConsumable({ ...payload, category: track.toUpperCase(), location: selectedInventory })
      setIsAddOpen(false)
      await loadItems()
    } catch (error) {
      showError(error.response?.data?.error || "Failed to add item.")
    }
  }

  const handleEdit = async (payload) => {
    try {
      await updateConsumable(editingItem.id, payload)
      setEditingItem(null)
      await loadItems()
    } catch (error) {
      showError(error.response?.data?.error || "Failed to update item.")
    }
  }

  const handleArchive = async (item) => {
    const shouldArchive = window.confirm(`Archive ${item.itemName}?`)

    if (!shouldArchive) {
      return
    }

    try {
      await archiveConsumable(item.id)
      await loadItems()
    } catch (error) {
      showError(error.response?.data?.error || "Failed to archive item.")
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-title text-3xl font-bold text-[var(--brand-primary)]">{title}</h2>
          <p className="mt-2 text-sm text-slate-600">{description}</p>
        </div>
        <Button
          className="bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-strong)]"
          onClick={() => setIsAddOpen(true)}
        >
          Add New Consumable
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-[var(--brand-secondary-soft)] bg-white px-4 py-3 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Total Items</p>
          <p className="mt-1 font-title text-xl font-bold text-slate-800">{totalItems} Consumables</p>
        </div>
        <div className="rounded-xl border border-[#e9cfd3] bg-[#fff6f7] px-4 py-3 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Low Stock</p>
          <p className="mt-1 font-title text-xl font-bold text-[var(--brand-primary)]">{lowStockCount}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-[#f8fafc] px-4 py-3 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">In Stock</p>
          <p className="mt-1 font-title text-xl font-bold text-slate-700">{inStockCount}</p>
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
          Loading {title} consumables...
        </div>
      ) : (
        <div className="h-[340px] overflow-y-auto">
          <ConsumableTable
            items={filteredItems}
            onEdit={setEditingItem}
            onArchive={handleArchive}
            onRowClick={handleSelectItem}
          />
        </div>
      )}

      <TrackHistory track={track} title={title} inventoryItems={items} logHeight="h-[260px]" />

      <ConsumableModal
        isOpen={isAddOpen}
        title="Add New Consumable"
        submitLabel="Save Item"
        onClose={() => setIsAddOpen(false)}
        onSubmit={handleAdd}
        initialValues={{ category: track.toUpperCase() }}
        lockCategory
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

export default InventorySection
