export const fetchDesigns = async (ownerId: string) => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/designs?ownerId=${ownerId}`,
  )
  if (!res.ok) throw res
  return res.json()
}

export const fetchDesign = async (id: string) => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/designs/${id}`,
  )
  if (!res.ok) throw res
  return res.json()
}

export const createDesign = async (data: { name: string; userId: string }) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/designs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw res
  return res.json()
}

export const updateDesign = async (
  id: string,
  ownerId: string,
  data: { title?: string },
) => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/designs/${id}?ownerId=${ownerId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    },
  )
  if (!res.ok) throw res
  return res.json()
}

export const deleteDesign = async (id: string) => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/designs/${id}`,
    {
      method: "DELETE",
    },
  )
  if (!res.ok) throw res
  return res.json()
}

// Made with Bob
