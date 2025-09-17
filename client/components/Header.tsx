"use client"

import React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import {
  User,
  Settings,
  LogOut,
  Bell
} from 'lucide-react'

const Header = () => {
  const { user, logout, isLoading } = useAuth()
  const pathname = usePathname()
  const router = useRouter()


  // Don't show header on auth pages
  if (pathname?.startsWith('/auth') || pathname === '/') {
    return null
  }



  const handleLogout = () => {
    logout()
  }

  if (isLoading) {
    return (
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-8 w-32 bg-muted animate-pulse rounded" />
          </div>
          <div className="h-8 w-8 bg-muted animate-pulse rounded-full" />
        </div>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-800 bg-[#181818] backdrop-blur supports-[backdrop-filter]:bg-[#181818]">
      <div className="px-4 lg:px-6 h-16 flex items-center justify-between">
        {/* Logo - only show on mobile since sidebar has it on desktop */}
        <div className="flex items-center lg:hidden">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <span className="font-bold text-xl text-white">Rhoda</span>
          </Link>
        </div>

        {/* Spacer for desktop */}
        <div className="hidden lg:block" />

        {/* Right side - User menu */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          {user && (
            <Button variant="ghost" size="sm" className="text-white hover:bg-[#232323]">
              <Bell className="h-5 w-5" />
            </Button>
          )}

          {/* User Menu */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={(user as any).avatar} alt={user.username} />
                    <AvatarFallback className="bg-gray-700 text-white">
                      {user.username?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-[#181818] border-gray-700 text-white" align="end" forceMount>
                <DropdownMenuLabel className="font-normal text-white">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none text-white">
                      {user.username}
                    </p>
                    <p className="text-xs leading-none text-gray-400">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-700" />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer text-white hover:bg-gray-700 focus:bg-gray-700">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link href="/settings" className="cursor-pointer text-white hover:bg-gray-700 focus:bg-gray-700">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-700" />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer text-red-400 hover:text-red-300 hover:bg-gray-700 focus:bg-gray-700"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" asChild>
                <Link href="/auth/sign-in">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/sign-in">Get Started</Link>
              </Button>
            </div>
          )}


        </div>
      </div>


    </header>
  )
}

export default Header
