import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    // Add the logo column if it doesn't exist
    await prisma.$executeRaw`
      ALTER TABLE "Organization" 
      ADD COLUMN IF NOT EXISTS "logo" TEXT;
    `;
    
    console.log('Successfully added logo column to Organization table');
  } catch (error) {
    console.error('Error adding logo column:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
