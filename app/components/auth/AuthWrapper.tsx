"use client"
import { useEffect, useState, useContext } from "react"
import { useRouter } from "next/navigation"
import { useGetUserQuery } from "../../features/users/user.queries"
import { useGlobalContext } from "../hooks/useGlobalContext"

export default function AuthWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const { currentUser, setCurrentUser } = useGlobalContext()
  const router = useRouter()
  const [clientId, setClientId] = useState("")
  const [isInitialized, setIsInitialized] = useState(false)

  const {
    data: userData,
    isPending,
    isSuccess,
    isError,
  } = useGetUserQuery({ id: clientId }, { enabled: !!clientId })
  const key = "userId"

  useEffect(() => {
    if (userData) {
      setCurrentUser({
        id: userData.id,
        name: userData.name,
        createdAt: userData.createdAt,
      })
    }
  }, [userData])

  useEffect(() => {
    if (isInitialized && (!clientId || isError)) {
      localStorage.removeItem(key)
      router.push("/login")
    }
  }, [isInitialized, clientId, isError, router])

  useEffect(() => {
    const userId = localStorage.getItem("clientId") ?? ""
    if (!userId) {
      router.push("/login")
      return
    }
    setClientId(userId)
    setIsInitialized(true)
  }, [router])

  if (isPending || !currentUser?.id) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
      </div>
    )
  }
  return <>{children}</>
}
