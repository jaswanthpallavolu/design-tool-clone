// hooks/useGlobalContext.ts
"use client"

import { useContext } from "react"
import { GlobalContext } from "../providers/GlobalContext"

export const useGlobalContext = () => {
  const global = useContext(GlobalContext)

  if (!global) {
    throw new Error(
      "useGlobalContext must be used within GlobalContextProvider",
    )
  }

  return global
}
