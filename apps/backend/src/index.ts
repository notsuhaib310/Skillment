import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { config } from 'dotenv';
import authRouter from './routes/auth';
import { errorHandler } from './middleware/errorHandler';
import { PrismaClient } from '@prisma/client';
import cookieParser from 'cookie-parser';
import { CORS_OPTIONS } from './config/constants';

// Load environment variables
config();

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors(CORS_OPTIONS));
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

// Health check endpoint
app.get('/', (_req, res) => {
  res.json({ status: 'WORKING NIGGA DONT CHECK AGAIN', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRouter);

// Error handling
app.use(errorHandler);

// Start server
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

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