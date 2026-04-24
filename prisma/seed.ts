import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding (JS version)...');

  // 1. Create a demo affiliate user
  const affiliate = await prisma.user.upsert({
    where: { email: 'demo@affiliate.com' },
    update: {},
    create: {
      id: 'aff-demo-123',
      name: 'أحمد بن علي (تجريبي)',
      email: 'demo@affiliate.com',
      passwordHash: 'placeholder',
      phone: '0555112233',
      role: 'AFFILIATE'
    }
  });
  console.log('✅ Affiliate created:', affiliate.id);

  // 2. Create mock products
  const products = [
    {
      id: "prod-1",
      name: "ساعة ذكية متعددة الوظائف",
      description: "ساعة ذكية أنيقة مع شاشة AMOLED ومقاومة للماء",
      price: 4500,
      originalPrice: 9000,
      commission: 2250,
      images: ["https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&q=80"],
      category: "إلكترونيات",
      stock: 150,
      status: "active"
    },
    {
      id: "prod-2",
      name: "سماعات بلوتوث لاسلكية",
      description: "سماعات لاسلكية بجودة صوت عالية مع إلغاء الضوضاء",
      price: 3200,
      originalPrice: 6500,
      commission: 1600,
      images: ["https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500&q=80"],
      category: "إلكترونيات",
      stock: 200,
      status: "active"
    },
    {
      id: "prod-3",
      name: "حقيبة ظهر عصرية",
      description: "حقيبة ظهر أنيقة ومتينة مع جيب للحاسوب المحمول",
      price: 2800,
      originalPrice: 5600,
      commission: 1400,
      images: ["https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=500&q=80"],
      category: "أزياء",
      stock: 80,
      status: "active"
    },
    {
      id: "prod-4",
      name: "كريم العناية بالبشرة",
      description: "كريم طبيعي 100% للترطيب العميق ومكافحة التجاعيد",
      price: 1500,
      originalPrice: 3000,
      commission: 750,
      images: ["https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&q=80"],
      category: "جمال",
      stock: 300,
      status: "active"
    }
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { id: product.id },
      update: product,
      create: product
    });
  }
  console.log(`✅ ${products.length} products seeded.`);

  // 3. Create affiliate levels
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
  console.log(`✅ ${levels.length} levels seeded.`);

  console.log('🚀 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
