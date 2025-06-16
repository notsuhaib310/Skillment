"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const auth_1 = require("../controllers/auth");
const validateRequest_1 = require("../middleware/validateRequest");
const authenticate_1 = require("../middleware/authenticate");
const router = (0, express_1.Router)();
router.post('/register', [
    (0, express_validator_1.body)('email').isEmail().withMessage('Please enter a valid email'),
    (0, express_validator_1.body)('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
    (0, express_validator_1.body)('firstName').notEmpty().withMessage('First name is required'),
    (0, express_validator_1.body)('lastName').notEmpty().withMessage('Last name is required'),
    (0, express_validator_1.body)('orgName').optional(),
    (0, express_validator_1.body)('orgType').optional(),
    (0, express_validator_1.body)('orgSize').optional(),
    validateRequest_1.validateRequest
], auth_1.register);
router.post('/login', [
    (0, express_validator_1.body)('email').isEmail().withMessage('Please enter a valid email'),
    (0, express_validator_1.body)('password').notEmpty().withMessage('Password is required'),
    validateRequest_1.validateRequest
], auth_1.login);
router.post('/logout', authenticate_1.authenticate, auth_1.logout);
router.get('/verify', authenticate_1.authenticate, auth_1.verifySession);
exports.default = router;
//# sourceMappingURL=auth.js.map