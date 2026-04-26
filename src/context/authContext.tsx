import { createContext, useContext } from 'react'

export interface User {
  id: string
  name: string
  email: string
  role: 'student' | 'teacher'
}

export interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  login: (token: string) => void
  logout: () => void
}

export const AuthContext = createContext<AuthContextType | null>(null)

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}