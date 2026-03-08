/**
 * roleRoute.tsx
 *
 * Gate 2 — checks if the logged-in user has the correct role.
 * Always sits inside ProtectedRoute (token is already verified at that point).
 *
 * How it works:
 *   - Reads user from AuthContext
 *   - No user OR wrong role = redirect to /login
 *   - Correct role = render the child route via <Outlet />
 *
 * Usage in App.tsx:
 *   <Route element={<ProtectedRoute />}>
 *     <Route element={<RoleRoute allowed="student" />}>
 *       ...student only pages
 *     </Route>
 *   </Route>
 *
 * The two gates together:
 *   ProtectedRoute — are you logged in?
 *   RoleRoute      — are you the right role?
 */

import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/authContext'

interface RoleRouteProps {
  /** The role allowed to access the child routes */
  allowed: 'student' | 'teacher'
}

export default function RoleRoute({ allowed }: RoleRouteProps) {
  const { user } = useAuth()

  // No user = somehow bypassed ProtectedRoute (shouldn't happen)
  // Wrong role = e.g. a student trying to access /teacher routes
  // Either way, send back to login
  if (!user || user.role !== allowed) return <Navigate to="/login" replace />

  // Role matches = render whatever child route matched
  return <Outlet />
}