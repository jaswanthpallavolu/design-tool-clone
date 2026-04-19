import { apiRequest } from "../api-client"

export const fetchUsers = async () => apiRequest("/api/users")

export const fetchUser = async (id: string) => apiRequest(`/api/users/${id}`)

export const createUser = async (data: { name: string }) =>
  apiRequest("/api/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

export const deleteUser = async (id: string) =>
  apiRequest(`/api/users/${id}`, {
    method: "DELETE",
  })
