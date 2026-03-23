const DEFAULT_LOW_STOCK_THRESHOLD = 10

const getThreshold = (item) =>
  Number.isFinite(Number(item?.reorderLevel))
    ? Number(item.reorderLevel)
    : DEFAULT_LOW_STOCK_THRESHOLD

export const getStockStatus = (quantity, reorderLevel = DEFAULT_LOW_STOCK_THRESHOLD) =>
  quantity <= reorderLevel ? "Low Stock" : "In Stock"

export const normalizeItems = (items = []) =>
  items.map((item) => ({
    ...item,
    status: getStockStatus(item.quantity, getThreshold(item))
  }))

export const summarizeInventory = (inventoryMap) => {
  const tracks = Object.keys(inventoryMap)

  const totalsByTrack = tracks.map((track) => {
    const total = inventoryMap[track].reduce((sum, item) => sum + item.quantity, 0)
    return {
      track: track.toUpperCase(),
      total
    }
  })

  const grandTotal = totalsByTrack.reduce((sum, track) => sum + track.total, 0)

  return {
    totalsByTrack,
    grandTotal
  }
}

export const getLowStockItems = (inventoryMap) =>
  Object.entries(inventoryMap).flatMap(([track, items]) =>
    items
      .filter((item) => item.quantity <= getThreshold(item))
      .map((item) => ({
        ...item,
        track: track.toUpperCase(),
        status: "Low Stock"
      }))
  )
