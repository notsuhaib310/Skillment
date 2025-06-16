import { Router } from "express"
import { participantController } from "../controllers/participant.controller"
import { authenticate } from "../middleware/authenticate"

const router = Router()

// Apply authentication middleware to all routes
router.use(authenticate)

// Get all participants with pagination and filters
router.get("/", participantController.getParticipants)

// Get a single participant
router.get("/:id", participantController.getParticipant)

// Create a new participant
router.post("/", participantController.createParticipant)

// Update a participant
router.put("/:id", participantController.updateParticipant)

// Delete a participant
router.delete("/:id", participantController.deleteParticipant)

// Add assessment for a participant
router.post("/:id/assessments", participantController.addAssessment)

export default router 