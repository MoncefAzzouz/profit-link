export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  commission: number;
  image: string;
  images: string[];
  category: string;
  stock: number;
  features: string[];
}

export const mockProducts: Product[] = [
  {
    id: "prod-1",
    name: "ساعة ذكية متعددة الوظائف",
    description: "ساعة ذكية أنيقة مع شاشة AMOLED ومقاومة للماء، تتبع اللياقة البدنية ومراقبة النوم والقلب",
    price: 4500,
    originalPrice: 9000,
    commission: 2250,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500",
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500",
      "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500"
    ],
    category: "إلكترونيات",
    stock: 150,
    features: ["شاشة AMOLED", "مقاومة للماء IP68", "بطارية 7 أيام", "تتبع اللياقة"]
  },
  {
    id: "prod-2",
    name: "سماعات بلوتوث لاسلكية",
    description: "سماعات لاسلكية بجودة صوت عالية مع إلغاء الضوضاء وبطارية تدوم 24 ساعة",
    price: 3200,
    originalPrice: 6500,
    commission: 1600,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500"
    ],
    category: "إلكترونيات",
    stock: 200,
    features: ["إلغاء الضوضاء", "بطارية 24 ساعة", "بلوتوث 5.0", "ميكروفون مدمج"]
  },
  {
    id: "prod-3",
    name: "حقيبة ظهر عصرية",
    description: "حقيبة ظهر أنيقة ومتينة مع جيب للحاسوب المحمول ومنفذ USB للشحن",
    price: 2800,
    originalPrice: 5600,
    commission: 1400,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500",
    images: [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500",
      "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=500"
    ],
    category: "أزياء",
    stock: 80,
    features: ["جيب للحاسوب 15.6\"", "منفذ USB", "مقاومة للماء", "مريحة للظهر"]
  },
  {
    id: "prod-4",
    name: "كريم العناية بالبشرة",
    description: "كريم طبيعي 100% للترطيب العميق ومكافحة التجاعيد مع فيتامين E",
    price: 1500,
    originalPrice: 3000,
    commission: 750,
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500",
    images: [
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500",
      "https://images.unsplash.com/photo-1570194065650-d99fb4ee4907?w=500"
    ],
    category: "جمال",
    stock: 300,
    features: ["طبيعي 100%", "فيتامين E", "ترطيب 24 ساعة", "مضاد للتجاعيد"]
  },
  {
    id: "prod-5",
    name: "مكنسة كهربائية ذكية",
    description: "روبوت تنظيف ذكي مع خرائط ذكية وتحكم عن بعد عبر التطبيق",
    price: 8500,
    originalPrice: 17000,
    commission: 4250,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500",
    images: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500"
    ],
    category: "أجهزة منزلية",
    stock: 50,
    features: ["تحكم بالتطبيق", "خرائط ذكية", "شفط قوي", "بطارية 3 ساعات"]
  },
  {
    id: "prod-6",
    name: "عطر فاخر للرجال",
    description: "عطر فرنسي فاخر بنفحات خشبية وعنبرية تدوم طويلاً",
    price: 3500,
    originalPrice: 7000,
    commission: 1750,
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=500",
    images: [
      "https://images.unsplash.com/photo-1541643600914-78b084683601?w=500",
      "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=500"
    ],
    category: "جمال",
    stock: 120,
    features: ["فرنسي أصلي", "100ml", "يدوم 12 ساعة", "تغليف فاخر"]
  }
];

export const categories = ["الكل", "إلكترونيات", "أزياء", "جمال", "أجهزة منزلية"];
