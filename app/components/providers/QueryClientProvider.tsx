"use client"
import {
  QueryClient,
  QueryClientProvider as ReactQueryClientProvider,
} from "@tanstack/react-query"

export default function QueryClientProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 2,
        gcTime: 1000 * 60 * 5,
        retry: (failureCount, error) => {
          // Don't retry on network errors (server down)
          if (
            error instanceof Error &&
            error.message.includes("Unable to connect to server")
          ) {
            return false
          }
          // Retry up to 2 times for other errors
          return failureCount < 2
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
      mutations: {
        retry: false, // Don't retry mutations by default
      },
    },
  })
  return (
    <ReactQueryClientProvider client={queryClient}>
      {children}
    </ReactQueryClientProvider>
  )
}
