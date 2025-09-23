'use client'

import { useEffect } from "react";
import { useAuthStore } from "@/stores/useAuthStore";

export const useAppInitialization = () => {
    const { token, login, setLoading} = useAuthStore()

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const storedToken = localStorage.getItem('jwt')

                if(storedToken && storedToken !== token){
                    await login( storedToken )
                }else {
                    setLoading(false)
                }
            } catch (error) {
                console.error('Failed to initialize auth: ', error)
                localStorage.removeItem('jwt')
                setLoading(false)
            }
        }

        initializeAuth()

    
    }, [])

    return null
}