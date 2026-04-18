"use client"

import { useState } from "react"
import type { User as BoardUser } from "./board/types"
import { TopBar } from "./board/TopBar"
import { Hero } from "./board/Hero"
import { BoardList } from "./board/BoardList"
import { SwitchUserModal } from "../../components/ui/SwitchUserModal"
import { ConfirmationModal } from "../../components/ui/ConfirmationModal"
import { useGetUsersQuery } from "../../features/users/user.queries"
import {
  useGetDesignsQuery,
  useDeleteDesignMutation,
} from "../../features/designs/design.queries"
import { useGlobalContext } from "../../components/hooks/useGlobalContext"
import { getUserGradientClass } from "../../utils/userGradient"
import type { User, DesignWithCollaborators } from "@/app/types"

export default function DesignBoardPage() {
  const { currentUser, setCurrentUser } = useGlobalContext()
  const { data: users, isPending: isUsersLoading } = useGetUsersQuery()
  const { data: designs, isPending: isDesignsLoading } = useGetDesignsQuery(
    { ownerId: currentUser?.id || "" },
    { enabled: !!currentUser?.id },
  )
  const deleteDesignMutation = useDeleteDesignMutation()
  const [isSwitchUserOpen, setIsSwitchUserOpen] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean
    designId: string | null
    designName: string | null
  }>({
    isOpen: false,
    designId: null,
    designName: null,
  })

  if (isUsersLoading || !currentUser) return <></>

  // Convert global User to BoardUser format
  const activeUser: BoardUser = {
    id: currentUser.id,
    name: currentUser.name,
    lastActive: "Active now",
    gradientClassName: getUserGradientClass(currentUser.name),
    isActive: true,
  }

  const handleSelectUser = (userId: string) => {
    const user = users?.find((u: User) => u.id === userId)
    if (user) {
      setCurrentUser(user)
      localStorage.setItem("clientId", userId)
    }
    setIsSwitchUserOpen(false)
  }

  const handleCreateUser = (name: string) => {
    // TODO: Implement user creation API call
    setIsSwitchUserOpen(false)
  }

  const handleDeleteDesign = (designId: string) => {
    const design = designs?.find(
      (d: DesignWithCollaborators) => d.id === designId,
    )
    setDeleteConfirmation({
      isOpen: true,
      designId,
      designName: design?.title || "Untitled Design",
    })
  }

  const confirmDelete = async () => {
    if (!deleteConfirmation.designId) return

    try {
      await deleteDesignMutation.mutateAsync(deleteConfirmation.designId)
      setDeleteConfirmation({ isOpen: false, designId: null, designName: null })
    } catch (error) {
      console.error("Failed to delete design:", error)
    }
  }

  const cancelDelete = () => {
    setDeleteConfirmation({ isOpen: false, designId: null, designName: null })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 text-zinc-900">
      <TopBar
        activeUser={activeUser}
        onOpenSwitchUser={() => setIsSwitchUserOpen(true)}
      />

      <main className="mx-auto max-w-6xl px-8 pb-16 pt-28">
        <Hero userName={currentUser.name} />
        <BoardList
          designs={designs || []}
          isLoading={isDesignsLoading}
          onDelete={handleDeleteDesign}
        />
      </main>

      {isSwitchUserOpen && (
        <SwitchUserModal
          activeUser={currentUser}
          users={users || []}
          isOpen={isSwitchUserOpen}
          isLoading={isUsersLoading}
          hideCloseIcon={false}
          onClose={() => setIsSwitchUserOpen(false)}
          onSelectUser={handleSelectUser}
          onCreateUser={handleCreateUser}
        />
      )}

      <ConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        title="Delete Design"
        message={`Are you sure you want to delete "${deleteConfirmation.designName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        isLoading={deleteDesignMutation.isPending}
      />
    </div>
  )
}

// Made with Bob
