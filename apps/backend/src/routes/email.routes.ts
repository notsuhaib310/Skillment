import { Router } from "express";
import { EmailController } from "../controllers/email.controller";

const router = Router();
const controller = new EmailController();

// Templates CRUD
router.get("/templates", controller.getTemplates.bind(controller));
router.post("/templates", controller.createTemplate.bind(controller));
router.put("/templates/:id", controller.updateTemplate.bind(controller));
router.delete("/templates/:id", controller.deleteTemplate.bind(controller));

// Email Logs
router.get("/logs", controller.getLogs.bind(controller));
router.get("/logs/:id", controller.getLogDetails.bind(controller));

// Send, Draft
router.post("/send", controller.sendEmail.bind(controller));
router.post("/draft", controller.saveDraft.bind(controller));

// Send Credentials
router.post("/send-credentials", controller.sendCredentials.bind(controller));

// Tracking
router.get("/track/open/:logId", controller.trackOpen.bind(controller));
router.get("/track/click/:logId", controller.trackClick.bind(controller));

export default router; 