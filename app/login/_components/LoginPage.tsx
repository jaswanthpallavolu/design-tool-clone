"use client"
import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import LoginOptions from "./LoginOptions"

export default function LoginPage() {
  const router = useRouter()
  const [initialized, setIsInitialized] = useState(false)
  const key = "userId"

  useEffect(() => {
    const userId = localStorage.getItem(key)
    if (userId) {
      router.push("/design")
      return
    }
    setIsInitialized(true)
  }, [])

  if (!initialized) return <></>
  return <LoginOptions />
}
