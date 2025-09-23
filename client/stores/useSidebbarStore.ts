import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SidebarState {
    isCollapsed: boolean
    isMobileOpen: boolean

    setIsCollapsed: (collapsed: boolean) => void
    setIsMobileOpen: (open: boolean) => void
    toggleCollapsed: () => void
    toggleMobileOpen: () => void
    closeMobile: () => void 
}

export const useSidebarStore = create<SidebarState>()(
    persist(
        (set,get) => ({
            isCollapsed: false,
            isMobileOpen: false,

            setIsCollapsed: (isCollapsed) => set({isCollapsed}),
            setIsMobileOpen: (isMobileOpen) => set ({isMobileOpen}),

            toggleCollapsed: () => set((state)=> ({
                isCollapsed: !state.isCollapsed
            })),

            toggleMobileOpen: () => set ((state)=> ({
                isMobileOpen: !state.isMobileOpen
            })),

            closeMobile: () => set({isMobileOpen: false}),
        }),

       {
        name: 'sidebar-storage',
        partialize: (state) => ({
            isCollapsed: state.isCollapsed
        }),
       }
        
    )
)