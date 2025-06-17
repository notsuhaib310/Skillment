import { Router } from "express"
import { ParticipantController } from "../controllers/participant.controller"
import { authenticate } from "../middleware/authenticate"

const router = Router()

// Apply authentication middleware to all routes
router.use(authenticate)

const participantController = new ParticipantController();

// Get all participants with pagination and filters
router.get("/", participantController.getParticipants.bind(participantController))

// Get a single participant
router.get("/:id", participantController.getParticipant.bind(participantController))

// Create a new participant
router.post("/", participantController.createParticipant.bind(participantController))

// Update a participant
router.put("/:id", participantController.updateParticipant.bind(participantController))

// Delete a participant
router.delete("/:id", participantController.deleteParticipant.bind(participantController))

// Add assessment fora participant

export default router 