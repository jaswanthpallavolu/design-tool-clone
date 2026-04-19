import { Router } from "express"
import userRouter from "./user.js"
import designRouter from "./design.js"
import healthRouter from "./health.js"

const router = Router()

router.use("/users", userRouter)
router.use("/designs", designRouter)
router.use("/health", healthRouter)

export default router
