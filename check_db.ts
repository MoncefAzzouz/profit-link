import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const products = await prisma.product.findMany();
  console.log('Products in DB:', JSON.stringify(products, null, 2));
  const orders = await prisma.order.findMany();
  console.log('Orders in DB:', JSON.stringify(orders, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
