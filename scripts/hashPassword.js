const bcrypt = require('bcryptjs');

/**
 * CLI tool to securely hash passwords for the Admin model using bcryptjs.
 * Usage: node scripts/hashPassword.js [your_password]
 */
async function main() {
  const plainPassword = process.argv[2] || 'admin123';
  
  console.log('🌱 Generating password hash...');
  
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(plainPassword, salt);
  
  console.log('\n==================================================');
  console.log('      SECURE BCRYPT PASSWORD HASH GENERATOR      ');
  console.log('==================================================');
  console.log(`Original: ${plainPassword}`);
  console.log(`Hash:     ${hashedPassword}`);
  console.log('==================================================\n');
  console.log('You can now copy the Hash value above and insert it');
  console.log('into the "Admin" model inside Prisma Studio or your SQL client.');
}

main().catch((err) => {
  console.error('Error generating hash:', err);
  process.exit(1);
});
