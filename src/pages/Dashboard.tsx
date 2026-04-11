import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Package, ShoppingCart, Wallet, Trophy, 
  HelpCircle, LogOut, Menu, X, Copy, Check, TrendingUp,
  Clock, CheckCircle, XCircle, Truck, Eye, ChevronLeft,
  Calendar, Filter, Search, SlidersHorizontal, Store, Sparkles,
  Heart, Download, PlusCircle, User, Phone, MapPin, PackagePlus, MessageSquare, Plus, Trash2, Maximize2, LayoutTemplate,
  Save, Globe, Facebook, Instagram
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format, parseISO, isAfter, isBefore, isEqual } from "date-fns";
import { ar } from "date-fns/locale";
import { mockProducts, categories } from "@/data/mockProducts";
import { mockOrders, mockAffiliateStats, Order, wilayas } from "@/data/mockAffiliateData";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import EarningsChart from "@/components/dashboard/EarningsChart";
import { shippingRates, shippingRegions } from "@/data/mockShippingData";
import { mockWithdrawalRequests } from "@/data/mockAdminData";
import { mockSellerStats, sellerEarningsData } from "@/data/mockSellerData";
import { StoreSettings, defaultStoreSettings } from "@/data/storeSettings";
import LandingPageBuilder from "@/components/seller/LandingPageBuilder";
import {
  BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  AreaChart, Area
} from "recharts";

type Tab = "overview" | "products" | "my_store" | "my_store_edit" | "favorites" | "landing_pages" | "orders" | "earnings" | "withdrawals" | "levels" | "shipping" | "support";

const orderStatusPieData = [
  { name: "مسلّمة", value: 812, color: "hsl(160, 84%, 39%)" },
  { name: "قيد التوصيل", value: 64, color: "hsl(262, 83%, 58%)" },
  { name: "معلّقة", value: 23, color: "hsl(45, 93%, 47%)" },
  { name: "ملغاة", value: 45, color: "hsl(0, 84%, 60%)" },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-xl p-3 shadow-lg">
        <p className="font-semibold text-foreground text-sm">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name === "revenue" ? "الإيرادات" : "الطلبيات"}: {entry.value.toLocaleString()}
            {entry.name === "revenue" && " دج"}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const statusConfig = {
  pending: { label: "قيد الانتظار", icon: Clock, color: "text-yellow-600 bg-yellow-100" },
  confirmed: { label: "مؤكد", icon: CheckCircle, color: "text-blue-600 bg-blue-100" },
  shipped: { label: "قيد التوصيل", icon: Truck, color: "text-purple-600 bg-purple-100" },
  delivered: { label: "تم التسليم", icon: CheckCircle, color: "text-secondary bg-secondary/10" },
  cancelled: { label: "ملغي", icon: XCircle, color: "text-destructive bg-destructive/10" }
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  // Product filter states
  const [productSearch, setProductSearch] = useState("");
  const [productCategory, setProductCategory] = useState("الكل");
  const [productPriceRange, setProductPriceRange] = useState(0);
  const [productSort, setProductSort] = useState("default");
  const [productStockFilter, setProductStockFilter] = useState("all");
  const [showProductFilters, setShowProductFilters] = useState(false);

  // Filter states
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatus, setOrderStatus] = useState("all");
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const [isDateFromOpen, setIsDateFromOpen] = useState(false);
  const [isDateToOpen, setIsDateToOpen] = useState(false);

  // Withdrawal states
  const [withdrawalDialogOpen, setWithdrawalDialogOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawMethod, setWithdrawMethod] = useState("CCP");
  const [withdrawAccount, setWithdrawAccount] = useState("");

  // Product Redesign States
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [storeProducts, setStoreProducts] = useState<Set<string>>(new Set());
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [orderFormData, setOrderFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    wilaya: "",
    address: "",
    deliveryType: "home" as "home" | "office",
    deliveryFee: 500
  });

  // Store Editor State
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(() => {
    const saved = localStorage.getItem("affiliate_store_settings");
    return saved ? JSON.parse(saved) : defaultStoreSettings;
  });

  const saveStoreSettings = () => {
    localStorage.setItem("affiliate_store_settings", JSON.stringify(storeSettings));
    toast({
      title: "تم حفظ إعدادات المتجر! ✅",
      description: "تم تحديث مظهر متجرك العام بنجاح.",
    });
  };

  // Calculate delivery fee automatically
  useEffect(() => {
    if (orderFormData.wilaya) {
      const rate = shippingRates.find(r => r.wilaya === orderFormData.wilaya);
      if (rate) {
        const fee = orderFormData.deliveryType === "home" ? rate.homePrice : rate.officePrice;
        setOrderFormData(prev => ({ ...prev, deliveryFee: fee }));
      }
    }
  }, [orderFormData.wilaya, orderFormData.deliveryType]);

  useEffect(() => {
    const storedUser = localStorage.getItem("affiliate_user");
    if (!storedUser) {
      navigate("/auth");
    } else {
      setUser(JSON.parse(storedUser));
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("affiliate_user");
    toast({ title: "تم تسجيل الخروج" });
    navigate("/");
  };

  const copyAffiliateLink = (productId: string, productName: string) => {
    const link = `${window.location.origin}/product/${productId}/${user?.id || "aff-demo"}`;
    navigator.clipboard.writeText(link);
    setCopiedId(productId);
    toast({ title: "تم نسخ الرابط! 🔗" });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleFavorite = (productId: string) => {
    setFavorites(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
        toast({ title: "تمت الإزالة من المفضلة" });
      } else {
        newSet.add(productId);
        toast({ title: "تمت الإضافة للمفضلة ❤️" });
      }
      return newSet;
    });
  };

  const toggleStoreProduct = (productId: string) => {
    setStoreProducts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
        toast({ title: "تمت الإزالة من متجرك" });
      } else {
        newSet.add(productId);
        toast({ title: "تمت الإضافة لمتجرك ➕" });
      }
      return newSet;
    });
  };

  const openProductDetail = (product: any) => {
    setSelectedProduct(product);
    setIsDetailDialogOpen(true);
  };

  const openOrderForm = (product: any) => {
    setSelectedProduct(product);
    setIsOrderDialogOpen(true);
  };

  const clearFilters = () => {
    setOrderSearch("");
    setOrderStatus("all");
    setDateFrom(undefined);
    setDateTo(undefined);
  };

  const hasActiveFilters = orderSearch || orderStatus !== "all" || dateFrom || dateTo;

  const filteredOrders = useMemo(() => {
    return mockOrders.filter((order) => {
      // Search filter
      const matchesSearch = order.productName.includes(orderSearch) || 
                           order.customerName.includes(orderSearch) ||
                           order.wilaya.includes(orderSearch);
      
      // Status filter
      const matchesStatus = orderStatus === "all" || order.status === orderStatus;
      
      // Date filters
      const orderDate = parseISO(order.date);
      const matchesDateFrom = !dateFrom || isAfter(orderDate, dateFrom) || isEqual(orderDate, dateFrom);
      const matchesDateTo = !dateTo || isBefore(orderDate, dateTo) || isEqual(orderDate, dateTo);
      
      return matchesSearch && matchesStatus && matchesDateFrom && matchesDateTo;
    });
  }, [orderSearch, orderStatus, dateFrom, dateTo]);

  const productPriceRanges = [
    { label: "الكل", min: 0, max: Infinity },
    { label: "أقل من 2,000 دج", min: 0, max: 2000 },
    { label: "2,000 - 5,000 دج", min: 2000, max: 5000 },
    { label: "5,000 - 10,000 دج", min: 5000, max: 10000 },
    { label: "أكثر من 10,000 دج", min: 10000, max: Infinity },
  ];

  const productSortOptions = [
    { value: "default", label: "الافتراضي" },
    { value: "price-asc", label: "السعر: من الأقل" },
    { value: "price-desc", label: "السعر: من الأعلى" },
    { value: "commission-desc", label: "العمولة: من الأعلى" },
    { value: "stock-desc", label: "المخزون: الأكثر" },
  ];

  const filteredProducts = useMemo(() => {
    const range = productPriceRanges[productPriceRange];
    return mockProducts
      .filter((product) => {
        const matchesSearch = product.name.includes(productSearch) || product.description.includes(productSearch);
        const matchesCategory = productCategory === "الكل" || product.category === productCategory;
        const matchesPrice = product.price >= range.min && product.price <= range.max;
        const matchesStock = productStockFilter === "all" || (productStockFilter === "in-stock" && product.stock > 0) || (productStockFilter === "low" && product.stock <= 50 && product.stock > 0);
        return matchesSearch && matchesCategory && matchesPrice && matchesStock;
      })
      .sort((a, b) => {
        if (productSort === "price-asc") return a.price - b.price;
        if (productSort === "price-desc") return b.price - a.price;
        if (productSort === "commission-desc") return b.commission - a.commission;
        if (productSort === "stock-desc") return b.stock - a.stock;
        return 0;
      });
  }, [productSearch, productCategory, productPriceRange, productSort, productStockFilter]);

  const sidebarItems = [
    { id: "overview" as Tab, label: "نظرة عامة", icon: LayoutDashboard },
    { id: "products" as Tab, label: "المنتجات", icon: Package },
    { id: "my_store" as Tab, label: "متجري", icon: Store },
    { id: "my_store_edit" as Tab, label: "تعديل متجري", icon: LayoutTemplate },
    { id: "favorites" as Tab, label: "المنتجات المفضلة", icon: Heart },
    { id: "landing_pages" as Tab, label: "صفحات الهبوط", icon: LayoutTemplate },
    { id: "orders" as Tab, label: "طلبياتي", icon: ShoppingCart },
    { id: "earnings" as Tab, label: "الأرباح", icon: Wallet },
    { id: "withdrawals" as Tab, label: "طلبات السحب", icon: CheckCircle },
    { id: "shipping" as Tab, label: "التوصيل", icon: Truck },
    { id: "levels" as Tab, label: "المستويات", icon: Trophy },
    { id: "support" as Tab, label: "الدعم", icon: HelpCircle },
  ];

  if (!user) return null;

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 right-0 z-50 w-72 bg-card border-l border-border transform transition-transform duration-300 ${
        sidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
      }`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-border">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-secondary to-emerald-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">L</span>
              </div>
              <span className="text-xl font-bold text-foreground">LinkDZ</span>
            </Link>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-border">
            <div className="bg-muted rounded-xl p-4">
              <p className="font-semibold text-foreground">{user.name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <div className="mt-2 flex items-center gap-2">
                <span className="px-2 py-1 bg-secondary/10 text-secondary text-xs rounded-full font-medium">
                  المستوى {mockAffiliateStats.currentLevel}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === item.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-border">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-destructive hover:bg-destructive/10 transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-xl border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-muted"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold text-foreground">
              {sidebarItems.find(item => item.id === activeTab)?.label}
            </h1>
            <div className="flex items-center gap-3">
              <Link to="/products">
                <Button variant="outline" size="sm" className="gap-2">
                  <Package className="w-4 h-4" />
                  عرض المنتجات
                </Button>
              </Link>
            </div>
          </div>
        </header>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card rounded-2xl p-6 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm">إجمالي الأرباح</p>
                      <p className="text-3xl font-bold text-foreground mt-1">
                        {mockAffiliateStats.totalEarnings.toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">دج</p>
                    </div>
                    <div className="w-14 h-14 bg-secondary/10 rounded-2xl flex items-center justify-center">
                      <Wallet className="w-7 h-7 text-secondary" />
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-card rounded-2xl p-6 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm">الأرباح المعلّقة</p>
                      <p className="text-3xl font-bold text-foreground mt-1">
                        {mockAffiliateStats.pendingEarnings.toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">دج</p>
                    </div>
                    <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center">
                      <Clock className="w-7 h-7 text-accent" />
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-card rounded-2xl p-6 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm">إجمالي الطلبيات</p>
                      <p className="text-3xl font-bold text-foreground mt-1">
                        {mockAffiliateStats.totalOrders}
                      </p>
                      <p className="text-sm text-secondary">+{mockAffiliateStats.confirmedOrders} مؤكد</p>
                    </div>
                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                      <ShoppingCart className="w-7 h-7 text-primary" />
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-card rounded-2xl p-6 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm">نسبة التأكيد</p>
                      <p className="text-3xl font-bold text-foreground mt-1">
                        {mockAffiliateStats.confirmationRate}%
                      </p>
                      <p className="text-sm text-secondary">ممتاز</p>
                    </div>
                    <div className="w-14 h-14 bg-secondary/10 rounded-2xl flex items-center justify-center">
                      <TrendingUp className="w-7 h-7 text-secondary" />
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Level Progress */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-r from-primary to-navy-800 rounded-2xl p-6 text-primary-foreground"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-primary-foreground/70">مستواك الحالي</p>
                    <p className="text-2xl font-bold">المستوى {mockAffiliateStats.currentLevel} - فضي</p>
                  </div>
                  <Trophy className="w-12 h-12 text-accent" />
                </div>
                <div className="bg-white/20 rounded-full h-3 mb-2">
                  <div
                    className="bg-accent h-full rounded-full transition-all"
                    style={{ width: `${((30 - mockAffiliateStats.ordersToNextLevel) / 30) * 100}%` }}
                  />
                </div>
                <p className="text-sm text-primary-foreground/70">
                  باقي {mockAffiliateStats.ordersToNextLevel} طلبيات للترقية للمستوى التالي
                </p>
              </motion.div>
              {/* Revenue Evolution Chart from Seller Dashboard */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="dash-card-interactive p-6"
              >
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-lg font-bold text-foreground">تطور الإيرادات</h3>
                    <p className="text-sm text-muted-foreground mt-1">نظرة سريعة على مبيعاتك المحققة</p>
                  </div>
                  <Select defaultValue="6months">
                    <SelectTrigger className="w-32 h-9 rounded-xl text-xs">
                      <SelectValue placeholder="الفترة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3months">آخر 3 أشهر</SelectItem>
                      <SelectItem value="6months">آخر 6 أشهر</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={sellerEarningsData}>
                      <defs>
                        <linearGradient id="sellerRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border)/0.5)" />
                      <XAxis 
                        dataKey="month" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} 
                      />
                      <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} 
                        tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} 
                      />
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Area 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="hsl(160, 84%, 39%)" 
                        strokeWidth={3} 
                        fill="url(#sellerRevenueGradient)" 
                        name="revenue" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
              {/* Recent Orders */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-card rounded-2xl shadow-sm"
              >
                <div className="p-6 border-b border-border flex items-center justify-between">
                  <h2 className="text-lg font-bold text-foreground">آخر الطلبيات</h2>
                  <button
                    onClick={() => setActiveTab("orders")}
                    className="text-secondary text-sm font-medium flex items-center gap-1 hover:underline"
                  >
                    عرض الكل
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>
                <div className="divide-y divide-border">
                  {mockOrders.slice(0, 5).map((order) => {
                    const status = statusConfig[order.status];
                    return (
                      <div key={order.id} className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${status.color}`}>
                            <status.icon className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{order.productName}</p>
                            <p className="text-sm text-muted-foreground">{order.customerName} - {order.wilaya}</p>
                          </div>
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-secondary">{order.commission.toLocaleString()} دج</p>
                          <p className="text-xs text-muted-foreground">{order.date}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </div>
          )}

          {/* Products Tab */}
          {activeTab === "products" && (
            <div className="space-y-6">
              {/* Filters */}
              <div className="bg-card rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <Input
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      placeholder="ابحث عن منتج..."
                      className="pr-12 h-12"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Select value={productSort} onValueChange={setProductSort}>
                      <SelectTrigger className="w-[180px] h-12 rounded-xl">
                        <SelectValue placeholder="ترتيب حسب" />
                      </SelectTrigger>
                      <SelectContent>
                        {productSortOptions.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant={showProductFilters ? "default" : "outline"}
                      onClick={() => setShowProductFilters(!showProductFilters)}
                      className="h-12 gap-2 rounded-xl"
                    >
                      <SlidersHorizontal className="w-4 h-4" />
                      فلاتر
                    </Button>
                  </div>
                </div>

                {/* Categories */}
                <div className="flex gap-2 flex-wrap">
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant={productCategory === category ? "default" : "outline"}
                      onClick={() => setProductCategory(category)}
                      className="rounded-full"
                    >
                      {category}
                    </Button>
                  ))}
                </div>

                {/* Advanced filters */}
                {showProductFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-border"
                  >
                    <div className="flex-1 space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">نطاق السعر</label>
                      <Select value={String(productPriceRange)} onValueChange={(v) => setProductPriceRange(Number(v))}>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {productPriceRanges.map((range, i) => (
                            <SelectItem key={i} value={String(i)}>{range.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex-1 space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">المخزون</label>
                      <Select value={productStockFilter} onValueChange={setProductStockFilter}>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">الكل</SelectItem>
                          <SelectItem value="in-stock">متوفر</SelectItem>
                          <SelectItem value="low">مخزون منخفض</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { setProductPriceRange(0); setProductStockFilter("all"); setProductSort("default"); setProductCategory("الكل"); setProductSearch(""); }}
                        className="gap-1.5 text-destructive"
                      >
                        <X className="w-4 h-4" /> مسح الفلاتر
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Active filter count */}
                {(productCategory !== "الكل" || productPriceRange !== 0 || productStockFilter !== "all") && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Filter className="w-4 h-4" />
                    <span>{filteredProducts.length} منتج من أصل {mockProducts.length}</span>
                  </div>
                )}
              </div>

              {/* Products Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product, index) => {
                  const isFavorite = favorites.has(product.id);
                  const isInStore = storeProducts.has(product.id);
                  const profit = product.price - (product.originalPrice / 2); // Assuming 50% commission is calculated this way or use product.commission
                  
                  return (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border/50 hover:shadow-md transition-all group"
                    >
                      <div className="aspect-[4/3] relative overflow-hidden">
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <Button size="icon" variant="secondary" className="rounded-full shadow-lg" onClick={() => openProductDetail(product)}>
                            <Maximize2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <button 
                          onClick={() => toggleFavorite(product.id)}
                          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all ${
                            isFavorite ? "bg-red-500 text-white" : "bg-white/80 text-muted-foreground hover:bg-white"
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`} />
                        </button>
                        <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-[10px] font-bold text-primary border border-primary/20">
                          {product.category}
                        </div>
                      </div>
                      
                      <div className="p-4 space-y-3">
                        <h3 className="font-bold text-foreground line-clamp-1">{product.name}</h3>
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <p className="text-[10px] text-muted-foreground line-through">{product.originalPrice.toLocaleString()} دج</p>
                            <p className="text-lg font-bold text-primary">{product.price.toLocaleString()} دج</p>
                          </div>
                          <div className="text-left">
                            <p className="text-[10px] text-muted-foreground">ربحك الصافي</p>
                            <p className="text-lg font-bold text-secondary">{product.commission.toLocaleString()} دج</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <Button 
                            onClick={() => openOrderForm(product)}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 rounded-xl h-10 text-xs font-bold"
                          >
                            <ShoppingCart className="w-4 h-4" />
                            طلب المنتج
                          </Button>
                          <Button 
                            variant="outline"
                            onClick={() => toggleStoreProduct(product.id)}
                            className={`gap-2 rounded-xl h-10 text-xs font-bold ${
                              isInStore ? "border-secondary text-secondary bg-secondary/5" : "border-border hover:bg-muted"
                            }`}
                          >
                            {isInStore ? <Check className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}
                            {isInStore ? "في المتجر" : "إضافة للمتجر"}
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {filteredProducts.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-xl text-muted-foreground">لا توجد منتجات مطابقة للبحث</p>
                </div>
              )}
            </div>
          )}

          {/* My Store Tab */}
          {activeTab === "my_store" && (
            <div className="space-y-8">
              {/* Store Link Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-primary via-primary to-navy-800 rounded-3xl p-8 lg:p-12 text-white shadow-2xl relative overflow-hidden"
              >
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                  <div className="text-center md:text-right flex-1">
                    <h2 className="text-4xl font-black mb-4">متجرك الخاص جاهز! 🚀</h2>
                    <p className="text-primary-foreground/80 mb-10 max-w-2xl text-xl leading-relaxed">شارك رابط متجرك واكسب عمولة على كل منتج يشتريه الزبائن من خلالك. متجرك يحتوي حالياً على <b>{storeProducts.size}</b> منتجات.</p>
                    <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4">
                      <div className="bg-white/10 backdrop-blur-md px-6 py-5 rounded-2xl border border-white/20 font-mono text-sm break-all flex-1 flex items-center justify-center lg:justify-start text-left" dir="ltr">
                        {window.location.origin}/store/{user?.id || "aff-demo"}
                      </div>
                      <div className="flex gap-3">
                        <Button 
                          onClick={() => {
                            const link = `${window.location.origin}/store/${user?.id || "aff-demo"}`;
                            navigator.clipboard.writeText(link);
                            toast({ title: "تم نسخ رابط المتجر! 🔗" });
                          }}
                          className="bg-secondary text-secondary-foreground hover:bg-secondary/90 h-16 px-10 rounded-2xl gap-3 shadow-xl shadow-secondary/20 font-black text-lg transition-all hover:scale-105 active:scale-95"
                        >
                          <Copy className="w-6 h-6" />
                          نسخ الرابط
                        </Button>
                        <Button 
                          variant="outline"
                          className="bg-white/10 border-white/20 hover:bg-white/20 text-white h-16 px-8 rounded-2xl gap-3 backdrop-blur-sm font-bold"
                        >
                          <Eye className="w-6 h-6" />
                          معاينة
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="hidden xl:flex w-64 h-64 bg-white/10 rounded-[3rem] items-center justify-center backdrop-blur-md border border-white/20 rotate-6 shadow-2xl relative group transition-transform hover:rotate-0 duration-500">
                    <Store className="w-32 h-32 text-white opacity-80 group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute -top-4 -right-4 w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center -rotate-12 group-hover:rotate-0 transition-transform duration-500 shadow-xl">
                      <Sparkles className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </div>
                {/* Decorative background elements */}
                <div className="absolute -right-20 -top-20 w-[400px] h-[400px] bg-secondary/30 rounded-full blur-[120px] opacity-50" />
                <div className="absolute -left-20 -bottom-20 w-[400px] h-[400px] bg-primary/30 rounded-full blur-[120px] opacity-50" />
              </motion.div>

              {/* Store Products Section */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-black text-foreground flex items-center gap-3">
                    <Package className="w-6 h-6 text-primary" />
                    المنتجات المضافة لمتجرك
                  </h3>
                  <Badge variant="outline" className="px-4 py-1.5 rounded-full font-bold">
                    {storeProducts.size} منتج
                  </Badge>
                </div>

                {storeProducts.size > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {mockProducts.filter(p => storeProducts.has(p.id)).map((product) => (
                      <motion.div
                        key={product.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border/50 group"
                      >
                        <div className="aspect-square relative">
                          <img src={product.image} className="w-full h-full object-cover" />
                          <button 
                            onClick={() => toggleStoreProduct(product.id)}
                            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="p-4">
                          <h4 className="font-bold text-foreground line-clamp-1 mb-2">{product.name}</h4>
                          <div className="flex justify-between items-center">
                            <span className="text-primary font-bold">{product.price.toLocaleString()} دج</span>
                            <span className="text-xs text-secondary font-bold">ربحك: {product.commission.toLocaleString()} دج</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-card rounded-[2.5rem] p-20 text-center border-2 border-dashed border-border/60">
                    <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                      <PlusCircle className="w-12 h-12 text-muted-foreground/40" />
                    </div>
                    <h4 className="text-xl font-bold text-foreground mb-2">متجرك فارغ حالياً</h4>
                    <p className="text-muted-foreground max-w-md mx-auto mb-8">
                      ابدأ بتصفح المنتجات وأضف ما تراه مناسباً لجمهورك لتبدأ في جني الأرباح.
                    </p>
                    <Button onClick={() => setActiveTab("products")} className="rounded-2xl h-12 px-8 font-bold">
                      تصفح المنتجات الآن
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Favorites Tab */}
          {activeTab === "favorites" && (
            <div className="space-y-8">
              <div className="flex items-center justify-between border-b border-border/60 pb-6">
                <div>
                  <h2 className="text-3xl font-black text-foreground">المنتجات المفضلة ❤️</h2>
                  <p className="text-muted-foreground mt-1">المنتجات التي قمت بحفظها للوصول إليها لاحقاً.</p>
                </div>
                <Badge className="bg-red-500 hover:bg-red-600 px-6 py-2 rounded-full text-lg font-bold">
                  {favorites.size} منتج
                </Badge>
              </div>

              {favorites.size > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {mockProducts.filter(p => favorites.has(p.id)).map((product) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border/50 hover:shadow-md transition-all group"
                    >
                      <div className="aspect-[4/3] relative overflow-hidden">
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <Button size="icon" variant="secondary" className="rounded-full shadow-lg" onClick={() => openProductDetail(product)}>
                            <Maximize2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <button 
                          onClick={() => toggleFavorite(product.id)}
                          className="absolute top-3 right-3 p-2 rounded-full bg-red-500 text-white shadow-lg"
                        >
                          <Heart className="w-4 h-4 fill-current" />
                        </button>
                      </div>
                      
                      <div className="p-4 space-y-3">
                        <h3 className="font-bold text-foreground line-clamp-1">{product.name}</h3>
                        <div className="flex items-center justify-between">
                          <p className="text-xl font-bold text-primary">{product.price.toLocaleString()} دج</p>
                          <p className="text-xs font-bold text-secondary">الربح: {product.commission.toLocaleString()} دج</p>
                        </div>
                        <Button 
                          onClick={() => openOrderForm(product)}
                          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2 rounded-xl h-10 text-xs font-bold"
                        >
                          <ShoppingCart className="w-4 h-4" />
                          طلب المنتج
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="bg-card rounded-[2.5rem] p-20 text-center border-2 border-dashed border-border/60">
                  <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                    <Heart className="w-12 h-12 text-muted-foreground/40" />
                  </div>
                  <h4 className="text-xl font-bold text-foreground mb-2">قائمة المفضلة فارغة</h4>
                  <p className="text-muted-foreground max-w-md mx-auto mb-8">
                    لم تقم بإضافة أي منتجات للمفضلة بعد. ابحث عن المنتجات التي تعجبك واضغط على أيقونة القلب.
                  </p>
                  <Button onClick={() => setActiveTab("products")} variant="outline" className="rounded-2xl h-12 px-8 font-bold">
                    الذهاب للمتجر
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Landing Pages Tab */}
          {activeTab === "landing_pages" && (
            <div className="space-y-6">
              <LandingPageBuilder />
            </div>
          )}

          {/* Orders Tab with Advanced Filtering */}
          {activeTab === "orders" && (
            <div className="space-y-6">
              {/* Filters */}
              <div className="bg-card rounded-2xl p-4 shadow-sm">
                <div className="flex flex-wrap items-center gap-3">
                  {/* Search */}
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="ابحث عن منتج أو زبون..."
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      className="pr-10"
                    />
                  </div>

                  {/* Status Filter */}
                  <Select value={orderStatus} onValueChange={setOrderStatus}>
                    <SelectTrigger className="w-[160px]">
                      <Filter className="w-4 h-4 ml-2" />
                      <SelectValue placeholder="الحالة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع الحالات</SelectItem>
                      <SelectItem value="pending">قيد الانتظار</SelectItem>
                      <SelectItem value="confirmed">مؤكد</SelectItem>
                      <SelectItem value="shipped">قيد التوصيل</SelectItem>
                      <SelectItem value="delivered">تم التسليم</SelectItem>
                      <SelectItem value="cancelled">ملغي</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Date From */}
                  <Popover open={isDateFromOpen} onOpenChange={setIsDateFromOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="gap-2">
                        <Calendar className="w-4 h-4" />
                        {dateFrom ? format(dateFrom, "dd/MM/yyyy") : "من تاريخ"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={dateFrom}
                        onSelect={(date) => {
                          setDateFrom(date);
                          setIsDateFromOpen(false);
                        }}
                        locale={ar}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  {/* Date To */}
                  <Popover open={isDateToOpen} onOpenChange={setIsDateToOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="gap-2">
                        <Calendar className="w-4 h-4" />
                        {dateTo ? format(dateTo, "dd/MM/yyyy") : "إلى تاريخ"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={dateTo}
                        onSelect={(date) => {
                          setDateTo(date);
                          setIsDateToOpen(false);
                        }}
                        locale={ar}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  {/* Clear Filters */}
                  {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-destructive">
                      <X className="w-4 h-4" />
                      مسح الفلاتر
                    </Button>
                  )}
                </div>
              </div>

              {/* Results Count */}
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground text-sm">
                  عرض {filteredOrders.length} من {mockOrders.length} طلبية
                </p>
              </div>

              {/* Orders Table */}
              <div className="bg-card rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-right p-4 font-semibold text-foreground">المنتج</th>
                        <th className="text-right p-4 font-semibold text-foreground">الزبون</th>
                        <th className="text-right p-4 font-semibold text-foreground">الولاية</th>
                        <th className="text-right p-4 font-semibold text-foreground">الحالة</th>
                        <th className="text-right p-4 font-semibold text-foreground">العمولة</th>
                        <th className="text-right p-4 font-semibold text-foreground">التاريخ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredOrders.length > 0 ? (
                        filteredOrders.map((order) => {
                          const status = statusConfig[order.status];
                          return (
                            <tr key={order.id} className="hover:bg-muted/50 transition-colors">
                              <td className="p-4 font-medium text-foreground">{order.productName}</td>
                              <td className="p-4 text-muted-foreground">{order.customerName}</td>
                              <td className="p-4 text-muted-foreground">{order.wilaya}</td>
                              <td className="p-4">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
                                  <status.icon className="w-4 h-4" />
                                  {status.label}
                                </span>
                              </td>
                              <td className="p-4 font-bold text-secondary">{order.commission.toLocaleString()} دج</td>
                              <td className="p-4 text-muted-foreground">{order.date}</td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-muted-foreground">
                            لا توجد طلبيات تطابق الفلاتر المحددة
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Earnings Tab ported from Seller Dashboard */}
          {activeTab === "earnings" && (
            <div className="space-y-8">
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { 
                    label: "الإيرادات الإجمالية", 
                    value: `${mockSellerStats.totalRevenue.toLocaleString()} دج`, 
                    color: "text-foreground",
                    sub: "إجمالي المبيعات المحققة",
                    icon: Wallet,
                    bg: "bg-primary/5"
                  },
                  { 
                    label: "عمولات المسوّقين", 
                    value: `${(mockSellerStats.totalRevenue * 0.45).toLocaleString()} دج`, 
                    color: "text-accent",
                    sub: "المبالغ المستحقة للشركاء",
                    icon: Trophy,
                    bg: "bg-accent/5"
                  },
                  { 
                    label: "صافي الربح", 
                    value: `${(mockSellerStats.totalRevenue * 0.55).toLocaleString()} دج`, 
                    color: "text-secondary",
                    sub: "الأرباح الصافية بعد العمولات",
                    icon: TrendingUp,
                    bg: "bg-secondary/5"
                  },
                ].map((stat, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`bg-card rounded-[2rem] p-8 shadow-sm border border-border/50 relative overflow-hidden group hover:shadow-xl transition-all duration-500 ${stat.bg}`}
                  >
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center shadow-sm">
                          <stat.icon className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <p className="text-muted-foreground font-medium text-sm">{stat.label}</p>
                      </div>
                      <p className={`text-4xl font-black tabular-nums transition-transform duration-500 group-hover:scale-105 ${stat.color}`}>{stat.value}</p>
                      <p className="text-xs text-muted-foreground/80 mt-2 font-medium">{stat.sub}</p>
                    </div>
                    {/* Decorative element */}
                    <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-current opacity-[0.03] rounded-full" />
                  </motion.div>
                ))}
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                {/* Monthly Revenue Bar Chart */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="bg-card rounded-[2.5rem] p-8 border border-border/50 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-bold text-foreground">الإيرادات الشهرية</h3>
                    <Select defaultValue="6months">
                      <SelectTrigger className="w-32 h-9 rounded-xl text-xs">
                        <SelectValue placeholder="الفترة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3months">آخر 3 أشهر</SelectItem>
                        <SelectItem value="6months">آخر 6 أشهر</SelectItem>
                        <SelectItem value="year">هذا العام</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="h-[320px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={sellerEarningsData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border)/0.5)" />
                        <XAxis 
                          dataKey="month" 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12, fontWeight: 500 }}
                          dy={10}
                        />
                        <YAxis 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                          tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                        />
                        <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted)/0.3)', radius: 8 }} />
                        <Bar 
                          dataKey="revenue" 
                          fill="hsl(160, 84%, 39%)" 
                          radius={[10, 10, 10, 10]} 
                          barSize={32}
                          name="revenue" 
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>

                {/* Order Distribution Pie Chart */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                  className="bg-card rounded-[2.5rem] p-8 border border-border/50 shadow-sm flex flex-col items-center"
                >
                  <div className="w-full text-right mb-4">
                    <h3 className="text-xl font-bold text-foreground">توزيع الحالات</h3>
                    <p className="text-xs text-muted-foreground mt-1 text-right">نسبة الطلبيات حسب حالة التسليم</p>
                  </div>
                  
                  <div className="h-[280px] w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie 
                          data={orderStatusPieData} 
                          cx="50%" 
                          cy="50%" 
                          innerRadius={70} 
                          outerRadius={100} 
                          paddingAngle={8} 
                          dataKey="value"
                          stroke="none"
                        >
                          {orderStatusPieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} className="outline-none" />
                          ))}
                        </Pie>
                        <RechartsTooltip 
                          formatter={(value: any) => [`${value} طلبية`, ""]} 
                          contentStyle={{ 
                            backgroundColor: "hsl(var(--card))", 
                            border: "1px solid hsl(var(--border))", 
                            borderRadius: "16px",
                            boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)"
                          }} 
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-4xl font-black text-foreground">944</span>
                      <span className="text-[10px] text-muted-foreground font-bold tracking-widest uppercase">إجمالي الطلبات</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 w-full mt-6">
                    {orderStatusPieData.map((item) => (
                      <div key={item.name} className="flex items-center gap-3 p-3 rounded-2xl bg-muted/30 border border-border/40 transition-all hover:bg-muted/50">
                        <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: item.color }} />
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-foreground">{item.name}</span>
                          <span className="text-[10px] text-muted-foreground">{item.value} طلبية</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>

              <div className="bg-gradient-to-r from-primary/10 to-transparent rounded-[2rem] p-8 border border-primary/10 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    تفاصيل الدفع التلقائي
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1 max-w-lg">
                    يتم تجميع الأرباح طوال الأسبوع وتحويلها تلقائياً إلى حسابكم يوم الخميس من كل أسبوع. تأكد من صحة بيانات السحب الخاصة بك.
                  </p>
                </div>
                <Button variant="outline" className="rounded-xl border-primary/20 text-primary bg-primary/5 hover:bg-primary/10 px-6">
                  تعديل بيانات الدفع
                </Button>
              </div>
            </div>
          )}

          {/* Withdrawals Tab */}
          {activeTab === "withdrawals" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground">طلبات السحب</h2>
                <Button onClick={() => setWithdrawalDialogOpen(true)} className="gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-xl">
                  <Wallet className="w-4 h-4" />
                  سحب جديد
                </Button>
              </div>

              <div className="bg-card rounded-2xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-border">
                  <h3 className="font-bold text-foreground">سجل عمليات السحب</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-right p-4 font-semibold text-foreground text-sm">المبلغ</th>
                        <th className="text-right p-4 font-semibold text-foreground text-sm">طريقة الدفع</th>
                        <th className="text-right p-4 font-semibold text-foreground text-sm">الحالة</th>
                        <th className="text-right p-4 font-semibold text-foreground text-sm">التاريخ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {mockWithdrawalRequests
                        .filter(r => r.requesterType === "affiliate")
                        .map((req) => (
                          <tr key={req.id} className="hover:bg-muted/50 transition-colors">
                            <td className="p-4 font-bold text-foreground text-sm">{req.amount.toLocaleString()} دج</td>
                            <td className="p-4">
                              <p className="text-xs font-medium text-foreground">{req.method}</p>
                              <p className="text-[10px] text-muted-foreground font-mono">{req.accountDetails}</p>
                            </td>
                            <td className="p-4">
                              <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                req.status === "pending" ? "bg-amber-100 text-amber-700" :
                                req.status === "completed" ? "bg-emerald-100 text-emerald-700" :
                                "bg-red-100 text-red-700"
                              }`}>
                                {req.status === "pending" ? "قيد الانتظار" : req.status === "completed" ? "تم الدفع" : "مرفوض"}
                                </span>
                            </td>
                            <td className="p-4 text-xs text-muted-foreground">{req.date}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Levels Tab */}
          {activeTab === "levels" && (
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { level: 1, name: "برونزي", orders: 0, commission: "50%", color: "from-amber-600 to-amber-800" },
                { level: 2, name: "فضي", orders: 30, commission: "50% + امتيازات", color: "from-gray-400 to-gray-600" },
                { level: 3, name: "ذهبي", orders: 100, commission: "50% + دعم VIP", color: "from-yellow-400 to-yellow-600" },
              ].map((tier, index) => (
                <motion.div
                  key={tier.level}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-gradient-to-br ${tier.color} rounded-2xl p-6 text-white ${
                    mockAffiliateStats.currentLevel === tier.level ? "ring-4 ring-secondary" : ""
                  }`}
                >
                  <Trophy className="w-12 h-12 mb-4" />
                  <h3 className="text-2xl font-bold">المستوى {tier.level}</h3>
                  <p className="text-xl font-semibold mt-1">{tier.name}</p>
                  <div className="mt-4 space-y-2 text-white/90">
                    <p>• {tier.orders}+ طلبية مؤكدة</p>
                    <p>• عمولة: {tier.commission}</p>
                  </div>
                  {mockAffiliateStats.currentLevel === tier.level && (
                    <div className="mt-4 bg-white/20 rounded-lg px-3 py-1.5 text-sm font-medium inline-block">
                      ✓ مستواك الحالي
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}

          {/* Shipping Tab */}
          {activeTab === "shipping" && (
            <div className="space-y-8">
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Algeria Map Illustration */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="lg:w-1/3 bg-card rounded-[2.5rem] p-8 shadow-sm border border-border/50 flex flex-col items-center justify-center relative overflow-hidden"
                >
                  <div className="relative z-10 w-full h-full flex flex-col items-center">
                    <h3 className="text-xl font-bold text-foreground mb-6 self-start">تغطية التوصيل عبر الوطن</h3>
                    <div className="w-full aspect-[4/5] relative">
                      {/* Stylized SVG Map of Algeria */}
                      <svg viewBox="0 0 400 500" className="w-full h-full drop-shadow-2xl">
                        <path
                          d="M150,50 L250,50 L300,100 L350,150 L350,250 L300,350 L250,450 L100,450 L50,350 L50,150 L100,100 Z"
                          className="fill-primary/10 stroke-primary/30 stroke-2"
                        />
                        {/* Highlights (North) */}
                        <path d="M150,50 L250,50 L300,100 L350,150 L250,150 L150,150 Z" className="fill-secondary/20 hover:fill-secondary/40 transition-colors cursor-pointer" />
                        {/* Cities dots */}
                        <circle cx="200" cy="80" r="5" className="fill-secondary animate-pulse" /> {/* Algiers */}
                        <circle cx="120" cy="120" r="4" className="fill-primary" /> {/* Oran */}
                        <circle cx="280" cy="110" r="4" className="fill-primary" /> {/* Constantine */}
                      </svg>
                      
                      <div className="absolute bottom-4 right-4 bg-background/80 backdrop-blur-sm p-4 rounded-2xl border border-border/50 shadow-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-3 h-3 rounded-full bg-secondary" />
                          <span className="text-xs font-bold">توصيل سريع (24-48 ساعة)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-primary/40" />
                          <span className="text-xs font-bold">توصيل عادي (3-7 أيام)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Decorative backgrounds */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary/5 rounded-full blur-3xl" />
                </motion.div>

                {/* Pricing Summary */}
                <div className="lg:w-2/3 space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-primary to-navy-900 text-white rounded-3xl p-6 shadow-xl">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                          <MapPin className="w-6 h-6" />
                        </div>
                        <h4 className="text-lg font-bold">التوصيل للمنزل</h4>
                      </div>
                      <p className="text-white/80 text-sm mb-4">يستلم الزبون المنتج في مقر سكنه في كافة الولايات.</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xs">يبدأ من</span>
                        <span className="text-3xl font-black">300 دج</span>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-secondary to-orange-700 text-white rounded-3xl p-6 shadow-xl">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                          <User className="w-6 h-6" />
                        </div>
                        <h4 className="text-lg font-bold">التوصيل للمكتب</h4>
                      </div>
                      <p className="text-white/80 text-sm mb-4">سعر مخفض عند استلام الزبون للطلب من مكتب الشركة.</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xs">يبدأ من</span>
                        <span className="text-3xl font-black">200 دج</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-card rounded-3xl p-8 border border-border/50 shadow-sm relative overflow-hidden">
                    <div className="relative z-10">
                      <h4 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-primary" />
                        مواعيد التسليم المتوقعة
                      </h4>
                      <div className="grid grid-cols-3 gap-6">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">الشمال</p>
                          <p className="font-bold text-lg">24 - 48 ساعة</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">الهضاب</p>
                          <p className="font-bold text-lg">2 - 4 أيام</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">الجنوب</p>
                          <p className="font-bold text-lg">5 - 10 أيام</p>
                        </div>
                      </div>
                    </div>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -mr-32 -mt-32" />
                  </div>
                </div>
              </div>

              {/* Wilaya Pricing Table */}
              <div className="bg-card rounded-[2.5rem] shadow-sm border border-border/50 overflow-hidden">
                <div className="p-8 border-b border-border flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-black text-foreground">قائمة الأسعار حسب الولايات</h3>
                    <p className="text-muted-foreground mt-1 text-sm">تفاصيل تكاليف الشحن ومدة التوصيل لكل ولاية.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input placeholder="ابحث عن ولاية..." className="pr-10 rounded-xl h-10 w-64 border-border/60" />
                    </div>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted/50 border-b border-border">
                        <th className="text-right p-6 font-bold text-foreground">الولاية</th>
                        <th className="text-right p-6 font-bold text-foreground">التوصيل للمنزل</th>
                        <th className="text-right p-6 font-bold text-foreground">التوصيل للمكتب</th>
                        <th className="text-right p-6 font-bold text-foreground">وقت التوصيل</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {shippingRates.map((rate, idx) => (
                        <tr key={idx} className="hover:bg-muted/30 transition-colors group">
                          <td className="p-6">
                            <span className="font-bold text-foreground text-lg">{rate.wilaya}</span>
                          </td>
                          <td className="p-6">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary font-black rounded-lg text-sm">
                              {rate.homePrice} دج
                            </span>
                          </td>
                          <td className="p-6">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-secondary/10 text-secondary font-black rounded-lg text-sm">
                              {rate.officePrice} دج
                            </span>
                          </td>
                          <td className="p-6">
                            <span className="flex items-center gap-2 text-muted-foreground font-medium">
                              <Clock className="w-4 h-4" />
                              {rate.deliveryTime}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Support Tab */}
          {activeTab === "support" && (
            <div className="max-w-2xl space-y-6">
              <div className="bg-card rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-foreground mb-4">تواصل معنا</h3>
                <div className="space-y-4">
                  <a
                    href="https://wa.me/213555123456"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 bg-secondary/10 rounded-xl hover:bg-secondary/20 transition-colors"
                  >
                    <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center">
                      <span className="text-xl">💬</span>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">واتساب</p>
                      <p className="text-sm text-muted-foreground">رد سريع خلال 24 ساعة</p>
                    </div>
                  </a>
                  <a
                    href="mailto:support@linkdz.com"
                    className="flex items-center gap-4 p-4 bg-primary/10 rounded-xl hover:bg-primary/20 transition-colors"
                  >
                    <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                      <span className="text-xl">📧</span>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">البريد الإلكتروني</p>
                      <p className="text-sm text-muted-foreground">support@linkdz.com</p>
                    </div>
                  </a>
                </div>
              </div>
              <div className="bg-card rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-foreground mb-4">أسئلة شائعة</h3>
                <div className="space-y-3">
                  <div className="p-4 bg-muted rounded-xl">
                    <p className="font-semibold text-foreground">متى تُحتسب العمولة؟</p>
                    <p className="text-sm text-muted-foreground mt-1">تُحتسب العمولة فقط على الطلبيات المسلّمة بنجاح.</p>
                  </div>
                  <div className="p-4 bg-muted rounded-xl">
                    <p className="font-semibold text-foreground">كيف يتم الدفع؟</p>
                    <p className="text-sm text-muted-foreground mt-1">يتم التحويل تلقائياً كل نهاية أسبوع عبر CCP أو Baridimob.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* My Store Edit Tab */}
          {activeTab === "my_store_edit" && (
            <div className="space-y-8 max-w-5xl" dir="rtl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-black text-foreground flex items-center gap-3">
                    <LayoutTemplate className="w-8 h-8 text-primary" />
                    تخصيص مظهر المتجر
                  </h2>
                  <p className="text-muted-foreground mt-1">اجعل متجرك فريداً وجذاباً لزيادة المبيعات</p>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                   <Button 
                    variant="outline"
                    className="flex-1 sm:flex-none h-12 px-6 rounded-2xl gap-2 font-bold"
                    onClick={() => window.open('/products', '_blank')}
                  >
                    <Eye className="w-5 h-5" />
                    معاينة
                  </Button>
                  <Button 
                    onClick={saveStoreSettings}
                    className="flex-1 sm:flex-none bg-primary text-primary-foreground h-12 px-8 rounded-2xl gap-2 font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                  >
                    <Save className="w-5 h-5" />
                    حفظ التغييرات
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Visual Identity Section */}
                <div className="space-y-6">
                  <div className="bg-card rounded-[2.5rem] p-8 border border-border/50 shadow-sm space-y-6">
                    <div className="flex items-center gap-3 border-b border-border pb-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <Store className="w-5 h-5" />
                      </div>
                      <h3 className="text-xl font-bold">الهوية البصرية</h3>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-bold pr-1">شريط الترحيب (Top Bar)</Label>
                        <Input 
                          value={storeSettings.welcomeBarText}
                          onChange={(e) => setStoreSettings({...storeSettings, welcomeBarText: e.target.value})}
                          placeholder="مثال: أهلاً بكم في متجرنا الرسمي..."
                          className="h-12 rounded-xl bg-muted/30 border-none px-4"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-bold pr-1">رابط الشعار (Logo URL)</Label>
                        <div className="flex gap-4">
                          <Input 
                            value={storeSettings.storeLogo}
                            onChange={(e) => setStoreSettings({...storeSettings, storeLogo: e.target.value})}
                            placeholder="ضع رابط صورة الشعار هنا"
                            className="h-12 rounded-xl bg-muted/30 border-none px-4 flex-1"
                          />
                          {storeSettings.storeLogo && (
                            <div className="w-12 h-12 rounded-xl overflow-hidden border border-border shrink-0">
                              <img src={storeSettings.storeLogo} alt="Logo Preview" className="w-full h-full object-cover" />
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-bold pr-1">اسم المتجر</Label>
                        <Input 
                          value={storeSettings.storeName}
                          onChange={(e) => setStoreSettings({...storeSettings, storeName: e.target.value})}
                          placeholder="مثال: متجر النخبة"
                          className="h-12 rounded-xl bg-muted/30 border-none px-4"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-bold pr-1">نبذة عن المتجر</Label>
                        <Textarea 
                          value={storeSettings.storeIntro}
                          onChange={(e) => setStoreSettings({...storeSettings, storeIntro: e.target.value})}
                          placeholder="اكتب وصفاً قصيراً يظهر تحت اسم المتجر..."
                          className="min-h-[100px] rounded-xl bg-muted/30 border-none p-4"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-card rounded-[2.5rem] p-8 border border-border/50 shadow-sm space-y-6">
                    <div className="flex items-center gap-3 border-b border-border pb-4">
                      <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
                        <LayoutDashboard className="w-5 h-5" />
                      </div>
                      <h3 className="text-xl font-bold">تنسيق العرض</h3>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl">
                        <div className="space-y-0.5">
                          <Label className="font-bold">عدد المنتجات في السطر</Label>
                          <p className="text-xs text-muted-foreground">ينطبق على شاشات الحاسوب فقط</p>
                        </div>
                        <Select 
                          value={String(storeSettings.gridColumns)} 
                          onValueChange={(v) => setStoreSettings({...storeSettings, gridColumns: Number(v)})}
                        >
                          <SelectTrigger className="w-24 border-none bg-background rounded-xl h-10">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="2">منشورين (2)</SelectItem>
                            <SelectItem value="3">3 منشورات</SelectItem>
                            <SelectItem value="4">4 منشورات</SelectItem>
                            <SelectItem value="5">5 منشورات</SelectItem>
                            <SelectItem value="6">6 منشورات</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Social & Contact Section */}
                <div className="space-y-6">
                  <div className="bg-card rounded-[2.5rem] p-8 border border-border/50 shadow-sm space-y-6">
                    <div className="flex items-center gap-3 border-b border-border pb-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
                        <Globe className="w-5 h-5" />
                      </div>
                      <h3 className="text-xl font-bold">التواصل والروابط</h3>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-bold pr-1 flex items-center gap-2">
                          <Facebook className="w-4 h-4 text-[#1877F2]" /> فيسبوك
                        </Label>
                        <Input 
                          value={storeSettings.socialLinks.facebook}
                          onChange={(e) => setStoreSettings({...storeSettings, socialLinks: {...storeSettings.socialLinks, facebook: e.target.value}})}
                          placeholder="https://facebook.com/your-page"
                          className="h-11 rounded-xl bg-muted/30 border-none px-4"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-bold pr-1 flex items-center gap-2">
                          <Instagram className="w-4 h-4 text-[#E4405F]" /> انستغرام
                        </Label>
                        <Input 
                          value={storeSettings.socialLinks.instagram}
                          onChange={(e) => setStoreSettings({...storeSettings, socialLinks: {...storeSettings.socialLinks, instagram: e.target.value}})}
                          placeholder="https://instagram.com/your-profile"
                          className="h-11 rounded-xl bg-muted/30 border-none px-4"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-bold pr-1 flex items-center gap-2">
                          <Phone className="w-4 h-4 text-secondary" /> رقم الهاتف
                        </Label>
                        <Input 
                          value={storeSettings.socialLinks.phone}
                          onChange={(e) => setStoreSettings({...storeSettings, socialLinks: {...storeSettings.socialLinks, phone: e.target.value}})}
                          placeholder="05xx xx xx xx"
                          className="h-11 rounded-xl bg-muted/30 border-none px-4"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-bold pr-1 flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-emerald-500" /> واتساب
                        </Label>
                        <Input 
                          value={storeSettings.socialLinks.whatsapp}
                          onChange={(e) => setStoreSettings({...storeSettings, socialLinks: {...storeSettings.socialLinks, whatsapp: e.target.value}})}
                          placeholder="رقم الواتساب..."
                          className="h-11 rounded-xl bg-muted/30 border-none px-4"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-primary/5 rounded-[2.5rem] p-8 border border-primary/10 space-y-4">
                    <div className="flex items-center gap-4 text-primary">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <Sparkles className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold">معاينة مباشرة للمتجر</h4>
                        <p className="text-xs opacity-70">شاهد كيف يظهر متجرك للعملاء</p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full h-12 rounded-2xl border-primary/20 text-primary bg-background hover:bg-primary hover:text-white transition-all gap-2"
                      onClick={() => window.open('/products', '_blank')}
                    >
                      <Eye className="w-5 h-5" />
                      فتح رابط المتجر
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ===== WITHDRAWAL REQUEST DIALOG ===== */}
      <Dialog open={withdrawalDialogOpen} onOpenChange={setWithdrawalDialogOpen}>
        <DialogContent className="max-w-md rounded-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <Wallet className="w-5 h-5 text-secondary" /> طلب سحب الأرباح
            </DialogTitle>
            <DialogDescription>
              أدخل المبلغ وبيانات التحويل لسحب أرباحك.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">المبلغ المطلوب (دج)</Label>
              <Input
                type="number"
                placeholder="أدخل المبلغ..."
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="rounded-xl h-12 text-lg font-bold"
              />
              <p className="text-[11px] text-muted-foreground">الرصيد القابل للسحب: {mockAffiliateStats.totalEarnings.toLocaleString()} دج</p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">طريقة السحب</Label>
              <Select value={withdrawMethod} onValueChange={setWithdrawMethod}>
                <SelectTrigger className="rounded-xl h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CCP">CCP (البريد الجزائري)</SelectItem>
                  <SelectItem value="Baridimob">Baridimob</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">رقم الحساب / RIP</Label>
              <Input
                placeholder="أدخل رقم الحساب..."
                value={withdrawAccount}
                onChange={(e) => setWithdrawAccount(e.target.value)}
                className="rounded-xl h-11"
              />
            </div>
          </div>

          <DialogFooter className="sm:justify-start gap-2">
            <Button
              className="w-full h-12 rounded-xl bg-secondary text-secondary-foreground font-bold"
              onClick={() => {
                toast({ title: "تم إرسال طلب السحب بنجاح! ✅" });
                setWithdrawalDialogOpen(false);
              }}
            >
              تأكيد الطلب
            </Button>
            <Button variant="outline" className="w-full h-12 rounded-xl" onClick={() => setWithdrawalDialogOpen(false)}>
              إلغاء
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===== PRODUCT DETAIL DIALOG ===== */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2rem] p-0 border-none bg-background shadow-2xl" dir="rtl">
          {selectedProduct && (
            <div className="flex flex-col lg:flex-row h-full">
              {/* Image Gallery Side */}
              <div className="lg:w-1/2 p-6 lg:p-10 bg-muted/30 relative">
                <div className="aspect-square rounded-3xl overflow-hidden bg-white shadow-inner mb-6 space-y-4">
                  <motion.img 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key={selectedProduct.image}
                    src={selectedProduct.image} 
                    alt={selectedProduct.name} 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {selectedProduct.images.map((img: string, i: number) => (
                    <button 
                      key={i} 
                      onClick={() => setSelectedProduct({...selectedProduct, image: img})}
                      className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${selectedProduct.image === img ? "border-primary shadow-md" : "border-transparent opacity-60 hover:opacity-100"}`}
                    >
                      <img src={img} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="absolute top-10 left-10 rounded-full gap-2 backdrop-blur-md"
                  onClick={() => {
                    // Logic to download image would go here
                    toast({ title: "بدأ تحميل الصور... 📥" });
                  }}
                >
                  <Download className="w-4 h-4" />
                  تحميل الصور
                </Button>
              </div>

              {/* Content Side */}
              <div className="lg:w-1/2 p-8 lg:p-12 space-y-8 flex flex-col">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full uppercase tracking-wider">
                      {selectedProduct.category}
                    </span>
                    <button 
                      onClick={() => toggleFavorite(selectedProduct.id)}
                      className={`p-2.5 rounded-full transition-all ${favorites.has(selectedProduct.id) ? "bg-red-500 text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
                    >
                      <Heart className={`w-5 h-5 ${favorites.has(selectedProduct.id) ? "fill-current" : ""}`} />
                    </button>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <h2 className="text-3xl font-black text-foreground">{selectedProduct.name}</h2>
                    <Button variant="ghost" size="icon" onClick={() => {
                      navigator.clipboard.writeText(selectedProduct.name);
                      toast({ title: "تم نسخ الاسم" });
                    }}>
                      <Copy className="w-5 h-5 text-muted-foreground" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-muted/50 p-4 rounded-2xl">
                    <p className="text-xs text-muted-foreground mb-1">سعر البيع النهائي</p>
                    <p className="text-2xl font-black text-primary">{selectedProduct.price.toLocaleString()} دج</p>
                  </div>
                  <div className="bg-secondary/10 p-4 rounded-2xl border border-secondary/20">
                    <p className="text-xs text-muted-foreground mb-1">عمولتك الصافية</p>
                    <p className="text-2xl font-black text-secondary">{selectedProduct.commission.toLocaleString()} دج</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-primary" />
                      النص الإعلاني الجاهز
                    </h4>
                    <Button variant="outline" size="sm" className="h-8 gap-1.5 rounded-lg text-xs" onClick={() => {
                      navigator.clipboard.writeText(selectedProduct.adText);
                      toast({ title: "تم نسخ النص الإعلاني ✨" });
                    }}>
                      <Copy className="w-3.5 h-3.5" />
                      نسخ النص
                    </Button>
                  </div>
                  <div className="bg-muted/50 p-5 rounded-2xl border border-border/50 text-sm leading-relaxed text-muted-foreground italic">
                    {selectedProduct.adText || "لا يوجد نص إعلاني متوفر حالياً لهذا المنتج."}
                  </div>
                </div>

                <div className="mt-auto pt-6 flex gap-4">
                  <Button 
                    className="flex-1 h-14 rounded-2xl bg-primary text-primary-foreground font-black text-lg gap-3 shadow-xl shadow-primary/20"
                    onClick={() => {
                      setIsDetailDialogOpen(false);
                      openOrderForm(selectedProduct);
                    }}
                  >
                    <ShoppingCart className="w-6 h-6" />
                    اطلب المنتج الآن
                  </Button>
                  <Button 
                    variant="outline"
                    className={`h-14 w-14 rounded-2xl border-2 flex items-center justify-center ${storeProducts.has(selectedProduct.id) ? "border-secondary text-secondary bg-secondary/5" : "border-border"}`}
                    onClick={() => toggleStoreProduct(selectedProduct.id)}
                  >
                    <PackagePlus className="w-7 h-7" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ===== MANUAL ORDER DIALOG ===== */}
      <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
        <DialogContent className="max-w-2xl rounded-[2.5rem] p-0 border-none overflow-hidden max-h-[95vh] flex flex-col" dir="rtl">
          {selectedProduct && (
            <div className="flex flex-col flex-1 min-h-0">
              <div className="bg-primary p-8 text-primary-foreground flex flex-col md:flex-row items-center gap-6">
                <div className="w-24 h-24 bg-white rounded-2xl overflow-hidden shadow-lg flex-shrink-0">
                  <img src={selectedProduct.image} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h2 className="text-2xl font-black mb-1">تسجيل طلب يدوي</h2>
                  <p className="opacity-80">سيتم تسجيل هذا الطلب باسمك وستحصل على العمولة بعد التسليم.</p>
                </div>
              </div>

              <div className="p-8 space-y-8 overflow-y-auto flex-1 custom-scrollbar">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm font-bold ml-1">
                      <User className="w-4 h-4 text-primary" /> الاسم الأول
                    </Label>
                    <Input 
                      placeholder="أدخل الاسم..." 
                      className="h-12 rounded-2xl border-border/60"
                      value={orderFormData.firstName}
                      onChange={(e) => setOrderFormData({...orderFormData, firstName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm font-bold ml-1">
                      <User className="w-4 h-4 text-primary" /> اللقب (العائلة)
                    </Label>
                    <Input 
                      placeholder="أدخل اللقب..." 
                      className="h-12 rounded-2xl border-border/60"
                      value={orderFormData.lastName}
                      onChange={(e) => setOrderFormData({...orderFormData, lastName: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm font-bold ml-1">
                    <Phone className="w-4 h-4 text-primary" /> رقم الهاتف
                  </Label>
                  <Input 
                    placeholder="0xxx xx xx xx" 
                    className="h-12 rounded-2xl border-border/60 font-mono"
                    value={orderFormData.phone}
                    onChange={(e) => setOrderFormData({...orderFormData, phone: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm font-bold ml-1">
                      <MapPin className="w-4 h-4 text-primary" /> الولاية
                    </Label>
                    <Select 
                      value={orderFormData.wilaya} 
                      onValueChange={(val) => setOrderFormData({ ...orderFormData, wilaya: val })}
                    >
                      <SelectTrigger className="h-12 rounded-2xl border-border/60">
                        <SelectValue placeholder="اختر الولاية" />
                      </SelectTrigger>
                      <SelectContent>
                        {wilayas.map((w) => (
                          <SelectItem key={w} value={w}>{w}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm font-bold ml-1">
                      <Truck className="w-4 h-4 text-primary" /> نوع التوصيل
                    </Label>
                    <div className="flex bg-muted p-1 rounded-xl h-12">
                      <button 
                        type="button"
                        onClick={() => setOrderFormData({ ...orderFormData, deliveryType: "home" })}
                        className={`flex-1 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${orderFormData.deliveryType === "home" ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                      >
                        للمنزل
                      </button>
                      <button 
                        type="button"
                        onClick={() => setOrderFormData({ ...orderFormData, deliveryType: "office" })}
                        className={`flex-1 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${orderFormData.deliveryType === "office" ? "bg-background text-secondary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                      >
                        للمكتب
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm font-bold ml-1">
                    <MapPin className="w-4 h-4 text-primary" /> العنوان بالتفصيل
                  </Label>
                  <Input 
                    placeholder="رقم المنزل، الشارع، البلدية..." 
                    className="h-12 rounded-2xl border-border/60"
                    value={orderFormData.address}
                    onChange={(e) => setOrderFormData({...orderFormData, address: e.target.value})}
                  />
                </div>

                <div className="bg-muted/40 p-6 rounded-[2rem] border border-border/40 space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">سعر المنتج:</span>
                    <span className="font-bold">{selectedProduct.price.toLocaleString()} دج</span>
                  </div>
                  <div className="flex justify-between items-center gap-4">
                    <span className="text-muted-foreground text-sm">سعر التوصيل:</span>
                    <div className="w-32">
                      <Input 
                        type="number" 
                        value={orderFormData.deliveryFee}
                        onChange={(e) => setOrderFormData({...orderFormData, deliveryFee: Number(e.target.value)})}
                        className="h-10 rounded-xl font-bold text-center bg-background border-none shadow-inner"
                      />
                    </div>
                  </div>
                  <div className="h-px bg-border/60 my-2" />
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">السعر الكلي:</span>
                    <span className="text-3xl font-black text-secondary">
                      {(selectedProduct.price + orderFormData.deliveryFee).toLocaleString()} دج
                    </span>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button 
                    className="flex-1 h-16 rounded-[1.5rem] bg-secondary text-secondary-foreground font-black text-xl shadow-xl shadow-secondary/20 hover:scale-[1.02] active:scale-95 transition-all"
                    onClick={() => {
                      if (!orderFormData.firstName || !orderFormData.phone || !orderFormData.address || !orderFormData.wilaya) {
                        toast({ title: "يرجى ملء كافة البيانات الأساسية", variant: "destructive" });
                        return;
                      }
                      toast({ title: "تم تسجيل الطلب بنجاح! 🚀", description: "سيتم تتبع الطلب من قسم طلبياتي." });
                      setIsOrderDialogOpen(false);
                      setOrderFormData({ firstName: "", lastName: "", phone: "", wilaya: "", address: "", deliveryType: "home", deliveryFee: 500 });
                    }}
                  >
                    تأكيد الطلب نهائياً
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-16 px-8 rounded-[1.5rem] border-2"
                    onClick={() => setIsOrderDialogOpen(false)}
                  >
                    إلغاء
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
