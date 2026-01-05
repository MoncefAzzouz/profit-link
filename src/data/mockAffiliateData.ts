export interface Order {
  id: string;
  productId: string;
  productName: string;
  customerName: string;
  wilaya: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  amount: number;
  commission: number;
  date: string;
}

export interface AffiliateStats {
  totalEarnings: number;
  pendingEarnings: number;
  paidEarnings: number;
  totalOrders: number;
  confirmedOrders: number;
  cancelledOrders: number;
  confirmationRate: number;
  currentLevel: number;
  ordersToNextLevel: number;
}

export const mockOrders: Order[] = [
  {
    id: "ord-001",
    productId: "prod-1",
    productName: "ساعة ذكية متعددة الوظائف",
    customerName: "أحمد بن علي",
    wilaya: "الجزائر",
    status: "delivered",
    amount: 4500,
    commission: 2250,
    date: "2024-01-15"
  },
  {
    id: "ord-002",
    productId: "prod-2",
    productName: "سماعات بلوتوث لاسلكية",
    customerName: "فاطمة محمد",
    wilaya: "وهران",
    status: "confirmed",
    amount: 3200,
    commission: 1600,
    date: "2024-01-16"
  },
  {
    id: "ord-003",
    productId: "prod-3",
    productName: "حقيبة ظهر عصرية",
    customerName: "كريم سعيد",
    wilaya: "قسنطينة",
    status: "shipped",
    amount: 2800,
    commission: 1400,
    date: "2024-01-17"
  },
  {
    id: "ord-004",
    productId: "prod-4",
    productName: "كريم العناية بالبشرة",
    customerName: "سارة أمين",
    wilaya: "عنابة",
    status: "pending",
    amount: 1500,
    commission: 750,
    date: "2024-01-18"
  },
  {
    id: "ord-005",
    productId: "prod-1",
    productName: "ساعة ذكية متعددة الوظائف",
    customerName: "يوسف عمر",
    wilaya: "سطيف",
    status: "cancelled",
    amount: 4500,
    commission: 0,
    date: "2024-01-14"
  },
  {
    id: "ord-006",
    productId: "prod-5",
    productName: "مكنسة كهربائية ذكية",
    customerName: "نور الهدى",
    wilaya: "باتنة",
    status: "delivered",
    amount: 8500,
    commission: 4250,
    date: "2024-01-13"
  }
];

export const mockAffiliateStats: AffiliateStats = {
  totalEarnings: 45750,
  pendingEarnings: 12500,
  paidEarnings: 33250,
  totalOrders: 156,
  confirmedOrders: 142,
  cancelledOrders: 14,
  confirmationRate: 91,
  currentLevel: 2,
  ordersToNextLevel: 8
};

export const wilayas = [
  "أدرار", "الشلف", "الأغواط", "أم البواقي", "باتنة", "بجاية", "بسكرة", "بشار",
  "البليدة", "البويرة", "تمنراست", "تبسة", "تلمسان", "تيارت", "تيزي وزو", "الجزائر",
  "الجلفة", "جيجل", "سطيف", "سعيدة", "سكيكدة", "سيدي بلعباس", "عنابة", "قالمة",
  "قسنطينة", "المدية", "مستغانم", "المسيلة", "معسكر", "ورقلة", "وهران", "البيض",
  "إليزي", "برج بوعريريج", "بومرداس", "الطارف", "تندوف", "تسمسيلت", "الوادي",
  "خنشلة", "سوق أهراس", "تيبازة", "ميلة", "عين الدفلى", "النعامة", "عين تموشنت",
  "غرداية", "غليزان", "تيميمون", "برج باجي مختار", "أولاد جلال", "بني عباس",
  "عين صالح", "عين قزام", "تقرت", "جانت", "المغير", "المنيعة"
];
