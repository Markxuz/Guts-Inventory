import api from './axios'

// Admin: Create a new user
export const createUser = async (userData) => {
  const response = await api.post('/auth/admin/create-user', userData)
  return response.data
}

// Login
export const login = async (username, password) => {
  const response = await api.post('/auth/login', { username, password })
  return response.data
}

// Get profile
export const getProfile = async () => {
  const response = await api.get('/auth/profile')
  return response.data
}
