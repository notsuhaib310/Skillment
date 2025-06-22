import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Checking organization data for "kd"...');
    
    // Find organization with case-insensitive name match
    const organization = await prisma.organization.findFirst({
      where: {
        name: {
          equals: 'kd',
          mode: 'insensitive',
        },
      },
    });

    if (!organization) {
      console.log('Organization "kd" not found');
      return;
    }

    console.log('Organization found:');
    console.log('ID:', organization.id);
    console.log('Name:', organization.name);
    console.log('Display Name:', organization.displayName);
    console.log('Type:', organization.type);
    console.log('Size:', organization.size);
    console.log('Plan:', organization.plan);
    console.log('Logo:', organization.logo);
    console.log('Created At:', organization.createdAt);
    console.log('Updated At:', organization.updatedAt);
    
    console.log('\nFull organization object:');
    console.log(JSON.stringify(organization, null, 2));
    
  } catch (error) {
    console.error('Error checking organization data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 