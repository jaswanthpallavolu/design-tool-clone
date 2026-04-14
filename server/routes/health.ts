import { Router } from "express"
import prisma from "../db.js"

const router = Router()

// GET /api/health/db
router.get("/db", async (req, res) => {
  try {
    const result = await prisma.$queryRaw`SELECT NOW()`
    res.json({
      status: "connected",
      database: "postgresql",
      timestamp: result,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      status: "disconnected",
      error: "Database connection failed",
    })
  }
})

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
