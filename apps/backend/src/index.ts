import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { config } from 'dotenv';
import authRouter from './routes/auth';
import participantsRouter from './routes/participants';
import organizationsRouter from './routes/organizations';
import assessmentRouter from './routes/assessment.routes';
import { errorHandler } from './middleware/errorHandler';
import { PrismaClient } from '@prisma/client';
import cookieParser from 'cookie-parser';

// Load environment variables
config();

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: [
    "http://localhost:3000", 
    "http://localhost:3001", 
    "http://kd.localhost:3001",
    'http://kingboi.localhost:3001',
    "http://*.localhost:3001",
    "https://skillment.in",
    "https://*.skillment.in"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
}));
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

// Health check endpoint
app.get('/', (_req, res) => {
  res.json({ status: 'okna', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/participants', participantsRouter);
app.use('/api/organizations', organizationsRouter);
app.use('/api/assessments', assessmentRouter);
app.use('/api/team', require('./routes/team').default);

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