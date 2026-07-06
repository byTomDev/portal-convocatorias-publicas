import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const login = (email, password) =>
  api.post('/auth/login', { email, password }).then((r) => r.data)

export const register = (email, password, confirmPassword) =>
  api.post('/auth/register', { email, password, confirm_password: confirmPassword }).then((r) => r.data)

export const getMe = () => api.get('/auth/me').then((r) => r.data)

export const getProcurements = ({ entity, status, start_date, end_date, limit, offset } = {}) =>
  api.get('/procurements', { params: { entity, status, start_date, end_date, limit, offset } }).then((r) => r.data)

export default api
