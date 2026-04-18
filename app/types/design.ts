import type { User } from "./user"

export interface Design {
  id: string
  title: string
  ownerId: string
  createdAt: string
  updatedAt: string
}

export interface Collaborator {
  id: string
  designId: string
  userId: string
  user: User
  role: "OWNER" | "EDITOR" | "VIEWER"
  joinedAt: string
}

export interface DesignWithCollaborators extends Design {
  collaborators: Collaborator[]
}

// Made with Bob
