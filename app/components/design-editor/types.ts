import type { LucideIcon } from "lucide-react"

export type Tool = {
  id: string
  label: string
  icon: LucideIcon
  isActive?: boolean
}

export type ColorSwatch = {
  id: string
  className: string
  isActive?: boolean
}

// Made with Bob
