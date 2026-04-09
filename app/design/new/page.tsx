import { redirect } from "next/navigation"
import { nanoid } from "nanoid"

export default function NewDesign() {
  const sessionId = nanoid(10)
  // 1. Save to DB: await db.design.create({ data: { id: sessionId, state: {} } })
  redirect(`/design/${sessionId}`)
}
