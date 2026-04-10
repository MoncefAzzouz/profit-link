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

export interface WithdrawalRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  requesterType: "affiliate" | "seller";
  amount: number;
  method: "CCP" | "Baridimob";
  accountDetails: string;
  status: "pending" | "completed" | "rejected";
  date: string;
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

export interface Seller {
  id: string;
  name: string;
  email: string;
  phone: string;
  storeName: string;
  wilaya: string;
  category: string;
  totalProducts: number;
  totalRevenue: number;
  totalOrders: number;
  status: "active" | "suspended" | "pending";
  joinDate: string;
}

export const mockSellers: Seller[] = [
  {
    id: "seller-001",
    name: "عبد الرحمن بلقاسم",
    email: "abdelrahman@store.com",
    phone: "0550123456",
    storeName: "متجر التقنية",
    wilaya: "الجزائر",
    category: "إلكترونيات",
    totalProducts: 12,
    totalRevenue: 4500000,
    totalOrders: 890,
    status: "active",
    joinDate: "2023-06-10",
  },
  {
    id: "seller-002",
    name: "نادية مرابط",
    email: "nadia@beauty.com",
    phone: "0661234567",
    storeName: "بيوتي شوب",
    wilaya: "وهران",
    category: "جمال",
    totalProducts: 8,
    totalRevenue: 2100000,
    totalOrders: 567,
    status: "active",
    joinDate: "2023-09-22",
  },
  {
    id: "seller-003",
    name: "محمد أمين حداد",
    email: "amine@fashion.com",
    phone: "0772345678",
    storeName: "فاشن ستور",
    wilaya: "قسنطينة",
    category: "أزياء",
    totalProducts: 15,
    totalRevenue: 3200000,
    totalOrders: 723,
    status: "active",
    joinDate: "2023-07-15",
  },
  {
    id: "seller-004",
    name: "سمية بوخالفة",
    email: "soumia@home.com",
    phone: "0553456789",
    storeName: "بيت الراحة",
    wilaya: "سطيف",
    category: "أجهزة منزلية",
    totalProducts: 6,
    totalRevenue: 890000,
    totalOrders: 198,
    status: "suspended",
    joinDate: "2023-11-05",
  },
  {
    id: "seller-005",
    name: "رياض بن عمر",
    email: "riad@tech.com",
    phone: "0694567890",
    storeName: "ريادة تك",
    wilaya: "عنابة",
    category: "إلكترونيات",
    totalProducts: 3,
    totalRevenue: 0,
    totalOrders: 0,
    status: "pending",
    joinDate: "2024-01-20",
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

export const mockWithdrawalRequests: WithdrawalRequest[] = [
  {
    id: "wdr-001",
    requesterId: "aff-001",
    requesterName: "أحمد بن سالم",
    requesterType: "affiliate",
    amount: 15000,
    method: "CCP",
    accountDetails: "0012345678 / 22",
    status: "pending",
    date: "2024-01-20",
  },
  {
    id: "wdr-002",
    requesterId: "seller-001",
    requesterName: "عبد الرحمن بلقاسم",
    requesterType: "seller",
    amount: 85000,
    method: "Baridimob",
    accountDetails: "00799999000123456789",
    status: "completed",
    date: "2024-01-18",
  },
  {
    id: "wdr-003",
    requesterId: "aff-002",
    requesterName: "فاطمة الزهراء",
    requesterType: "affiliate",
    amount: 5000,
    method: "Baridimob",
    accountDetails: "00799999000987654321",
    status: "pending",
    date: "2024-01-21",
  },
  {
    id: "wdr-004",
    requesterId: "seller-002",
    requesterName: "نادية مرابط",
    requesterType: "seller",
    amount: 120000,
    method: "CCP",
    accountDetails: "0087654321 / 11",
    status: "rejected",
    date: "2024-01-15",
  },
];

export interface JoinRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "affiliate" | "seller";
  wilaya: string;
  storeName?: string;
  ccp?: string;
  category?: string;
  status: "pending" | "approved" | "rejected";
  date: string;
}

export const mockJoinRequests: JoinRequest[] = [
  {
    id: "jr-001",
    name: "بلال قدور",
    email: "bilal@email.com",
    phone: "0555998877",
    role: "affiliate",
    wilaya: "16 Alger - الجزائر",
    ccp: "0012341234 / 44",
    status: "pending",
    date: "2024-01-25",
  },
  {
    id: "jr-002",
    name: "سامية تواتي",
    email: "samia@store.com",
    phone: "0666112233",
    role: "seller",
    wilaya: "31 Oran - وهران",
    storeName: "سامية فاشن",
    category: "أزياء",
    status: "pending",
    date: "2024-01-24",
  },
  {
    id: "jr-003",
    name: "عمر خالد",
    email: "omar@marketing.dz",
    phone: "0777445566",
    role: "affiliate",
    wilaya: "06 Béjaïa - بجاية",
    ccp: "0098765432 / 11",
    status: "pending",
    date: "2024-01-23",
  },
];

