import { Router } from "express";
import { EmailController } from "../controllers/email.controller";
import { authenticate } from "../middleware/authenticate";

const router = Router();
const controller = new EmailController();

// Public test route
router.get('/public-test', (req, res) => res.json({ ok: true }));

// Templates CRUD
router.get("/templates", (req, res, next) => { console.log("Public GET /templates hit"); next(); }, controller.getTemplates.bind(controller));
router.post("/templates", authenticate, controller.createTemplate.bind(controller));
router.put("/templates/:id", authenticate, controller.updateTemplate.bind(controller));
router.delete("/templates/:id", authenticate, controller.deleteTemplate.bind(controller));

// Email Logs
router.get("/logs", (req, res, next) => { console.log("Public GET /logs hit"); next(); }, controller.getLogs.bind(controller));
router.get("/logs/:id", authenticate, controller.getLogDetails.bind(controller));

// Send, Draft
router.post("/send", authenticate, controller.sendEmail.bind(controller));
router.post("/draft", authenticate, controller.saveDraft.bind(controller));

// Send Credentials
router.post("/send-credentials", authenticate, controller.sendCredentials.bind(controller));

// Tracking
router.get("/track/open/:logId", controller.trackOpen.bind(controller));
router.get("/track/click/:logId", controller.trackClick.bind(controller));

export default router; 