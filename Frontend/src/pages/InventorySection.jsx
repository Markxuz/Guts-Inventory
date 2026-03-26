import { useEffect, useState } from "react"
import Button from "../components/Button"
import ConsumableTable from "../components/ConsumableTable"
import ConsumableModal from "../components/ConsumableModal"
import ComprehensiveItemModal from "../components/ComprehensiveItemModal"
import TrackHistory from "../components/TrackHistory"
import { getInventoryByTrack } from "../api/inventoryApi"
import { addConsumable, archiveConsumable, updateConsumable, updateStock } from "../api/inventoryCrudApi"
import { getHistoryLogs } from "../api/historyApi"
import { useSearch } from "../context/SearchContext"
import { useNotifications } from "../context/NotificationContext"
import { normalizeItems } from "../utils/inventory"

const InventorySection = ({ title, description, track }) => {
  const [items, setItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [selectedItem, setSelectedItem] = useState(null)
  const [itemHistory, setItemHistory] = useState([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const { searchQuery } = useSearch()
  const { setOnStockUpdate } = useNotifications()

  const loadItems = async () => {
    setIsLoading(true)
    const inventory = await getInventoryByTrack(track)
    setItems(normalizeItems(inventory))
    setIsLoading(false)
  }

  // Fetch history when item is selected
  const handleSelectItem = async (item) => {
    setSelectedItem(item)
    setIsLoadingHistory(true)
    try {
      const logs = await getHistoryLogs({ itemId: item.id })
      setItemHistory(logs || [])
    } catch (error) {
      console.error("Failed to fetch item history", error)
      setItemHistory([])
    } finally {
      setIsLoadingHistory(false)
    }
  }

  useEffect(() => {
    loadItems()
  }, [track])

  // Listen for real-time stock updates
  useEffect(() => {
    const handleStockUpdate = (data) => {
      console.log('📦 Updating inventory section with stock update:', data)
      setItems(prevItems =>
        prevItems.map(item =>
          item.id === data.id ? { ...item, quantity: data.quantity } : item
        )
      )
      // Update selected item if it was modified
      if (selectedItem && selectedItem.id === data.id) {
        setSelectedItem(prev => ({ ...prev, quantity: data.quantity }))
      }
    }
    
    setOnStockUpdate(() => handleStockUpdate)
    
    return () => {
      setOnStockUpdate(null)
    }
  }, [selectedItem, setOnStockUpdate])

  const filteredItems = items.filter((item) =>
    item.itemName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalItems = items.length
  const lowStockCount = items.filter((item) => item.status === "Low Stock").length
  const inStockCount = totalItems - lowStockCount

  const handleAdd = async (payload) => {
    try {
      await addConsumable({ ...payload, category: track.toUpperCase() })
      setIsAddOpen(false)
      await loadItems()
    } catch (error) {
      alert(error.response?.data?.error || "Failed to add item.")
    }
  }

  const handleEdit = async (payload) => {
    try {
      await updateConsumable(editingItem.id, payload)
      setEditingItem(null)
      await loadItems()
    } catch (error) {
      alert(error.response?.data?.error || "Failed to update item.")
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
      alert(error.response?.data?.error || "Failed to archive item.")
    }
  }

  const handleAddStock = async (formData) => {
    if (!selectedItem) return
    
    try {
      await updateStock(selectedItem.id, {
        type: "in",
        amount: parseInt(formData.quantity, 10),
        description: formData.notes,
        performedBy: formData.performedBy,
        course: formData.course,
        trainer: formData.trainer,
        purpose: formData.purpose,
      })
      setSelectedItem(null)
      setItemHistory([])
      await loadItems()
      alert("Stock added successfully!")
    } catch (error) {
      alert(error.response?.data?.error || "Failed to add stock.")
    }
  }

  const handleDeductStock = async (formData) => {
    if (!selectedItem) return
    
    try {
      await updateStock(selectedItem.id, {
        type: "out",
        amount: parseInt(formData.quantity, 10),
        description: formData.notes,
        performedBy: formData.performedBy,
        course: formData.course,
        trainer: formData.trainer,
        purpose: formData.purpose,
      })
      setSelectedItem(null)
      setItemHistory([])
      await loadItems()
      alert("Stock deducted successfully!")
    } catch (error) {
      alert(error.response?.data?.error || "Failed to deduct stock.")
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

      <ComprehensiveItemModal
        isOpen={!!selectedItem && !isLoadingHistory}
        item={selectedItem}
        itemHistory={itemHistory}
        onClose={() => {
          setSelectedItem(null)
          setItemHistory([])
        }}
        onAddStock={handleAddStock}
        onDeductStock={handleDeductStock}
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
