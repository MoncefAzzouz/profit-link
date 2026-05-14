const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const p = await prisma.product.findMany({ select: { id: true, name: true, hasLandingPage: true }});
  console.log(p);
}
main().catch(console.error).finally(() => prisma.$disconnect());
