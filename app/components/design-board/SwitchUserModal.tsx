"use client"

import { useState } from "react"
import { ChevronRight, Users, User, X } from "lucide-react"
import type { User as UserType } from "./types"

type UserListItemProps = {
  user: UserType
  onSelect: (userId: string) => void
}

function UserListItem({ user, onSelect }: UserListItemProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(user.id)}
      className="group flex w-full cursor-pointer items-center justify-between rounded-lg border border-zinc-200/50 bg-zinc-50 px-4 py-3 text-left transition-all duration-200 hover:bg-zinc-100 hover:shadow-md"
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br shadow-md ${user.gradientClassName}`}
        >
          <User className="h-5 w-5 text-white" />
        </div>
        <div>
          <span className="block text-sm font-semibold text-zinc-900">
            {user.name}
          </span>
          <span className="text-xs text-zinc-500">{user.lastActive}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {user.isActive ? (
          <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-green-600">
            Active
          </span>
        ) : null}
        <ChevronRight className="h-4 w-4 text-zinc-400 transition-colors group-hover:text-zinc-600" />
      </div>
    </button>
  )
}

type SwitchUserModalProps = {
  users: UserType[]
  isOpen: boolean
  onClose: () => void
  onSelectUser: (userId: string) => void
  onCreateUser: (name: string) => void
}

export function SwitchUserModal({
  users,
  isOpen,
  onClose,
  onSelectUser,
  onCreateUser,
}: SwitchUserModalProps) {
  const [newUserName, setNewUserName] = useState("")

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-lg overflow-hidden rounded-2xl border border-zinc-200/50 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-200/50 bg-gradient-to-r from-white to-zinc-50 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-blue-700 shadow-lg">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-zinc-900">Switch User</h1>
              <p className="text-xs text-zinc-500">Select or create a user</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-400 transition-all hover:bg-zinc-100 hover:text-zinc-600 active:scale-95"
            aria-label="Close switch user modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[calc(90vh-80px)] overflow-y-auto p-6">
          <section className="mb-6 space-y-2">
            {users.map((user) => (
              <UserListItem key={user.id} user={user} onSelect={onSelectUser} />
            ))}
          </section>

          <section className="border-t border-zinc-200 pt-6">
            <h2 className="mb-4 text-xs font-black uppercase tracking-[0.2em] text-zinc-600">
              Create New User
            </h2>

            <form
              className="space-y-3"
              onSubmit={(event) => {
                event.preventDefault()
                const trimmedName = newUserName.trim()
                if (!trimmedName) return
                onCreateUser(trimmedName)
                setNewUserName("")
              }}
            >
              <div className="space-y-2">
                <label
                  className="block text-sm font-semibold text-zinc-700"
                  htmlFor="username"
                >
                  User Name
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={newUserName}
                  onChange={(event) => setNewUserName(event.target.value)}
                  placeholder="Enter name..."
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 outline-none transition-all placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-300/60"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-lg bg-gradient-to-r from-zinc-900 to-zinc-800 py-2.5 font-bold text-zinc-50 transition-all duration-200 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]"
              >
                Create User
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  )
}

// Made with Bob
