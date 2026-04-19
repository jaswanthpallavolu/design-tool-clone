import { Router } from "express"
import prisma from "../db.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const router = Router()

// GET /api/health/db
router.get(
  "/db",
  asyncHandler(async (req, res) => {
    const result = await prisma.$queryRaw`SELECT NOW()`
    res.json({
      status: "connected",
      database: "postgresql",
      timestamp: result,
    })
  }),
)

// GET /api/health (general health check)
router.get("/", (req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  })
})

export default router

// Made with Bob
