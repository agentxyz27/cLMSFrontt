import { useState, useEffect, useRef, type ReactNode } from 'react'
import { jwtDecode } from 'jwt-decode'
import { AuthContext, type User } from '../context/authContext'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const handlingUnauthorizedRef = useRef(false)

  async function fetchMe(token: string) {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (res.status === 401) {
        window.dispatchEvent(new Event('auth:unauthorized'))
        return
      }

      if (!res.ok) return

      const data = await res.json()
      setUser({
        id: String(data.id),
        name: data.name,
        email: data.email,
        role: data.role
      })
    } catch {
      // silent fail
    }
  }

  useEffect(() => {
    async function restore() {
      const stored = localStorage.getItem('token')
      if (stored) {
        try {
          const decoded = jwtDecode<{ id: string; role: 'student' | 'teacher' }>(stored)
          setUser({ id: decoded.id, name: '', email: '', role: decoded.role })
          setToken(stored)
          await fetchMe(stored)
        } catch {
          localStorage.removeItem('token')
        }
      }
      setLoading(false)
    }
    restore()
  }, [])

  useEffect(() => {
    function handleUnauthorized() {
      if (handlingUnauthorizedRef.current) return
      handlingUnauthorizedRef.current = true
      setUser(null)
      setToken(null)
      localStorage.removeItem('token')
      localStorage.setItem('sessionExpired', 'true')
    }
    window.addEventListener('auth:unauthorized', handleUnauthorized)
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized)
  }, [])

  function login(token: string) {
    const decoded = jwtDecode<{ id: string; role: 'student' | 'teacher' }>(token)
    setUser({ id: decoded.id, name: '', email: '', role: decoded.role })
    setToken(token)
    localStorage.setItem('token', token)
    fetchMe(token)
  }

  function logout() {
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}