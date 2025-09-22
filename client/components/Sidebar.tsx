"use client"

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSidebarStore } from '@/stores/useSidebbarStore'
import { useAuthStore } from '@/stores/useAuthStore'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import {
  Home,
  Compass,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

const Sidebar = () => {
  const { user, logout } = useAuthStore()
  const pathname = usePathname()
  const { isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen, toggleCollapsed, closeMobile } = useSidebarStore()

  // Don't show sidebar on auth pages or landing page
  if (pathname?.startsWith('/auth') || pathname === '/') {
    return null
  }

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
    },
    {
      name: 'Discover',
      href: '/discover',
      icon: Compass,
    },
    {
      name: 'Profile',
      href: '/profile',
      icon: User,
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
    },
  ]

  const handleLogout = () => {
    logout()
    setIsMobileOpen(false)
  }

  const toggleMobile = () => {
    setIsMobileOpen(!isMobileOpen)
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="sm"
        className="fixed top-4 left-4 z-50 lg:hidden bg-[#181818] hover:bg-[#232323] text-white border border-gray-700"
        onClick={toggleMobile}
      >
        {isMobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 z-50 h-screen bg-[#181818] border-r border-gray-800 transition-all duration-300 ease-in-out flex flex-col",
        // Mobile styles
        "lg:translate-x-0",
        isMobileOpen ? "translate-x-0" : "-translate-x-full",
        // Desktop styles
        isCollapsed ? "lg:w-16" : "lg:w-64",
        // Mobile width
        "w-64"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4">
          {!isCollapsed && (
            <Link href="/dashboard" className="flex items-center space-x-2">
              <span className="font-bold text-xl text-white">Rhoda</span>
            </Link>
          )}
          
          {/* Desktop Collapse Button */}
          <Button
            variant="ghost"
            size="sm"
            className="hidden lg:flex p-1 h-8 w-8 text-gray-400 hover:text-white hover:bg-[#232323]"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors group",
                  isActive
                    ? "bg-[#232323] text-white"
                    : "text-gray-300 hover:bg-[#232323] hover:text-white",
                  isCollapsed && "lg:justify-center lg:px-2"
                )}
                title={isCollapsed ? item.name : undefined}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && (
                  <span className="lg:block">{item.name}</span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* User Section */}
        {user && (
          <div className="border-t border-gray-800 p-4">
            {!isCollapsed ? (
              <div className="space-y-3">
                {/* User Info */}
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={(user as any).avatar} alt={user.username} />
                    <AvatarFallback className="bg-gray-700 text-white">
                      {user.username?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {user.username}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {user.email}
                    </p>
                  </div>
                </div>

                {/* Sign Out Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-950/20"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign out
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={(user as any).avatar} alt={user.username} />
                  <AvatarFallback className="bg-gray-700 text-white">
                    {user.username?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="p-1 h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-950/20"
                  title="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        )}
      </aside>


    </>
  )
}

export default Sidebar
