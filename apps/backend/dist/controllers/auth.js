"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifySession = exports.logout = exports.login = exports.register = void 0;
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const errorHandler_1 = require("../middleware/errorHandler");
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30';
const TOKEN_EXPIRY = 7 * 24 * 60 * 60;
const register = async (req, res, next) => {
    try {
        const { email, password, firstName, lastName, orgName, orgType, orgSize } = req.body;
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            throw new errorHandler_1.AppError(400, 'User with this email already exists');
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                firstName,
                lastName,
                orgName,
                orgType,
                orgSize,
            },
        });
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        await prisma.session.create({
            data: {
                userId: user.id,
                token,
                expiresAt,
            },
        });
        res.cookie('auth_token', token, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            domain: '.localhost',
            path: '/',
            maxAge: TOKEN_EXPIRY * 1000,
        });
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                orgName: user.orgName,
                orgType: user.orgType,
                orgSize: user.orgSize,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.register = register;
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            throw new errorHandler_1.AppError(401, 'Invalid email or password');
        }
        const isValidPassword = await bcryptjs_1.default.compare(password, user.password);
        if (!isValidPassword) {
            throw new errorHandler_1.AppError(401, 'Invalid email or password');
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        await prisma.session.create({
            data: {
                userId: user.id,
                token,
                expiresAt,
            },
        });
        res.cookie('auth_token', token, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            domain: '.localhost',
            path: '/',
            maxAge: TOKEN_EXPIRY * 1000,
        });
        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                orgName: user.orgName,
                orgType: user.orgType,
                orgSize: user.orgSize,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.login = login;
const logout = async (req, res, next) => {
    var _a;
    try {
        const token = ((_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1]) || req.cookies.auth_token;
        if (token) {
            await prisma.session.delete({
                where: { token },
            });
        }
        res.clearCookie('auth_token', {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            domain: '.localhost',
            path: '/',
        });
        res.json({
            success: true,
            message: 'Logged out successfully',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.logout = logout;
const verifySession = async (req, res, next) => {
    var _a;
    try {
        const token = ((_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1]) || req.cookies.auth_token;
        if (!token) {
            throw new errorHandler_1.AppError(401, 'No session found');
        }
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        const session = await prisma.session.findFirst({
            where: {
                userId: decoded.userId,
                token,
                expiresAt: {
                    gt: new Date()
                }
            },
            include: { user: true },
        });
        if (!session) {
            throw new errorHandler_1.AppError(401, 'Session expired');
        }
        res.json({
            success: true,
            user: {
                id: session.user.id,
                email: session.user.email,
                firstName: session.user.firstName,
                lastName: session.user.lastName,
                orgName: session.user.orgName,
                orgType: session.user.orgType,
                orgSize: session.user.orgSize,
            },
        });
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            next(new errorHandler_1.AppError(401, 'Invalid token'));
        }
        else {
            next(error);
        }
    }
};
exports.verifySession = verifySession;
//# sourceMappingURL=auth.js.map