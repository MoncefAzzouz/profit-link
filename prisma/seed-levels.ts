import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const levels = [
    { levelNumber: 1, name: "المستوى 1 - مبتدئ", targetOrders: 0, reward: "بداية رحلتك في المنصة", color: "blue" },
    { levelNumber: 2, name: "المستوى 2 - نشط", targetOrders: 10, reward: "عمولة أسرع ودعم فني خاص", color: "green" },
    { levelNumber: 3, name: "المستوى 3 - متقدم", targetOrders: 50, reward: "إمكانية طلب دفعات يومية", color: "purple" },
    { levelNumber: 4, name: "المستوى 4 - محترف", targetOrders: 200, reward: "هدايا شهرية ومنتجات حصرية", color: "orange" },
    { levelNumber: 5, name: "المستوى 5 - أسطورة", targetOrders: 500, reward: "عمرة لشخصين + رحلات سياحية", color: "gold" },
  ];

  for (const level of levels) {
    await prisma.affiliateLevel.upsert({
      where: { levelNumber: level.levelNumber },
      update: level,
      create: level,
    });
  }

  console.log('Levels seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
