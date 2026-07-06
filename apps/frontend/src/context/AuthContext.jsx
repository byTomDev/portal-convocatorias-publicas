import { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMe } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('access_token'))
  const [loading, setLoading] = useState(false)

  const isAuthenticated = !!token

  useEffect(() => {
    if (!token) return

    setLoading(true)
    getMe()
      .then((userData) => {
        setUser(userData)
      })
      .catch(() => {
        localStorage.removeItem('access_token')
        setToken(null)
        setUser(null)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [token])

  const login = ({ access_token, user: userData }) => {
    localStorage.setItem('access_token', access_token)
    setToken(access_token)
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    setToken(null)
    setUser(null)
    navigate('/')
  }

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
