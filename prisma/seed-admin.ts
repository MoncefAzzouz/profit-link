import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@admin.fr';
  const password = 'admin123.';
  const name = 'Admin';

  // Check if already exists
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    // Update role to ADMIN if not already
    await prisma.user.update({ where: { email }, data: { role: 'ADMIN' } });
    console.log('✅ User already exists — role updated to ADMIN');
  } else {
    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: { email, passwordHash, name, role: 'ADMIN' }
    });
    console.log('✅ Admin account created successfully!');
  }

  console.log(`   Email: ${email}`);
  console.log(`   Password: ${password}`);
  console.log(`   Role: ADMIN`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
