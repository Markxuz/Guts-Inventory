import api from "./axios"
import { inventorySeed } from "../data/inventorySeed"

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export const getInventoryByTrack = async (track, location = 'main') => {
  try {
    const response = await api.get(`/inventory/${track}`, { params: { location } })
    return response.data?.items || []
  } catch {
    await wait(300)
    return inventorySeed[track] || []
  }
}

export const getDashboardInventory = async (location = 'main') => {
  try {
    const response = await api.get("/inventory", { params: { location } })
    return response.data?.tracks || inventorySeed
  } catch {
    await wait(300)
    return inventorySeed
  }
}

export const getArchivedInventory = async (location = 'main') => {
  const response = await api.get("/inventory", { params: { archived: true, location } })
  return response.data?.tracks || { iem: [], smaw: [], css: [] }
}
