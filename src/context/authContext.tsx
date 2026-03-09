/**
 * authContext.tsx
 *
 * Global authentication state for cLMS.
 * Holds the current user, their JWT token, and auth actions (login/logout).
 *
 * Exports:
 *   AuthProvider — wraps the app in main.tsx, holds the state
 *   useAuth      — hook any component uses to read auth state
 *
 * Usage in any component:
 *   const { user, token, login, logout } = useAuth()
 *
 * Persistence:
 *   Token is saved to localStorage on login and restored on app load.
 *   Refresh will not log the user out.
 *   Logout clears localStorage.
 */

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { jwtDecode } from 'jwt-decode'

// --- Types ---

/** Represents the logged-in user */
interface User {
  id: string
  name: string
  email: string
  role: 'student' | 'teacher'
}

/** Shape of everything the context exposes to components */
interface AuthContextType {
  user: User | null        // null = no one logged in
  token: string | null     // null = no active session
  loading: boolean        // true while restoring token on app load
  login: (token: string) => void
  logout: () => void
}

// --- Create the box ---
// null default means the context hasn't been provided yet
// useAuth() guards against this with a runtime error
const AuthContext = createContext<AuthContextType | null>(null)

// --- Provider ---
/**
 * Wraps the entire app in main.tsx.
 * Holds user and token in state — when these change,
 * every component using useAuth() automatically re-renders.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  /**
   * On app load — restore token from localStorage if it exists.
   * This keeps the user logged in after a page refresh.
   * If the token is invalid or expired, it is cleared from localStorage.
   */
  useEffect(() => {
    const stored = localStorage.getItem('token')
    if (stored) {
      try {
        const decoded = jwtDecode<{ id: string; role: 'student' | 'teacher' }>(stored)
        setUser({ id: decoded.id, name: '', email: '', role: decoded.role })
        setToken(stored)
      } catch {
        localStorage.removeItem('token')
      }
    }
    setLoading(false) // always set to false when done, whether token existed or not
  }, [])

  /**
   * Called after a successful login API response.
   * Register does not return a token — it redirects to /login instead.
   * Decodes the JWT to extract id and role, stores both in context state.
   * Components reading useAuth() will immediately see the new values.
   */
  function login(token: string) {
    const decoded = jwtDecode<{ id: string; role: 'student' | 'teacher' }>(token)
    // name and email are empty — backend token only contains id and role
    // to fill these, either add them to the JWT payload on the backend
    // or make a GET /api/auth/me endpoint after login
    setUser({ id: decoded.id, name: '', email: '', role: decoded.role })
    setToken(token)
    // Persist token so refresh doesn't log the user out
    localStorage.setItem('token', token)
  }

  /**
   * Clears all auth state.
   * ProtectedRoute will detect token === null and redirect to /login.
   * Removes token from localStorage so it is not restored on next load.
   */
  function logout() {
    setUser(null)
    setToken(null)
    // Clear persisted token on logout
    localStorage.removeItem('token')
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// --- Hook ---
/**
 * The only way components should access auth state.
 * Throws if used outside AuthProvider — catches wiring mistakes early.
 *
 * Example:
 *   const { user, token } = useAuth()
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}