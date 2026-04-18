export const fetchUsers = async () => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users`)
  if (!res.ok) throw res
  return res.json()
}

export const fetchUser = async (id: string) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${id}`)
  if (!res.ok) throw res
  return res.json()
}

export const createUser = async (data: { name: string }) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw res
  return res.json()
}

export const deleteUser = async (id: string) => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/users/${id}`,
    {
      method: "DELETE",
    },
  )
  if (!res.ok) throw res
  return res.json()
}
