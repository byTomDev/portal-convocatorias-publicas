import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('access_token'))

  const isAuthenticated = !!token

  // TODO: fetch /auth/me on mount to rehydrate user session
  useEffect(() => {
    if (token) {
      // placeholder — will be replaced when LoginPage connects to backend
      setUser({ email: '' })
    }
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
  }

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, login, logout }}>
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
