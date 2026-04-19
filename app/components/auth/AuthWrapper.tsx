"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useGetUserQuery } from "../../features/users/user.queries"
import { useGlobalContext } from "../hooks/useGlobalContext"
import { ServerErrorScreen } from "../ui/ServerErrorScreen"

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
    error,
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
  }, [userData, setCurrentUser])

  useEffect(() => {
    if (isInitialized && !clientId) {
      localStorage.removeItem(key)
      router.push("/login")
    }
    // Only redirect on non-network errors
    if (isInitialized && isError && error instanceof Error) {
      if (!error.message.includes("Unable to connect to server")) {
        localStorage.removeItem(key)
        router.push("/login")
      }
    }
  }, [isInitialized, clientId, isError, error, router])

  useEffect(() => {
    const userId = localStorage.getItem("clientId") ?? ""
    if (!userId) {
      router.push("/login")
      return
    }
    setClientId(userId)
    setIsInitialized(true)
  }, [router])

  // Show error message if server is down
  if (
    isError &&
    error instanceof Error &&
    error.message.includes("Unable to connect to server")
  ) {
    return <ServerErrorScreen message={error.message} />
  }

  if (isPending || !currentUser?.id) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
      </div>
    )
  }
  return <>{children}</>
}
