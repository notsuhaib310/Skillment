import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    // Get the column information for the Organization table
    const columns = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'Organization';
    `;
    
    console.log('Organization table columns:');
    console.table(columns);
    
    // Check if logo column exists
    const logoColumnExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'Organization' 
        AND column_name = 'logo'
      ) as "exists";
    `;
    
    console.log('\nLogo column exists:', logoColumnExists[0].exists);
    
    if (!logoColumnExists[0].exists) {
      console.log('\nAdding logo column...');
      await prisma.$executeRaw`
        ALTER TABLE "Organization" 
        ADD COLUMN "logo" TEXT;
      `;
      console.log('Successfully added logo column');
    }
  } catch (error) {
    console.error('Error checking organization schema:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
