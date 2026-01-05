export interface Affiliate {
  id: string;
  name: string;
  email: string;
  phone: string;
  level: number;
  totalOrders: number;
  confirmedOrders: number;
  totalEarnings: number;
  pendingEarnings: number;
  status: "active" | "suspended" | "pending";
  joinDate: string;
  confirmationRate: number;
}

export interface AdminStats {
  totalAffiliates: number;
  activeAffiliates: number;
  totalOrders: number;
  confirmedOrders: number;
  totalRevenue: number;
  totalCommissions: number;
  averageConfirmationRate: number;
  ordersThisMonth: number;
}

export const mockAffiliates: Affiliate[] = [
  {
    id: "aff-001",
    name: "أحمد بن سالم",
    email: "ahmed@email.com",
    phone: "0555123456",
    level: 3,
    totalOrders: 156,
    confirmedOrders: 142,
    totalEarnings: 245000,
    pendingEarnings: 12500,
    status: "active",
    joinDate: "2023-08-15",
    confirmationRate: 91,
  },
  {
    id: "aff-002",
    name: "فاطمة الزهراء",
    email: "fatima@email.com",
    phone: "0666789012",
    level: 2,
    totalOrders: 89,
    confirmedOrders: 78,
    totalEarnings: 125000,
    pendingEarnings: 8500,
    status: "active",
    joinDate: "2023-10-20",
    confirmationRate: 88,
  },
  {
    id: "aff-003",
    name: "كريم محمودي",
    email: "karim@email.com",
    phone: "0777345678",
    level: 1,
    totalOrders: 23,
    confirmedOrders: 18,
    totalEarnings: 32000,
    pendingEarnings: 4500,
    status: "active",
    joinDate: "2024-01-05",
    confirmationRate: 78,
  },
  {
    id: "aff-004",
    name: "سارة بوعلي",
    email: "sara@email.com",
    phone: "0558901234",
    level: 2,
    totalOrders: 67,
    confirmedOrders: 45,
    totalEarnings: 78000,
    pendingEarnings: 6200,
    status: "suspended",
    joinDate: "2023-11-10",
    confirmationRate: 67,
  },
  {
    id: "aff-005",
    name: "يوسف العمري",
    email: "youssef@email.com",
    phone: "0699567890",
    level: 1,
    totalOrders: 12,
    confirmedOrders: 10,
    totalEarnings: 18500,
    pendingEarnings: 2800,
    status: "pending",
    joinDate: "2024-01-12",
    confirmationRate: 83,
  },
];

export const mockAdminStats: AdminStats = {
  totalAffiliates: 156,
  activeAffiliates: 142,
  totalOrders: 4567,
  confirmedOrders: 3890,
  totalRevenue: 12500000,
  totalCommissions: 5800000,
  averageConfirmationRate: 85,
  ordersThisMonth: 456,
};

export const mockAllOrders = [
  {
    id: "ord-001",
    affiliateId: "aff-001",
    affiliateName: "أحمد بن سالم",
    productId: "prod-1",
    productName: "ساعة ذكية متعددة الوظائف",
    customerName: "محمد علي",
    customerPhone: "0555111222",
    wilaya: "الجزائر",
    address: "حي السلام، شارع الأمير",
    status: "delivered",
    amount: 4500,
    commission: 2250,
    date: "2024-01-15",
    quantity: 1,
  },
  {
    id: "ord-002",
    affiliateId: "aff-002",
    affiliateName: "فاطمة الزهراء",
    productId: "prod-2",
    productName: "سماعات بلوتوث لاسلكية",
    customerName: "نور الهدى",
    customerPhone: "0666333444",
    wilaya: "وهران",
    address: "شارع لارbi بن مهيدي",
    status: "shipped",
    amount: 3200,
    commission: 1600,
    date: "2024-01-16",
    quantity: 1,
  },
  {
    id: "ord-003",
    affiliateId: "aff-001",
    affiliateName: "أحمد بن سالم",
    productId: "prod-3",
    productName: "حقيبة ظهر عصرية",
    customerName: "ياسين بوزيد",
    customerPhone: "0777555666",
    wilaya: "قسنطينة",
    address: "حي زيغود يوسف",
    status: "pending",
    amount: 2800,
    commission: 1400,
    date: "2024-01-17",
    quantity: 2,
  },
  {
    id: "ord-004",
    affiliateId: "aff-003",
    affiliateName: "كريم محمودي",
    productId: "prod-4",
    productName: "كريم العناية بالبشرة",
    customerName: "أمينة سعيد",
    customerPhone: "0558777888",
    wilaya: "عنابة",
    address: "شارع الاستقلال",
    status: "confirmed",
    amount: 1500,
    commission: 750,
    date: "2024-01-18",
    quantity: 3,
  },
  {
    id: "ord-005",
    affiliateId: "aff-004",
    affiliateName: "سارة بوعلي",
    productId: "prod-5",
    productName: "مكنسة كهربائية ذكية",
    customerName: "رضا مراد",
    customerPhone: "0699999000",
    wilaya: "سطيف",
    address: "حي 1000 مسكن",
    status: "cancelled",
    amount: 8500,
    commission: 0,
    date: "2024-01-14",
    quantity: 1,
  },
];
