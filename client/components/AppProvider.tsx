"use client"

import { useAppInitialization } from '@/hooks/useAppInitialization'
import Sidebar from '@/components/Sidebar'
import MainContent from '@/components/MainContent'
import { Toaster } from "@/components/ui/toaster"

interface AppProviderProps {
  children: React.ReactNode
}

export default function AppProvider({ children }: AppProviderProps) {
  useAppInitialization()
  
  return (
    <>
      <Sidebar />
      <MainContent>
        {children}
      </MainContent>
      <Toaster />
    </>
  )
}