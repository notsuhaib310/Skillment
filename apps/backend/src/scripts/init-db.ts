import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

// Load environment variables
config();

const prisma = new PrismaClient();

async function main() {
  try {
    // Create tables
    console.log('Creating database tables...');
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "User" (
        "id" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "password" TEXT NOT NULL,
        "firstName" TEXT NOT NULL,
        "lastName" TEXT NOT NULL,
        "role" TEXT NOT NULL DEFAULT 'user',
        "orgName" TEXT,
        "orgType" TEXT,
        "orgSize" TEXT,
        "emailVerified" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "User_pkey" PRIMARY KEY ("id")
      );

      CREATE TABLE IF NOT EXISTS "Session" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "token" TEXT NOT NULL,
        "expiresAt" TIMESTAMP(3) NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
      );

      CREATE TABLE IF NOT EXISTS "VerificationToken" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "token" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "expiresAt" TIMESTAMP(3) NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "VerificationToken_pkey" PRIMARY KEY ("id")
      );

      CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
      CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");
      CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");
    `;

    console.log('Database tables created successfully!');
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 