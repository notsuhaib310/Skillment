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

// Routes
app.use('/api/auth', authRouter);

// Error handling
app.use(errorHandler);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Handle shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
}); 