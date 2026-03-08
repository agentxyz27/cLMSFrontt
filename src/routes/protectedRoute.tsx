/**
 * protectedRoute.tsx
 *
 * Gate 1 — checks if the user is authenticated.
 * Wraps any route that requires a logged-in user.
 *
 * How it works:
 *   - Reads token from AuthContext
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
  const { token } = useAuth()

  // No token = not logged in, send to login page
  // `replace` means the /login redirect won't be added to browser history
  if (!token) return <Navigate to="/login" replace />

  // Token exists = render whatever child route matched
  return <Outlet />
}