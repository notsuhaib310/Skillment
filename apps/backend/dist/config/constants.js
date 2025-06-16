"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CORS_OPTIONS = exports.COOKIE_OPTIONS = exports.TOKEN_EXPIRY = exports.JWT_SECRET = void 0;
exports.JWT_SECRET = process.env.JWT_SECRET || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30"';
exports.TOKEN_EXPIRY = 7 * 24 * 60 * 60;
exports.COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === 'true',
    sameSite: process.env.COOKIE_SAME_SITE,
    domain: process.env.COOKIE_DOMAIN || '.localhost',
    path: '/',
};
exports.CORS_OPTIONS = {
    origin: [
        process.env.FRONTEND_URL || 'http://localhost:3000',
        process.env.DASHBOARD_URL || 'http://localhost:3001',
        'https://*.vercel.app',
        'https://*.skillment.vercel.app'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};
//# sourceMappingURL=constants.js.map