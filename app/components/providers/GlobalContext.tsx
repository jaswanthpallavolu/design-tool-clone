"use client"
import { useState, createContext, useRef } from "react"
import { User } from "@/app/types"
import { Editor } from "@/editor-engine"

type GlobalContextType = {
  currentUser: User
  setCurrentUser: (user: User) => void
  editorRef: React.MutableRefObject<Editor | null>
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
  const editorRef = useRef<Editor | null>(null)

  const contextValues = {
    currentUser,
    setCurrentUser,
    editorRef,
  }
  return (
    <GlobalContext.Provider value={contextValues}>
      {children}
    </GlobalContext.Provider>
  )
}
