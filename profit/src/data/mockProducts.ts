export interface Product {
  id: string;
  name: string;
  description: string;
  adText: string;
  price: number;
  originalPrice: number;
  commission: number;
  image: string;
  images: string[];
  videoUrl?: string; // New field for video review
  category: string;
  stock: number;
  features: string[];
  isTrend?: boolean; // New: Highlight trending products
  isFeatured?: boolean; // New: Identify special products
  isVisible?: boolean; // New: Toggle display status
  adMaterials?: {
    type: 'image' | 'video' | 'text';
    content: string;
  }[]; // New: Ready-made advertising content
}

export const mockProducts: Product[] = [
  {
    id: "prod-1",
    name: "ساعة ذكية متعددة الوظائف",
    description: "ساعة ذكية أنيقة مع شاشة AMOLED ومقاومة للماء، تتبع اللياقة البدنية ومراقبة النوم والقلب",
    adText: "🔥 العرض المحدود! ساعة ذكية تجمع بين الأناقة والقوة. تتبع صحتك بجهاز واحد. اطلبها الآن واستفد من الخصم!",
    price: 4500,
    originalPrice: 9000,
    commission: 2250,
    image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&q=80",
    images: [
      "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&q=80",
      "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=500&q=80"
    ],
    category: "إلكترونيات",
    stock: 150,
    features: ["شاشة AMOLED", "مقاومة للماء IP68", "بطارية 7 أيام", "تتبع اللياقة"],
    isVisible: true,
    isTrend: true,
    isFeatured: false,
    adMaterials: [
      { type: "image", content: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&q=80" },
      { type: "text", content: "أفضل ساعة ذكية في الجزائر لعام 2024! متوفرة الآن بخصم 50%." }
    ]
  },
  {
    id: "prod-2",
    name: "سماعات بلوتوث لاسلكية",
    description: "سماعات لاسلكية بجودة صوت عالية مع إلغاء الضوضاء وبطارية تدوم 24 ساعة",
    adText: "🎧 عيش تجربة الصوت الحقيقي! سماعات لاسلكية مع ميزة إلغاء الضوضاء. مثالية للرياضة والعمل. توصيل سريع لجميع الولايات.",
    price: 3200,
    originalPrice: 6500,
    commission: 1600,
    image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500&q=80",
    images: [
      "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500&q=80",
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500&q=80"
    ],
    category: "إلكترونيات",
    stock: 200,
    features: ["إلغاء الضوضاء", "بطارية 24 ساعة", "بلوتوث 5.0", "ميكروفون مدمج"],
    isVisible: true,
    isTrend: false,
    isFeatured: true
  },
  {
    id: "prod-3",
    name: "حقيبة ظهر عصرية",
    description: "حقيبة ظهر أنيقة ومتينة مع جيب للحاسوب المحمول ومنفذ USB للشحن",
    adText: "🎒 سافر واعمل بكل راحة! حقيبة ظهر مضادة للسرقة مع منفذ شحن USB. تصميم عصري يناسب الجميع. الكمية محدودة!",
    price: 2800,
    originalPrice: 5600,
    commission: 1400,
    image: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=500&q=80",
    images: [
      "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=500&q=80",
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80"
    ],
    category: "أزياء",
    stock: 80,
    features: ["جيب للحاسوب 15.6\"", "منفذ USB", "مقاومة للماء", "مريحة للظهر"],
    isVisible: true,
    isTrend: false,
    isFeatured: false
  },
  {
    id: "prod-4",
    name: "كريم العناية بالبشرة",
    description: "كريم طبيعي 100% للترطيب العميق ومكافحة التجاعيد مع فيتامين E",
    adText: "✨ بشرة نضرة وشابة دائماً! كريم العناية الطبيعي بمكونات سرية. احصلي على إشراقتك اليوم. اطلبي العرض الخاص الآن.",
    price: 1500,
    originalPrice: 3000,
    commission: 750,
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&q=80",
    images: [
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&q=80",
      "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=500&q=80"
    ],
    category: "جمال",
    stock: 300,
    features: ["طبيعي 100%", "فيتامين E", "ترطيب 24 ساعة", "مضاد للتجاعيد"],
    isVisible: true,
    isTrend: true,
    isFeatured: true
  },
  {
    id: "prod-5",
    name: "مكنسة كهربائية ذكية",
    description: "روبوت تنظيف ذكي مع خرائط ذكية وتحكم عن بعد عبر التطبيق",
    adText: "🤖 خلي البيت ينظف حاله! المكنسة الذكية الأقوى في السوق. توفر عليك الوقت والجهد. تحكم كامل عبر موبايلك.",
    price: 8500,
    originalPrice: 17000,
    commission: 4250,
    image: "https://images.unsplash.com/photo-1518331647614-7a1f04cd34cf?w=500&q=80",
    images: [
      "https://images.unsplash.com/photo-1518331647614-7a1f04cd34cf?w=500&q=80"
    ],
    category: "أجهزة منزلية",
    stock: 50,
    features: ["تحكم بالتطبيق", "خرائط ذكية", "شفط قوي", "بطارية 3 ساعات"],
    isVisible: true,
    isTrend: false,
    isFeatured: false
  },
  {
    id: "prod-6",
    name: "عطر فاخر للرجال",
    description: "عطر فرنسي فاخر بنفحات خشبية وعنبرية تدوم طويلاً",
    adText: "💎 الأناقة في زجاجة! عطر رجالي بتركيبة فريدة وجذابة. يدوم طويلاً ويترك انطباعاً لا ينسى. هدية مثالية لنفسك أو لمن تحب.",
    price: 3500,
    originalPrice: 7000,
    commission: 1750,
    image: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=500&q=80",
    images: [
      "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=500&q=80",
      "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=500&q=80"
    ],
    category: "جمال",
    stock: 120,
    features: ["فرنسي أصلي", "100ml", "يدوم 12 ساعة", "تغليف فاخر"],
    isVisible: true,
    isTrend: false,
    isFeatured: true
  }
];

export const categories = ["الكل", "إلكترونيات", "أزياء", "جمال", "أجهزة منزلية"];
