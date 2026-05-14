const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  await prisma.product.update({ where: { id: 'prod-1' }, data: { hasLandingPage: true } });
  console.log("Set to true");
  let p = await prisma.product.findUnique({ where: { id: 'prod-1' } });
  console.log("DB value:", p.hasLandingPage);

  await prisma.product.update({ where: { id: 'prod-1' }, data: { hasLandingPage: false } });
  console.log("Set to false");
  p = await prisma.product.findUnique({ where: { id: 'prod-1' } });
  console.log("DB value:", p.hasLandingPage);
}
run().catch(console.error).finally(() => process.exit(0));
