'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '@/lib/auth'

// Create authentication context
const AuthContext = createContext(null)

// Authentication provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Initialize auth state on component mount
  useEffect(() => {
    const initAuth = () => {
      try {
        const currentUser = authService.getCurrentUser()
        setUser(currentUser)
      } catch (error) {
        console.error('Auth initialization error:', error)
        // Clear invalid auth data
        authService.logout()
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  // Login function
  const login = async (credentials) => {
    setLoading(true)
    try {
      const result = await authService.login(credentials)
      if (result.success) {
        setUser(result.user)
        return { success: true, user: result.user }
      }
      return { success: false, message: result.message }
    } catch (error) {
      return { success: false, message: error.message }
    } finally {
      setLoading(false)
    }
  }

  // Logout function
  const logout = () => {
    authService.logout()
    setUser(null)
    router.push('/login')
  }

  // Value to be provided to consuming components
  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
    userRole: user?.role || null,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}