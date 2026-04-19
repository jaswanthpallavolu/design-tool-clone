import { Router } from "express"
import { asyncHandler } from "../utils/asyncHandler.js"
import prisma from "../db.js"

const router = Router()

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const ownerId = req.query.ownerId as string
    if (!ownerId) {
      res.status(400).json({ error: "ownerId is required" })
    }

    res.json(
      await prisma.design.findMany({
        where: { ownerId },
        include: {
          collaborators: {
            include: {
              user: true,
            },
          },
        },
      }),
    )
  }),
)

router.get(
  "/:designId",
  asyncHandler(async (req, res) => {
    const designId = req.params.designId as string
    res.json(await prisma.design.findUnique({ where: { id: designId } }))
  }),
)

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { userId } = req.body
    const newDesign = await prisma.design.create({
      data: {
        ownerId: userId,
        collaborators: {
          create: {
            userId: userId,
            role: "OWNER",
          },
        },
      },
    })
    res.json(newDesign)
  }),
)

router.post(
  "/:designId/collaborators/:userId",
  asyncHandler(async (req, res) => {
    const designId = req.params.designId as string
    const userId = req.params.userId as string
    const role = req.body.role ?? "VIEWER"
    res.json(
      await prisma.collaborator.create({ data: { designId, userId, role } }),
    )
  }),
)

router.delete(
  "/:designId",
  asyncHandler(async (req, res) => {
    const designId = req.params.designId as string
    const ownerId = req.query.ownerId as string
    res.json(await prisma.design.delete({ where: { id: designId, ownerId } }))
  }),
)

router.patch(
  "/:designId",
  asyncHandler(async (req, res) => {
    const designId = req.params.designId as string
    const ownerId = req.query.ownerId as string
    res.json(
      await prisma.design.update({
        where: { id: designId, ownerId },
        data: { ...req.body },
      }),
    )
  }),
)

export default router
