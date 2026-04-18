import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  fetchDesigns,
  fetchDesign,
  createDesign,
  updateDesign,
  deleteDesign,
} from "./design.api"

export const useGetDesignsQuery = (
  payload: { ownerId: string },
  options: { enabled?: boolean } = {},
) => {
  const ownerId = payload.ownerId
  return useQuery({
    queryKey: ["designs", ownerId],
    queryFn: () => fetchDesigns(ownerId),
    ...options,
  })
}

export const useGetDesignQuery = (
  payload: { id: string },
  options: { enabled?: boolean } = {},
) => {
  const id = payload.id
  return useQuery({
    queryKey: ["design", id],
    queryFn: () => fetchDesign(id),
    ...options,
  })
}

export const useCreateDesignMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createDesign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["designs"] })
    },
  })
}

export const useUpdateDesignMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      ownerId,
      data,
    }: {
      id: string
      ownerId: string
      data: { title?: string }
    }) => updateDesign(id, ownerId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["designs"] })
      queryClient.invalidateQueries({ queryKey: ["design", variables.id] })
    },
  })
}

export const useDeleteDesignMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteDesign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["designs"] })
    },
  })
}

// Made with Bob
