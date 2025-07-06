const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDuplicates() {
  try {
    console.log('Checking duplicate email credentials...\n');
    
    // Find emails that have multiple credentials
    const credentials = await prisma.credential.findMany({
      select: { candidateId: true, email: true, createdAt: true },
      orderBy: { createdAt: 'asc' }
    });
    
    const emailGroups = {};
    credentials.forEach(cred => {
      if (!emailGroups[cred.email]) {
        emailGroups[cred.email] = [];
      }
      emailGroups[cred.email].push(cred);
    });
    
    const duplicateEmails = Object.entries(emailGroups).filter(([email, creds]) => creds.length > 1);
    
    console.log('Emails with multiple credentials:');
    if (duplicateEmails.length === 0) {
      console.log('No duplicate emails found.');
    } else {
      for (const [email, creds] of duplicateEmails) {
        console.log(`\nEmail: ${email} (${creds.length} credentials)`);
        creds.forEach((cred, i) => {
          console.log(`  ${i+1}. CandidateID: ${cred.candidateId} | Created: ${cred.createdAt}`);
        });
        
        // Also check candidates for this email
        const candidates = await prisma.candidate.findMany({
          where: { email: email },
          include: { assessment: { select: { title: true } } },
          orderBy: { createdAt: 'asc' }
        });
        
        console.log(`    Candidates for ${email}:`);
        candidates.forEach((candidate, i) => {
          console.log(`      ${i+1}. Assessment: ${candidate.assessment.title} | Status: ${candidate.status}`);
        });
      }
    }
    
    console.log(`\nSummary: Found ${duplicateEmails.length} emails with multiple credentials`);
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

checkDuplicates(); 