export type Collaborator = {
  initials: string
  gradientClassName: string
}

export type Board = {
  id: string
  name: string
  createdAt: string
  collaborators: Collaborator[]
  lastActivity: string
}

export type User = {
  id: string
  name: string
  lastActive: string
  gradientClassName: string
  isActive?: boolean
}

// Made with Bob
