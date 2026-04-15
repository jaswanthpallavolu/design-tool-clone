"use client"

import { useState } from "react"
import type { User } from "./design-board/types"
import { initialUsers } from "./design-board/constants"
import { getGradientClassName } from "./design-board/utils"
import { TopBar } from "./design-board/TopBar"
import { Hero } from "./design-board/Hero"
import { BoardList } from "./design-board/BoardList"
import { SwitchUserModal } from "./design-board/SwitchUserModal"

export default function DesignBoardPage() {
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [isSwitchUserOpen, setIsSwitchUserOpen] = useState(false)

  const activeUser = users.find((user) => user.isActive) ??
    users[0] ?? {
      id: "default-user",
      name: "User",
      lastActive: "Last active now",
      gradientClassName: "from-blue-400 to-blue-600",
    }

  const handleSelectUser = (userId: string) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) => ({
        ...user,
        isActive: user.id === userId,
      })),
    )
    setIsSwitchUserOpen(false)
  }

  const handleCreateUser = (name: string) => {
    const newUser: User = {
      id: name.toLowerCase().replace(/\s+/g, "-"),
      name,
      lastActive: "Last active now",
      gradientClassName: getGradientClassName(users.length),
      isActive: true,
    }

    setUsers((prevUsers) => [
      ...prevUsers.map((user) => ({ ...user, isActive: false })),
      newUser,
    ])
    setIsSwitchUserOpen(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 text-zinc-900">
      <TopBar
        activeUser={activeUser}
        onOpenSwitchUser={() => setIsSwitchUserOpen(true)}
      />

      <main className="mx-auto max-w-6xl px-8 pb-16 pt-28">
        <Hero />
        <BoardList />
      </main>

      <SwitchUserModal
        users={users}
        isOpen={isSwitchUserOpen}
        onClose={() => setIsSwitchUserOpen(false)}
        onSelectUser={handleSelectUser}
        onCreateUser={handleCreateUser}
      />
    </div>
  )
}

// Made with Bob
