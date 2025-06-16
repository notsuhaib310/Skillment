"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const participants_1 = require("../controllers/participants");
const router = (0, express_1.Router)();
router.get('/', participants_1.getParticipants);
router.post('/', participants_1.addParticipant);
router.get('/:id', participants_1.getParticipantById);
exports.default = router;
//# sourceMappingURL=participants.js.map