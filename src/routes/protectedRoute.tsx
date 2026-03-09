/**
 * protectedRoute.tsx
 *
 * Gate 1 — checks if the user is authenticated.
 * Wraps any route that requires a logged-in user.
 *
 * How it works:
 *   - Waits for AuthContext to finish restoring token from localStorage
 *   - No token = redirect to /login
 *   - Has token = render the child route via <Outlet />
 *
 * Usage in App.tsx:
 *   <Route element={<ProtectedRoute />}>
 *     <Route element={<RoleRoute allowed="student" />}>
 *       ...protected pages
 *     </Route>
 *   </Route>
 */

import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/authContext'

export default function ProtectedRoute() {
  const { token, loading } = useAuth()

  // Wait for localStorage restore before checking token
  if (loading) return null

  if (!token) return <Navigate to="/login" replace />

  return <Outlet />
}