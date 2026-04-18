import { Router } from "express"
import prisma from "../db"
import { asyncHandler } from "../utils/asyncHandler"

const router = Router()

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const users = await prisma.user.findMany()
    res.json(users)
  }),
)

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = req.params.id as string
    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) {
      res.status(404).json({
        error: "User not found",
        message: `No user exists with id: ${id}`,
      })
    }
    res.json(user)
  }),
)

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { name } = req.body
    const newUser = await prisma.user.create({ data: { name } })
    res.json(newUser)
  }),
)

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params
    const user = await prisma.user.delete({ where: { id: String(id) } })
    res.json(user)
  }),
)

export default router
