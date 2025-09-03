"use client"

import React, { useState, useRef, useEffect } from 'react'
import { User, Settings, LogOut, Mail, Calendar, Shield } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface ProfileDropdownProps {
  className?: string
}

export const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ className = "" }) => {
  const [isOpen, setIsOpen] = useState(false)
  const { user, logout } = useAuth()
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  if (!user) {
    return null
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getProfileTypeDisplay = (type?: string) => {
    return type ? type.charAt(0).toUpperCase() + type.slice(1) : 'User'
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Profile Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/20 flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white font-medium text-sm hover:border-white/40 transition-all duration-200 hover:shadow-lg"
      >
        {user.profile?.avatar ? (
          <img 
            src={user.profile.avatar} 
            alt={user.profile.name || user.username} 
            className="w-full h-full object-cover" 
          />
        ) : (
          <span>{getInitials(user.profile?.name || user.username || user.email)}</span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
          {/* User Info Header */}
          <div className="px-4 py-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white font-medium">
                {user.profile?.avatar ? (
                  <img 
                    src={user.profile.avatar} 
                    alt={user.profile.name || user.username} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <span>{getInitials(user.profile?.name || user.username || user.email)}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user.profile?.name || user.username || 'User'}
                </p>
                <p className="text-xs text-gray-600 truncate">{user.email}</p>
                {user.profile?.type && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                    <Shield className="w-3 h-3 mr-1" />
                    {getProfileTypeDisplay(user.profile.type)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* User Details */}
          <div className="px-4 py-3 border-b border-gray-100">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Account Details</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2 text-gray-700">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="truncate">{user.email}</span>
              </div>
              {user.createdAt && (
                <div className="flex items-center space-x-2 text-gray-700">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
              )}
              <div className="flex items-center space-x-2 text-gray-700">
                <User className="w-4 h-4 text-gray-400" />
                <span>ID: {user.id}</span>
              </div>
            </div>
          </div>

          {/* Profile Info */}
          {user.profile && (
            <div className="px-4 py-3 border-b border-gray-100">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Profile Info</h4>
              <div className="space-y-2 text-sm">
                {user.profile.bio && (
                  <p className="text-gray-700 text-xs leading-relaxed">{user.profile.bio}</p>
                )}
                {user.profile.interests && (
                  <div>
                    <span className="text-gray-500 text-xs">Interests: </span>
                    <span className="text-gray-700 text-xs">
                      {Array.isArray(user.profile.interests) 
                        ? user.profile.interests.join(', ') 
                        : user.profile.interests}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Menu Items */}
          <div className="py-2">
            <button
              onClick={() => {
                setIsOpen(false)
                // TODO: Add navigation to profile settings
                console.log('Navigate to profile settings')
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
            >
              <Settings className="w-4 h-4" />
              <span>Account Settings</span>
            </button>
            <button
              onClick={() => {
                setIsOpen(false)
                window.open('/debug', '_blank')
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
            >
              <User className="w-4 h-4" />
              <span>View Strapi Data</span>
            </button>
            <button
              onClick={() => {
                setIsOpen(false)
                logout()
              }}
              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
