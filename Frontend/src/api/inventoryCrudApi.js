export const checkoutConsumable = async (id, payload) => {
  const response = await api.post(`/inventory/${id}/checkout`, payload)
  return response.data
}
import api from "./axios"

export const addConsumable = async (payload) => {
  const response = await api.post("/inventory", payload)
  return response.data
}

export const updateConsumable = async (id, payload) => {
  const response = await api.put(`/inventory/${id}`, payload)
  return response.data
}

export const archiveConsumable = async (id) => {
  const response = await api.patch(`/inventory/${id}/archive`)
  return response.data
}

export const restoreConsumable = async (id) => {
  const response = await api.patch(`/inventory/${id}/restore`)
  return response.data
}
