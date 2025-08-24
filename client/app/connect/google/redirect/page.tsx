"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function GoogleRedirect() {
  const router = useRouter()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get("access_token") || params.get("jwt")
    if (token) {
      // Save token (localStorage, cookie, context, etc.)
      localStorage.setItem("jwt", token)
      // Redirect to dashboard or home
      router.push("/dashboard")
    } else {
      // Handle error
      router.push("/auth/sign-in?error=google")
    }
  }, [router])

  return null;
}