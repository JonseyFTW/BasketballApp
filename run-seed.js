const { execSync } = require('child_process');
const fs = require('fs');

// Check if seed file exists
if (!fs.existsSync('./prisma/seed.ts')) {
  console.error('Seed file not found!');
  process.exit(1);
}

try {
  console.log('Running database seed...');
  
  // Set environment variable for database connection
  process.env.DATABASE_URL = 'postgresql://postgres:basketball123@localhost:5432/basketball_coach_db';
  
  // Generate Prisma client first
  console.log('Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  // Run the seed
  console.log('Executing seed script...');
  execSync('npx tsx prisma/seed.ts', { stdio: 'inherit' });
  
  console.log('✅ Seed completed successfully!');
  console.log('Demo data created:');
  console.log('  - Teams: ID 1 (Demo Basketball Team), ID 2 (Demo Team Two)');
  console.log('  - Players: ID 1-5 (John Smith, Jane Doe, Sam Johnson, Chris Brown, Alex Davis)');
  console.log('  - Game Plans: ID 1 (vs Lakers), ID 2 (vs Warriors)');
  console.log('  - Plays: Horns Set, Box BLOB');
  
} catch (error) {
  console.error('❌ Seed failed:', error.message);
  process.exit(1);
}