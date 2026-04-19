import React from "react"
import { useRouter } from "next/navigation"
import { SwitchUserModal } from "@/app/components/ui/SwitchUserModal"
import { ServerErrorScreen } from "@/app/components/ui/ServerErrorScreen"
import { useGlobalContext } from "@/app/components/hooks/useGlobalContext"
import { useGetUsersQuery } from "@/app/features/users/user.queries"
import { User } from "@/app/types"

export default function LoginOptions() {
  const router = useRouter()
  const { currentUser, setCurrentUser } = useGlobalContext()
  const {
    data: users,
    isPending: isUsersLoading,
    isError,
    error,
  } = useGetUsersQuery()

  if (isUsersLoading) return <div>Loading...</div>

  // Show error message if server is down
  if (
    isError &&
    error instanceof Error &&
    error.message.includes("Unable to connect to server")
  ) {
    return <ServerErrorScreen message={error.message} />
  }

  const onSelectUser = (userId: string) => {
    const user = users?.find((user: User) => user.id === userId)
    if (user) {
      setCurrentUser(user)
      localStorage.setItem("clientId", userId)
      router.push("/design")
    }
  }
  return (
    <SwitchUserModal
      activeUser={currentUser}
      users={users}
      isOpen
      hideCloseIcon
      onSelectUser={onSelectUser}
    />
  )
}
