import api from "./axios"

export const getHistoryLogs = async ({ category, itemId } = {}) => {
  const params = {}
  if (category) params.category = category
  if (itemId) params.itemId = itemId
  const response = await api.get("/history", { params })
  return response.data?.logs || []
}
