import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { config } from 'dotenv';
import authRouter from './routes/auth';
import userRouter from './routes/user.routes';
import participantsRouter from './routes/participants';
import organizationsRouter from './routes/organizations';
import assessmentRouter from './routes/assessment.routes';
import billingRouter from './routes/billing.routes';
import { errorHandler } from './middleware/errorHandler';
import { PrismaClient } from '@prisma/client';
import cookieParser from 'cookie-parser';
import questionRouter from './routes/question.routes';
import attemptRouter from './routes/attempt.routes';
import candidateAssessmentRouter from './routes/candidate-assessment.routes';
import emailRoutes from './routes/email.routes';
import candidateRouter from './routes/candidate.routes';
import candidatePublicRouter from './routes/candidate-public.routes';
import proctoringRouter from './routes/proctoring.routes';
import adminProctoringRouter from './routes/admin-proctoring.routes';
import reportsRouter from './routes/reports.routes';

// Load environment variables
config();

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    /^http:\/\/([a-z0-9-]+\.)*localhost:3001$/, // Allow subdomains of localhost:3001
    'https://app.skillment.in',
    /^https:\/\/([a-z0-9-]+\.)*skillment\.in$/, // Allow subdomains of skillment.in
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], // Add PATCH
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

// Health check endpoint
app.get('/', (_req, res) => {
  res.json({ status: 'okna', timestamp: new Date().toISOString() });
});

// Routes
// Mount public candidate login route FIRST to guarantee it is always public
app.use('/api/candidates', candidatePublicRouter);
// Mount public proctoring routes for candidate exam monitoring (no auth required)
app.use('/api/proctoring', proctoringRouter);
// IMPORTANT: Do NOT apply any global authentication middleware here.
// /api/candidates/login must remain public for candidate login to work.
app.use('/api/candidate-assessment', candidateAssessmentRouter);
app.use('/api/assessments', assessmentRouter);
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/participants', participantsRouter);
app.use('/api/organizations', organizationsRouter);
app.use('/api/billing', billingRouter);
app.use('/api/team', require('./routes/team').default);
app.use('/api', questionRouter);
app.use('/api', attemptRouter);
app.use('/api/email', emailRoutes);
// Mount protected candidate routes at a different path to avoid conflicts
app.use('/api/admin/candidates', candidateRouter);
// Mount protected admin proctoring routes
app.use('/api/admin/proctoring', adminProctoringRouter);
// Mount reports routes
app.use('/api/reports', reportsRouter);

// Error handling
app.use(errorHandler);

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default app;

// Handle shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
}); 