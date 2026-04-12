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
*
* 401 Handling:
*   Two sources can trigger a 401:
*   1. api.ts — fires 'auth:unauthorized' event when any API call returns 401
*   2. fetchMe — directly fires 'auth:unauthorized' if /api/auth/me returns 401
*   AuthProvider listens for the event and forces logout with session expired message.
*   localStorage is used to pass the flag across navigation.
*   login.tsx reads and immediately clears this flag on mount.
*
* User Identity:
*   After login or app load, fetches GET /api/auth/me to get name and email.
*   JWT only contains id and role — /me fills in the rest.
*   If /me returns 401, the unauthorized event is fired and user is logged out.
*   If /me fails for any other reason, basic user from token remains set.
*
* Session Expiry Flow:
*   Backend rejects token with 401
*     → fetchMe or api.ts fires 'auth:unauthorized' event
*     → handleUnauthorized clears all auth state
*     → sets localStorage.sessionExpired = 'true'
*     → ProtectedRoute redirects to /login
*     → login.tsx reads flag on mount → shows "Your session has expired" message
*     → flag is immediately cleared so it never shows again
*/


import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react'
import { jwtDecode } from 'jwt-decode'


// --- Types ---


interface User {
 id: string
 name: string
 email: string
 role: 'student' | 'teacher'
}


interface AuthContextType {
 user: User | null
 token: string | null
 loading: boolean
 login: (token: string) => void
 logout: () => void
}


// --- Create the box ---
const AuthContext = createContext<AuthContextType | null>(null)


// --- Provider ---
export function AuthProvider({ children }: { children: ReactNode }) {
 const [user, setUser] = useState<User | null>(null)
 const [token, setToken] = useState<string | null>(null)
 const [loading, setLoading] = useState(true)


 // Prevent multiple unauthorized triggers
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
     // Silent fail
   }
 }


 /**
  * FIXED: async restore to prevent race condition
  */
 useEffect(() => {
   async function restore() {
     const stored = localStorage.getItem('token')


     if (stored) {
       try {
         const decoded = jwtDecode<{ id: string; role: 'student' | 'teacher' }>(stored)


         setUser({ id: decoded.id, name: '', email: '', role: decoded.role })
         setToken(stored)


         // Wait for backend validation BEFORE unlocking routes
         await fetchMe(stored)


       } catch {
         localStorage.removeItem('token')
       }
     }


     setLoading(false)
   }


   restore()
 }, [])


 /**
  * FIXED: no redirect here, only state control
  */
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


// --- Hook ---
export function useAuth(): AuthContextType {
 const context = useContext(AuthContext)
 if (!context) throw new Error('useAuth must be used inside AuthProvider')
 return context
}
