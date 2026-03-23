import api from "./axios"
import { inventorySeed } from "../data/inventorySeed"

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export const getInventoryByTrack = async (track) => {
  try {
    const response = await api.get(`/inventory/${track}`)
    return response.data?.items || []
  } catch {
    await wait(300)
    return inventorySeed[track] || []
  }
}

export const getDashboardInventory = async () => {
  try {
    const response = await api.get("/inventory")
    return response.data?.tracks || inventorySeed
  } catch {
    await wait(300)
    return inventorySeed
  }
}

export const getArchivedInventory = async () => {
  const response = await api.get("/inventory", { params: { archived: true } })
  return response.data?.tracks || { iem: [], smaw: [], css: [] }
}
