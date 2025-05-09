import React, { createContext, useContext, useState, useEffect } from 'react'

// Create context
const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState(null)

  // Check if user is logged in on initial load
  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    const storedToken = localStorage.getItem('token')
    
    if (storedUser && storedToken) {
      setCurrentUser(JSON.parse(storedUser))
    }
    
    setLoading(false)
  }, [])

  // Login function
  const login = async (credentials) => {
    setAuthError(null)
    setLoading(true)
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed')
      }
      
      // Store user data and token in localStorage
      localStorage.setItem('user', JSON.stringify(data.user))
      localStorage.setItem('token', data.token)
      
      setCurrentUser(data.user)
      return data.user
    } catch (error) {
      setAuthError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Register function
  const register = async (userData) => {
    setAuthError(null)
    setLoading(true)
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed')
      }
      
      // Automatically log in after registration
      if (data.token && data.user) {
        localStorage.setItem('user', JSON.stringify(data.user))
        localStorage.setItem('token', data.token)
        setCurrentUser(data.user)
      }
      
      return data.user
    } catch (error) {
      setAuthError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }
  // Logout function
  const logout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    setCurrentUser(null)
  }

  // Get current user profile
  const fetchUserProfile = async () => {
    setLoading(true)
    
    try {
      const token = localStorage.getItem('token')
      
      if (!token) {
        throw new Error('No authentication token found')
      }
      
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch user profile')
      }
      
      setCurrentUser(data.user)
      return data.user
    } catch (error) {
      setAuthError(error.message)
      logout() // Clear invalid session
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Check if user is admin
  const isAdmin = () => {
    return currentUser?.role === 'admin'
  }

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!currentUser
  }

  const value = {
    currentUser,
    loading,
    authError,
    login,
    register,
    logout,
    fetchUserProfile,
    isAdmin,
    isAuthenticated,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  
  return context
}