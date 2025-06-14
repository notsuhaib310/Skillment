export const JWT_SECRET = process.env.JWT_SECRET || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30';
export const TOKEN_EXPIRY = 7 * 24 * 60 * 60; // 7 days in seconds

export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: false, // Always false for localhost
  sameSite: 'lax' as const,
  domain: '.localhost',
  path: '/',
}; 