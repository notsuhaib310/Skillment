import { Router } from "express"
import { PrismaClient } from "@prisma/client"

const router = Router()
const prisma = new PrismaClient()

// Validate organization name availability
router.get("/validate/:orgName", async (req, res) => {
  try {
    const { orgName } = req.params

    console.log(`Backend: Received validation request for orgName: "${orgName}"`)

    // Check if organization name is valid format
    const orgNameRegex = /^[a-zA-Z0-9-]+$/
    if (!orgNameRegex.test(orgName)) {
      console.log(`Backend: Invalid orgName format: "${orgName}"`)
      return res.status(400).json({
        success: false,
        error: "Organization name can only contain letters, numbers, and hyphens"
      })
    }

    // Check if organization name is taken
    const existingOrg = await prisma.organization.findFirst({
      where: {
        name: orgName
      }
    })

    console.log(`Backend: Found existing org: ${existingOrg ? JSON.stringify(existingOrg.name) : "None"}`)

    return res.json({
      success: true,
      available: !existingOrg,
      message: existingOrg ? "Organization name is already taken" : "Organization name is available"
    })
  } catch (error) {
    console.error("Backend: Error validating organization name:", error)
    return res.status(500).json({ success: false, error: "Internal server error" })
  }
})

export default router 