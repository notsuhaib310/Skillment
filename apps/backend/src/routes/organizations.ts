import { Router } from "express"
import { PrismaClient } from "@prisma/client"

const router = Router()
const prisma = new PrismaClient()

// Validate organization name
router.get("/validate/:orgName", async (req, res) => {
  try {
    const { orgName } = req.params

    const organization = await prisma.organization.findFirst({
      where: {
        name: orgName,
      },
    })

    return res.json({
      exists: !!organization,
    })
  } catch (error) {
    console.error("Error validating organization:", error)
    return res.status(500).json({
      error: "Internal server error",
    })
  }
})

export default router 