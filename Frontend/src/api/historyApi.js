import api from "./axios"

export const getHistoryLogs = async ({ category, itemId } = {}) => {
  const params = {}
  if (category) params.category = category
  if (itemId) params.itemId = itemId
  const response = await api.get("/history", { params })
  return response.data?.logs || []
}

export const updateHistoryRecord = async (id, data) => {
  const response = await api.put(`/history/${id}`, data)
  return response.data
}

export const recalculateInventoryHistory = async (consumableId, location = 'main') => {
  const response = await api.post(`/history/${consumableId}/recalculate`, {}, {
    params: { location }
  })
  return response.data
}
