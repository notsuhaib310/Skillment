import { Router } from "express"
import { PrismaClient } from "@prisma/client"
import { OrganizationController } from "../controllers/organization.controller"
import { authenticate } from "../middleware/authenticate"
import multer from "multer"
import { Request } from "express"

const router = Router()
const prisma = new PrismaClient()
const organizationController = new OrganizationController()

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit
  },
  fileFilter: (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Only image files are allowed'))
    }
  },
})

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
        exists: false,
        available: false,
        error: "Organization name can only contain letters, numbers, and hyphens"
      })
    }

    console.log(`Backend: Checking if org exists (case-insensitive): ${orgName}`)
    
    // Check if organization name is taken (case-insensitive)
    const existingOrg = await prisma.organization.findFirst({
      where: {
        name: {
          equals: orgName,
          mode: 'insensitive'
        }
      },
      select: {
        id: true,
        name: true
      }
    })
    
    console.log('Backend: Found existing org:', existingOrg ? existingOrg.name : 'None')

    return res.json({
      success: true,
      exists: !!existingOrg,
      available: !existingOrg,
      message: existingOrg ? "Organization name is already taken" : "Organization name is available"
    })
  } catch (error) {
    console.error("Backend: Error validating organization name:", error)
    return res.status(500).json({ 
      success: false, 
      exists: false,
      available: false,
      error: "Internal server error" 
    })
  }
})

// Apply authentication middleware to all routes below
router.use(authenticate)

// Get organization details
router.get("/:orgName", organizationController.getOrganization.bind(organizationController))

// Update organization details
router.put("/:orgName", organizationController.updateOrganization.bind(organizationController))

// Upload organization logo
router.post("/:orgName/logo", upload.single('logo'), organizationController.uploadLogo.bind(organizationController))

export default router 