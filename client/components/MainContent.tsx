"use client"

import { useSidebarStore } from "@/stores/useSidebbarStore"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import Header from "@/components/Header"

interface MainContentProps {
  children: React.ReactNode
}

export default function MainContent({ children }: MainContentProps) {
  const { isCollapsed } = useSidebarStore()
  const pathname = usePathname()

  // Don't apply margin on auth pages or landing page
  const shouldApplyMargin = !pathname?.startsWith('/auth') && pathname !== '/'

  return (
    <div className={cn(
      "min-h-screen transition-all duration-300",
      shouldApplyMargin && (isCollapsed ? "lg:ml-16" : "lg:ml-64")
    )}>
      <Header />
      <main>
        {children}
      </main>
    </div>
  )
}
