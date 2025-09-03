"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

interface UserProfile {
  id: string
  type: 'learner' | 'educator'
  name: string
  avatar?: string
  bio?: string
  interests?: string[] | string
  experience?: string
  age?: number
  preferences?: Record<string, any>
}

interface User {
  id: string
  email: string
  username: string
  provider: string
  confirmed: boolean
  blocked: boolean
  createdAt: string
  updatedAt: string
  role: {
    id: string
    name: string
    description: string
    type: string
  }
  profile?: UserProfile
}

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (token: string) => Promise<void>
  logout: () => void
  updateProfile: (profileData: Partial<UserProfile>) => Promise<void>
  createProfile: (type: 'learner' | 'educator', data: any) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const isAuthenticated = !!user && !!token

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('jwt')
        if (storedToken) {
          await login(storedToken)
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error)
        localStorage.removeItem('jwt')
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const fetchUserProfile = async (authToken: string): Promise<User> => {
    console.log("Fetching user profile with token:", authToken?.substring(0, 20) + "...");
    
    const response = await fetch('/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to fetch user profile:", response.status, errorText);
      throw new Error(`Failed to fetch user profile: ${response.status}`)
    }

    const userData = await response.json();
    console.log("User profile fetched successfully:", userData);
    return userData;
  }

  const login = async (authToken: string) => {
    try {
      setIsLoading(true)
      const userData = await fetchUserProfile(authToken)
      
      setToken(authToken)
      setUser(userData)
      localStorage.setItem('jwt', authToken)
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('jwt')
    
    // Clear any server-side cookies
    document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    document.cookie = 'refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    
    router.push('/auth/sign-in')
  }

  const updateProfile = async (profileData: Partial<User['profile']>) => {
    if (!token || !user?.profile) return

    try {
      const response = await fetch(`/api/profiles/${user.profile.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: profileData }),
      })

      if (!response.ok) {
        throw new Error('Failed to update profile')
      }

      const updatedProfile = await response.json()
      setUser(prev => prev ? { ...prev, profile: { ...prev.profile, ...updatedProfile.data } } : null)
    } catch (error) {
      console.error('Failed to update profile:', error)
      throw error
    }
  }

    const createProfile = async (type: 'learner' | 'educator', data: any) => {
    if (!token || !user) return

    try {
      const endpoint = type === 'learner' ? '/api/learners' : '/api/educators'
      console.log('Creating profile:', { type, data, endpoint, userId: user.id })
      
      // Format data for Strapi
      const strapiData = {
        data: {
          ...data,
        }
      }
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(strapiData),
      })

      console.log('Create profile response status:', response.status)
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('Create profile error response:', errorData)
        throw new Error(`Failed to create ${type} profile: ${errorData.error?.message || errorData.details || 'Unknown error'}`)
      }

      const newProfile = await response.json()
      console.log('Created profile successfully:', newProfile)
      
      // Instead of trying to parse the complex response, just refresh user data
      console.log('Refreshing user data after profile creation...')
      const refreshedUserData = await fetchUserProfile(token)
      setUser(refreshedUserData)
      console.log('User data refreshed:', refreshedUserData)
      
    } catch (error) {
      console.error(`Failed to create ${type} profile:`, error)
      throw error
    }
  }

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    logout,
    updateProfile,
    createProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
