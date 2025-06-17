import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    // Try to query the logo column
    const org = await prisma.organization.findFirst({
      select: {
        id: true,
        name: true,
        logo: true
      },
      take: 1
    });

    console.log('Organization with logo:', org);
    console.log('Logo column exists and is accessible');
  } catch (error) {
    if (error.code === '42703') { // Undefined column
      console.log('Logo column does not exist. Attempting to add it...');
      
      try {
        await prisma.$executeRaw`
          ALTER TABLE "Organization" 
          ADD COLUMN IF NOT EXISTS "logo" TEXT;
        `;
        console.log('Successfully added logo column to Organization table');
      } catch (addError) {
        console.error('Failed to add logo column:', addError);
      }
    } else {
      console.error('Error checking logo column:', error);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main();
