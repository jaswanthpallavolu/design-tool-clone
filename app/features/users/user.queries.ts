import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchUsers, fetchUser, createUser, deleteUser } from "./user.api"

export const useGetUsersQuery = (
  payload = {},
  options: { enabled?: boolean } = {},
) => {
  return useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
    ...options,
  })
}

export const useGetUserQuery = (
  payload: { id: string },
  options: { enabled?: boolean } = {},
) => {
  const id = payload.id
  return useQuery({
    queryKey: ["user", id],
    queryFn: () => fetchUser(id),
    ...options,
  })
}

export const useCreateUserMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
  })
}

export const useDeleteUserMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
  })
}
