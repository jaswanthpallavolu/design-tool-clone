import { apiRequest } from "../api-client"

export const fetchDesigns = async (ownerId: string) =>
  apiRequest(`/api/designs?ownerId=${ownerId}`)

export const fetchDesign = async (id: string) =>
  apiRequest(`/api/designs/${id}`)

export const createDesign = async (data: { name: string; userId: string }) =>
  apiRequest("/api/designs", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

export const updateDesign = async (
  id: string,
  ownerId: string,
  data: { title?: string },
) =>
  apiRequest(`/api/designs/${id}?ownerId=${ownerId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

export const deleteDesign = async (id: string) =>
  apiRequest(`/api/designs/${id}`, {
    method: "DELETE",
  })

// Made with Bob
