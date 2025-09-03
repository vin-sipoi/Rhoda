"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"

export default function GoogleRedirect() {
  const router = useRouter()
  const { login } = useAuth()

  useEffect(() => {
    const handleGoogleCallback = async () => {
      try {
        const params = new URLSearchParams(window.location.search)
        
        // Try different token parameters that Strapi might return
        const accessToken = params.get("access_token")
        const idToken = params.get("id_token") 
        const jwt = params.get("jwt")
        
        console.log("Received tokens:", { accessToken, idToken, jwt })
        console.log("All URL params:", Object.fromEntries(params.entries()))
        
        // If we have a direct JWT from Strapi, use it
        if (jwt) {
          console.log("Using direct JWT from Strapi")
          await login(jwt)
          router.push("/dashboard")
          return
        }
        
        // If we have Google tokens, exchange them for Strapi JWT
        if (accessToken || idToken) {
          console.log("Exchanging Google tokens for Strapi JWT...")
          
          const response = await fetch('/api/auth/google-exchange', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              access_token: accessToken,
              id_token: idToken,
            }),
          })

          if (response.ok) {
            const data = await response.json()
            console.log("Token exchange successful:", data)
            
            if (data.jwt) {
              await login(data.jwt)
              router.push("/dashboard")
              return
            }
          } else {
            const errorData = await response.json()
            console.error("Token exchange failed:", errorData)
          }
        }
        
        // If no valid token, redirect to error
        console.error("No valid token received from Google OAuth")
        router.push("/auth/sign-in?error=google-no-token")
        
      } catch (error) {
        console.error("Google authentication failed:", error)
        router.push("/auth/sign-in?error=google-failed")
      }
    }

    handleGoogleCallback()
  }, [router, login])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Completing Google sign-in...</p>
      </div>
    </div>
  );
}