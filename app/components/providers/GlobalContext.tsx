"use client"
import { useState, createContext } from "react"
import { User } from "@/app/types"

type GlobalContextType = {
  currentUser: User
  setCurrentUser: (user: User) => void
}

export const GlobalContext = createContext<GlobalContextType | null>(null)

export const GlobalContextProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const [currentUser, setCurrentUser] = useState<User>({
    id: "",
    name: "",
    createdAt: "",
  })
  const contextValues = {
    currentUser,
    setCurrentUser,
  }
  return (
    <GlobalContext.Provider value={contextValues}>
      {children}
    </GlobalContext.Provider>
  )
}
