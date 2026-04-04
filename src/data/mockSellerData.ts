export interface SellerProduct {
  id: string;
  name: string;
  price: number;
  commission: number;
  image: string;
  category: string;
  stock: number;
  totalSales: number;
  status: "active" | "paused" | "out_of_stock";
}

export interface SellerOrder {
  id: string;
  productName: string;
  affiliateName: string;
  customerName: string;
  wilaya: string;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  amount: number;
  commission: number;
  date: string;
  quantity: number;
}

export interface SellerStats {
  totalRevenue: number;
  totalOrders: number;
  confirmedOrders: number;
  cancelledOrders: number;
  confirmationRate: number;
  totalProducts: number;
  activeAffiliates: number;
  pendingOrders: number;
}

export const mockSellerProducts: SellerProduct[] = [
  {
    id: "sp-1",
    name: "ساعة ذكية متعددة الوظائف",
    price: 4500,
    commission: 2250,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500",
    category: "إلكترونيات",
    stock: 150,
    totalSales: 245,
    status: "active",
  },
  {
    id: "sp-2",
    name: "سماعات بلوتوث لاسلكية",
    price: 3200,
    commission: 1600,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
    category: "إلكترونيات",
    stock: 200,
    totalSales: 189,
    status: "active",
  },
  {
    id: "sp-3",
    name: "حقيبة ظهر عصرية",
    price: 2800,
    commission: 1400,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500",
    category: "أزياء",
    stock: 0,
    totalSales: 98,
    status: "out_of_stock",
  },
  {
    id: "sp-4",
    name: "كريم العناية بالبشرة",
    price: 1500,
    commission: 750,
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500",
    category: "جمال",
    stock: 300,
    totalSales: 412,
    status: "active",
  },
];

export const mockSellerOrders: SellerOrder[] = [
  {
    id: "so-001",
    productName: "ساعة ذكية متعددة الوظائف",
    affiliateName: "أحمد بن سالم",
    customerName: "محمد علي",
    wilaya: "الجزائر",
    status: "delivered",
    amount: 4500,
    commission: 2250,
    date: "2024-01-15",
    quantity: 1,
  },
  {
    id: "so-002",
    productName: "سماعات بلوتوث لاسلكية",
    affiliateName: "فاطمة الزهراء",
    customerName: "نور الهدى",
    wilaya: "وهران",
    status: "shipped",
    amount: 3200,
    commission: 1600,
    date: "2024-01-16",
    quantity: 1,
  },
  {
    id: "so-003",
    productName: "كريم العناية بالبشرة",
    affiliateName: "كريم محمودي",
    customerName: "أمينة سعيد",
    wilaya: "عنابة",
    status: "confirmed",
    amount: 4500,
    commission: 2250,
    date: "2024-01-17",
    quantity: 3,
  },
  {
    id: "so-004",
    productName: "ساعة ذكية متعددة الوظائف",
    affiliateName: "سارة بوعلي",
    customerName: "رضا مراد",
    wilaya: "سطيف",
    status: "pending",
    amount: 4500,
    commission: 2250,
    date: "2024-01-18",
    quantity: 1,
  },
  {
    id: "so-005",
    productName: "حقيبة ظهر عصرية",
    affiliateName: "يوسف العمري",
    customerName: "ليلى حمدي",
    wilaya: "قسنطينة",
    status: "cancelled",
    amount: 2800,
    commission: 0,
    date: "2024-01-14",
    quantity: 1,
  },
  {
    id: "so-006",
    productName: "سماعات بلوتوث لاسلكية",
    affiliateName: "أحمد بن سالم",
    customerName: "عمر بوزيان",
    wilaya: "باتنة",
    status: "delivered",
    amount: 3200,
    commission: 1600,
    date: "2024-01-13",
    quantity: 2,
  },
];

export const mockSellerStats: SellerStats = {
  totalRevenue: 2850000,
  totalOrders: 944,
  confirmedOrders: 812,
  cancelledOrders: 45,
  confirmationRate: 86,
  totalProducts: 4,
  activeAffiliates: 67,
  pendingOrders: 23,
};

export const sellerEarningsData = [
  { month: "يناير", revenue: 320000, orders: 85 },
  { month: "فبراير", revenue: 410000, orders: 112 },
  { month: "مارس", revenue: 380000, orders: 98 },
  { month: "أبريل", revenue: 520000, orders: 145 },
  { month: "مايو", revenue: 610000, orders: 168 },
  { month: "يونيو", revenue: 750000, orders: 192 },
];
