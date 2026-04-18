import React from "react"
import { useRouter } from "next/navigation"
import { SwitchUserModal } from "@/app/components/ui/SwitchUserModal"
import { useGlobalContext } from "@/app/components/hooks/useGlobalContext"
import { useGetUsersQuery } from "@/app/features/users/user.queries"
import { User } from "@/app/types"

export default function LoginOptions() {
  const router = useRouter()
  const { currentUser, setCurrentUser } = useGlobalContext()
  const { data: users, isPending: isUsersLoading } = useGetUsersQuery()
  if (isUsersLoading) return <div>Loading...</div>

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
