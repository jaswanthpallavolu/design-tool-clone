const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

export const apiRequest = async (path: string, init?: RequestInit) => {
  try {
    const res = await fetch(`${API_BASE_URL}${path}`, init)
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`)
    }
    return res.json()
  } catch (error) {
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error(
        "Unable to connect to server. Please check if the API server is running.",
      )
    }
    throw error
  }
}

// Made with Bob
