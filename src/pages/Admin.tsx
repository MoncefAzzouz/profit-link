import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  LayoutDashboard, Users, Package, ShoppingCart, Wallet,
  Settings, Menu, X, TrendingUp, CheckCircle, XCircle,
  Truck, Clock, Eye, Edit, Ban, Search, Filter, Plus,
  BarChart3, ChevronLeft, AlertTriangle, SlidersHorizontal, Store, UserPlus, Check, MapPin, CreditCard,
  Video, Star, EyeOff, Trash2, Upload, FileText, Film, Image as ImageIcon, User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogTrigger
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { mockProducts, categories, Product } from "@/data/mockProducts";
import { mockAffiliates, mockAdminStats, mockAllOrders, mockSellers, mockWithdrawalRequests, WithdrawalRequest, mockJoinRequests, JoinRequest } from "@/data/mockAdminData";
import { shippingRates, shippingRegions } from "@/data/mockShippingData";
import { useToast } from "@/hooks/use-toast";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell
} from "recharts";

type Tab = "overview" | "affiliates" | "sellers" | "join_requests" | "orders" | "products" | "analytics" | "withdrawals" | "settings" | "shipping";

const statusConfig = {
  pending: { label: "قيد الانتظار", icon: Clock, color: "text-yellow-600 bg-yellow-100" },
  confirmed: { label: "مؤكد", icon: CheckCircle, color: "text-blue-600 bg-blue-100" },
  shipped: { label: "قيد التوصيل", icon: Truck, color: "text-purple-600 bg-purple-100" },
  delivered: { label: "تم التسليم", icon: CheckCircle, color: "text-secondary bg-secondary/10" },
  cancelled: { label: "ملغي", icon: XCircle, color: "text-destructive bg-destructive/10" }
};

const affiliateStatusConfig = {
  active: { label: "نشط", color: "text-secondary bg-secondary/10" },
  suspended: { label: "موقوف", color: "text-destructive bg-destructive/10" },
  pending: { label: "قيد المراجعة", color: "text-yellow-600 bg-yellow-100" },
};

const revenueData = [
  { month: "يناير", revenue: 850000, commissions: 390000 },
  { month: "فبراير", revenue: 1200000, commissions: 552000 },
  { month: "مارس", revenue: 980000, commissions: 450800 },
  { month: "أبريل", revenue: 1450000, commissions: 667000 },
  { month: "مايو", revenue: 1680000, commissions: 772800 },
  { month: "يونيو", revenue: 2100000, commissions: 966000 },
];

const orderDistribution = [
  { name: "مسلّمة", value: 3890, color: "hsl(142, 76%, 36%)" },
  { name: "قيد التوصيل", value: 320, color: "hsl(262, 83%, 58%)" },
  { name: "مؤكدة", value: 180, color: "hsl(217, 91%, 60%)" },
  { name: "ملغاة", value: 177, color: "hsl(0, 84%, 60%)" },
];

const Admin = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [affiliateSearch, setAffiliateSearch] = useState("");
  const [affiliateStatus, setAffiliateStatus] = useState("all");
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatus, setOrderStatus] = useState("all");
  const [productSearch, setProductSearch] = useState("");
  const [productCategory, setProductCategory] = useState("الكل");
  const [productPriceRange, setProductPriceRange] = useState(0);
  const [productSort, setProductSort] = useState("default");
  const [productStockFilter, setProductStockFilter] = useState("all");
  const [showProductFilters, setShowProductFilters] = useState(false);
  const [sellerSearch, setSellerSearch] = useState("");
  const [sellerStatus, setSellerStatus] = useState("all");
  const [withdrawalSearch, setWithdrawalSearch] = useState("");
  const [withdrawalStatus, setWithdrawalStatus] = useState("all");
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>(mockJoinRequests);
  const [joinSearch, setJoinSearch] = useState("");
  const [joinRole, setJoinRole] = useState("all");
  const [shippingSearch, setShippingSearch] = useState("");
  
  // Product Management States
  const [products, setProducts] = useState(mockProducts);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productFormData, setProductFormData] = useState<Partial<Product>>({
    name: "",
    description: "",
    adText: "",
    price: 0,
    originalPrice: 0,
    commission: 0,
    category: "إلكترونيات",
    stock: 0,
    image: "",
    videoUrl: "",
    isVisible: true,
    isTrend: false,
    isFeatured: false,
    adMaterials: []
  });

  useEffect(() => {
    // Load persisted requests
    const persistedReqs = JSON.parse(localStorage.getItem("admin_join_requests") || "[]");
    const uniqueReqs = [...persistedReqs, ...mockJoinRequests].filter((v, i, a) => a.findIndex(t => (t.id === v.id)) === i);
    setJoinRequests(uniqueReqs);

    // Load persisted products
    const persistedProds = JSON.parse(localStorage.getItem("admin_products") || "[]");
    // Merge with mock products but ensure persistence overrides/complements
    const uniqueProds = [...persistedProds, ...mockProducts].filter((v, i, a) => a.findIndex(t => (t.id === v.id)) === i);
    setProducts(uniqueProds);
  }, []);

  const saveProductsToStorage = (updatedProducts: Product[]) => {
    // Only save the ones that were potentially modified or added (for simulation simplicity we save all current state)
    localStorage.setItem("admin_products", JSON.stringify(updatedProducts));
  };

  const sidebarItems = [
    { id: "overview" as Tab, label: "نظرة عامة", icon: LayoutDashboard },
    { id: "products" as Tab, label: "المنتجات", icon: Package },
    { id: "affiliates" as Tab, label: "المسوّقين", icon: Users },
    { id: "sellers" as Tab, label: "البائعين", icon: Store },
    { id: "join_requests" as Tab, label: "طلبات الانضمام", icon: UserPlus },
    { id: "orders" as Tab, label: "الطلبيات", icon: ShoppingCart },
    { id: "withdrawals" as Tab, label: "طلبات السحب", icon: Wallet },
    { id: "shipping" as Tab, label: "التوصيل", icon: Truck },
    { id: "analytics" as Tab, label: "الإحصائيات", icon: BarChart3 },
    { id: "settings" as Tab, label: "الإعدادات", icon: Settings },
  ];

  const filteredAffiliates = useMemo(() => {
    return mockAffiliates.filter((affiliate) => {
      const matchesSearch = affiliate.name.includes(affiliateSearch) ||
        affiliate.email.includes(affiliateSearch) ||
        affiliate.phone.includes(affiliateSearch);
      const matchesStatus = affiliateStatus === "all" || affiliate.status === affiliateStatus;
      return matchesSearch && matchesStatus;
    });
  }, [affiliateSearch, affiliateStatus]);

  const filteredSellers = useMemo(() => {
    return mockSellers.filter((seller) => {
      const matchesSearch = seller.name.includes(sellerSearch) ||
        seller.email.includes(sellerSearch) ||
        seller.storeName.includes(sellerSearch) ||
        seller.phone.includes(sellerSearch);
      const matchesStatus = sellerStatus === "all" || seller.status === sellerStatus;
      return matchesSearch && matchesStatus;
    });
  }, [sellerSearch, sellerStatus]);

  const filteredOrders = useMemo(() => {
    return mockAllOrders.filter((order) => {
      const matchesSearch = order.productName.includes(orderSearch) ||
        order.customerName.includes(orderSearch) ||
        order.affiliateName.includes(orderSearch);
      const matchesStatus = orderStatus === "all" || order.status === orderStatus;
      return matchesSearch && matchesStatus;
    });
  }, [orderSearch, orderStatus]);

  const filteredWithdrawals = useMemo(() => {
    return mockWithdrawalRequests.filter((req) => {
      const matchesSearch = req.requesterName.includes(withdrawalSearch) ||
        req.accountDetails.includes(withdrawalSearch);
      const matchesStatus = withdrawalStatus === "all" || req.status === withdrawalStatus;
      return matchesSearch && matchesStatus;
    });
  }, [withdrawalSearch, withdrawalStatus]);

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
    return products
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

  const filteredJoinRequests = useMemo(() => {
    return joinRequests.filter((req) => {
      const matchesSearch = req.name.includes(joinSearch) || req.email.includes(joinSearch) || req.phone.includes(joinSearch);
      const matchesRole = joinRole === "all" || req.role === joinRole;
      return matchesSearch && matchesRole;
    });
  }, [joinRequests, joinSearch, joinRole]);

  const handleApproveJoin = (id: string) => {
    setJoinRequests(prev => {
      const updated = prev.filter(r => r.id !== id);
      // Persist to localStorage (only the ones not in mock data ideally, but for simulation let's just save the current ones minus mocks if we want, or just filter localStorage)
      const persisted = JSON.parse(localStorage.getItem("admin_join_requests") || "[]");
      localStorage.setItem("admin_join_requests", JSON.stringify(persisted.filter((r: any) => r.id !== id)));
      return updated;
    });
    toast({ title: "تم قبول الطلب بنجاح ✅", description: "تم تفعيل حساب المستخدم وإرسال بريد إلكتروني له." });
  };

  const handleRejectJoin = (id: string) => {
    setJoinRequests(prev => {
      const updated = prev.filter(r => r.id !== id);
      const persisted = JSON.parse(localStorage.getItem("admin_join_requests") || "[]");
      localStorage.setItem("admin_join_requests", JSON.stringify(persisted.filter((r: any) => r.id !== id)));
      return updated;
    });
    toast({ title: "تم رفض الطلب", variant: "destructive" });
  };

  // Product CRUD Handlers
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProductFormData({
      name: "",
      description: "",
      adText: "",
      price: 0,
      originalPrice: 0,
      commission: 0,
      category: "إلكترونيات",
      stock: 0,
      image: "",
      videoUrl: "",
      isVisible: true,
      isTrend: false,
      isFeatured: false,
      adMaterials: []
    });
    setIsProductDialogOpen(true);
  };

  const handleOpenEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductFormData({ ...product });
    setIsProductDialogOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const productToSave = {
      ...productFormData,
      id: editingProduct?.id || `prod-${Date.now()}`,
      images: productFormData.image ? [productFormData.image] : [],
      features: productFormData.features || []
    } as Product;

    const updatedProducts = editingProduct 
      ? products.map(p => p.id === editingProduct.id ? productToSave : p)
      : [productToSave, ...products];

    setProducts(updatedProducts);
    saveProductsToStorage(updatedProducts);
    setIsProductDialogOpen(false);
    toast({
      title: editingProduct ? "تم تحديث المنتج بنجاح" : "تم إضافة المنتج بنجاح",
      description: `المنتج "${productToSave.name}" جاهز الآن.`,
    });
  };

  const handleDeleteProduct = (id: string) => {
    const updatedProducts = products.filter(p => p.id !== id);
    setProducts(updatedProducts);
    saveProductsToStorage(updatedProducts);
    toast({ title: "تم حذف المنتج", variant: "destructive" });
  };

  const handleToggleProductStatus = (id: string, field: keyof Product) => {
    const updatedProducts = products.map(p => {
      if (p.id === id) {
        return { ...p, [field]: !p[field] };
      }
      return p;
    });
    setProducts(updatedProducts);
    saveProductsToStorage(updatedProducts);
    toast({ title: "تم تحديث حالة المنتج" });
  };

  const filteredShippingRates = useMemo(() => {
    return shippingRates.filter(rate => 
      rate.wilaya.includes(shippingSearch)
    );
  }, [shippingSearch]);

  const handleSuspendAffiliate = (id: string) => {
    toast({ title: "تم إيقاف المسوّق" });
  };

  const handleUpdateOrderStatus = (id: string, status: string) => {
    toast({ title: `تم تحديث حالة الطلبية إلى ${status}` });
  };

  return (
    <div className="dashboard-page-admin">
      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 right-0 z-50 w-72 shrink-0 bg-gradient-to-b from-slate-900 via-[hsl(222,47%,12%)] to-[hsl(222,47%,7%)] text-white border-l border-white/[0.07] shadow-[4px_0_40px_-12px_rgba(0,0,0,0.45)] transform transition-transform duration-300 ease-out ${sidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        }`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 pt-5">
            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-md">
              <Link to="/" className="flex items-center gap-3">
                <div className="w-11 h-11 bg-gradient-to-br from-emerald-400 to-emerald-700 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30 ring-2 ring-white/10">
                  <span className="text-white font-bold text-lg">L</span>
                </div>
                <div>
                  <span className="text-lg font-bold tracking-tight">LinkDZ</span>
                  <span className="block text-xs text-emerald-200/85 font-medium">لوحة الإدارة</span>
                </div>
              </Link>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-200 ${activeTab === item.id
                    ? "bg-white/[0.12] text-white shadow-lg shadow-black/25 ring-1 ring-emerald-400/35"
                    : "text-white/65 hover:bg-white/[0.08] hover:text-white"
                  }`}
              >
                <item.icon className="w-5 h-5 shrink-0 opacity-90" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-white/[0.08]">
            <Link to="/dashboard">
              <Button variant="secondary" className="w-full gap-2 rounded-xl bg-white/10 text-white border-white/15 hover:bg-white/20 hover:text-white">
                <ChevronLeft className="w-4 h-4" />
                العودة للداشبورد
              </Button>
            </Link>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/55 backdrop-blur-[2px] lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}

      {/* Main Content */}
      <main className="flex-1 min-h-screen flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 border-b border-border/50 bg-white/90 backdrop-blur-xl px-4 md:px-6 py-3.5 shadow-sm supports-[backdrop-filter]:bg-white/80 dark:bg-slate-950/80">
          <div className="flex items-center justify-between gap-3 max-w-[1600px] mx-auto w-full">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2.5 rounded-xl hover:bg-muted/90 border border-transparent hover:border-border/60 transition-colors"
              aria-label="فتح القائمة"
            >
              <Menu className="w-6 h-6 text-foreground" />
            </button>
            <div className="flex items-center gap-3 min-w-0 flex-1 justify-center lg:justify-start">
              <h1 className="text-lg md:text-xl font-bold text-foreground tracking-tight truncate">
                {sidebarItems.find(item => item.id === activeTab)?.label}
              </h1>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="hidden sm:inline-flex text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-2.5 py-1 rounded-full bg-muted/90 border border-border/50">
                Admin
              </span>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-navy-800 flex items-center justify-center ring-2 ring-emerald-500/20 shadow-md">
                <span className="text-primary-foreground font-bold text-sm">A</span>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 p-4 md:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="dash-card-interactive p-6"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm">إجمالي الإيرادات</p>
                      <p className="text-3xl font-bold text-foreground mt-1">
                        {mockAdminStats.totalRevenue.toLocaleString()}
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
                  className="dash-card-interactive p-6"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm">المسوّقين النشطين</p>
                      <p className="text-3xl font-bold text-foreground mt-1">
                        {mockAdminStats.activeAffiliates}
                      </p>
                      <p className="text-sm text-secondary">من {mockAdminStats.totalAffiliates}</p>
                    </div>
                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                      <Users className="w-7 h-7 text-primary" />
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="dash-card-interactive p-6"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm">إجمالي الطلبيات</p>
                      <p className="text-3xl font-bold text-foreground mt-1">
                        {mockAdminStats.totalOrders}
                      </p>
                      <p className="text-sm text-secondary">+{mockAdminStats.ordersThisMonth} هذا الشهر</p>
                    </div>
                    <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center">
                      <ShoppingCart className="w-7 h-7 text-accent" />
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="dash-card-interactive p-6"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm">نسبة التأكيد</p>
                      <p className="text-3xl font-bold text-foreground mt-1">
                        {mockAdminStats.averageConfirmationRate}%
                      </p>
                      <p className="text-sm text-secondary">معدل ممتاز</p>
                    </div>
                    <div className="w-14 h-14 bg-secondary/10 rounded-2xl flex items-center justify-center">
                      <TrendingUp className="w-7 h-7 text-secondary" />
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Charts */}
              <div className="grid lg:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="dash-card-interactive p-6"
                >
                  <h3 className="text-lg font-bold text-foreground mb-4">الإيرادات والعمولات</h3>
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={revenueData}>
                        <defs>
                          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="commissionGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                        <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                          formatter={(value: any) => [`${value.toLocaleString()} دج`, ""]}
                        />
                        <Area type="monotone" dataKey="revenue" stroke="hsl(142, 76%, 36%)" fill="url(#revenueGradient)" name="الإيرادات" />
                        <Area type="monotone" dataKey="commissions" stroke="hsl(217, 91%, 60%)" fill="url(#commissionGradient)" name="العمولات" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="dash-card-interactive p-6"
                >
                  <h3 className="text-lg font-bold text-foreground mb-4">توزيع الطلبيات</h3>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={orderDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {orderDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: any) => [`${value} طلبية`, ""]} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap justify-center gap-3 mt-2">
                    {orderDistribution.map((item) => (
                      <div key={item.name} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-sm text-muted-foreground">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* Recent Activity */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="dash-card overflow-hidden"
              >
                <div className="p-6 border-b border-border flex items-center justify-between">
                  <h2 className="text-lg font-bold text-foreground">آخر الطلبيات</h2>
                  <button onClick={() => setActiveTab("orders")} className="text-secondary text-sm font-medium flex items-center gap-1 hover:underline">
                    عرض الكل <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>
                <div className="divide-y divide-border">
                  {mockAllOrders.slice(0, 5).map((order) => {
                    const status = statusConfig[order.status as keyof typeof statusConfig];
                    return (
                      <div key={order.id} className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${status.color}`}>
                            <status.icon className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{order.productName}</p>
                            <p className="text-sm text-muted-foreground">{order.affiliateName} • {order.wilaya}</p>
                          </div>
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-foreground">{order.amount.toLocaleString()} دج</p>
                          <p className="text-xs text-muted-foreground">{order.date}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </div>
          )}

          {/* Affiliates Tab */}
          {activeTab === "affiliates" && (
            <div className="space-y-6">
              {/* Filters */}
              <div className="dash-card p-4 flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="ابحث عن مسوّق..."
                    value={affiliateSearch}
                    onChange={(e) => setAffiliateSearch(e.target.value)}
                    className="pr-10"
                  />
                </div>
                <Select value={affiliateStatus} onValueChange={setAffiliateStatus}>
                  <SelectTrigger className="w-[160px]">
                    <Filter className="w-4 h-4 ml-2" />
                    <SelectValue placeholder="الحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الحالات</SelectItem>
                    <SelectItem value="active">نشط</SelectItem>
                    <SelectItem value="suspended">موقوف</SelectItem>
                    <SelectItem value="pending">قيد المراجعة</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Affiliates Table */}
              <div className="dash-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-100/95 dark:bg-slate-800/60 border-b border-border/50">
                      <tr>
                        <th className="text-right p-4 font-semibold text-foreground">المسوّق</th>
                        <th className="text-right p-4 font-semibold text-foreground">المستوى</th>
                        <th className="text-right p-4 font-semibold text-foreground">الطلبيات</th>
                        <th className="text-right p-4 font-semibold text-foreground">الأرباح</th>
                        <th className="text-right p-4 font-semibold text-foreground">نسبة التأكيد</th>
                        <th className="text-right p-4 font-semibold text-foreground">الحالة</th>
                        <th className="text-right p-4 font-semibold text-foreground">إجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredAffiliates.map((affiliate) => {
                        const status = affiliateStatusConfig[affiliate.status];
                        return (
                          <tr key={affiliate.id} className="hover:bg-muted/50 transition-colors">
                            <td className="p-4">
                              <div>
                                <p className="font-medium text-foreground">{affiliate.name}</p>
                                <p className="text-sm text-muted-foreground">{affiliate.email}</p>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                                المستوى {affiliate.level}
                              </span>
                            </td>
                            <td className="p-4 text-foreground">
                              {affiliate.confirmedOrders}/{affiliate.totalOrders}
                            </td>
                            <td className="p-4 font-bold text-secondary">
                              {affiliate.totalEarnings.toLocaleString()} دج
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${affiliate.confirmationRate >= 80 ? "bg-secondary" : affiliate.confirmationRate >= 60 ? "bg-yellow-500" : "bg-destructive"}`}
                                    style={{ width: `${affiliate.confirmationRate}%` }}
                                  />
                                </div>
                                <span className="text-sm text-muted-foreground">{affiliate.confirmationRate}%</span>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
                                {status.label}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex gap-2">
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive hover:text-destructive"
                                  onClick={() => handleSuspendAffiliate(affiliate.id)}
                                >
                                  <Ban className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Sellers Tab */}
          {activeTab === "sellers" && (
            <div className="space-y-6">
              {/* Filters */}
              <div className="dash-card p-4 flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="ابحث عن بائع..."
                    value={sellerSearch}
                    onChange={(e) => setSellerSearch(e.target.value)}
                    className="pr-10"
                  />
                </div>
                <Select value={sellerStatus} onValueChange={setSellerStatus}>
                  <SelectTrigger className="w-[160px]">
                    <Filter className="w-4 h-4 ml-2" />
                    <SelectValue placeholder="الحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الحالات</SelectItem>
                    <SelectItem value="active">نشط</SelectItem>
                    <SelectItem value="suspended">موقوف</SelectItem>
                    <SelectItem value="pending">قيد المراجعة</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sellers Table */}
              <div className="dash-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-100/95 dark:bg-slate-800/60 border-b border-border/50">
                      <tr>
                        <th className="text-right p-4 font-semibold text-foreground">البائع</th>
                        <th className="text-right p-4 font-semibold text-foreground">المتجر</th>
                        <th className="text-right p-4 font-semibold text-foreground">الولاية</th>
                        <th className="text-right p-4 font-semibold text-foreground">المنتجات</th>
                        <th className="text-right p-4 font-semibold text-foreground">الإيرادات</th>
                        <th className="text-right p-4 font-semibold text-foreground">الطلبيات</th>
                        <th className="text-right p-4 font-semibold text-foreground">الحالة</th>
                        <th className="text-right p-4 font-semibold text-foreground">إجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredSellers.map((seller) => {
                        const status = affiliateStatusConfig[seller.status];
                        return (
                          <tr key={seller.id} className="hover:bg-muted/50 transition-colors">
                            <td className="p-4">
                              <div>
                                <p className="font-medium text-foreground">{seller.name}</p>
                                <p className="text-sm text-muted-foreground">{seller.email}</p>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <Store className="w-4 h-4 text-muted-foreground" />
                                <span className="text-foreground font-medium">{seller.storeName}</span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5">{seller.category}</p>
                            </td>
                            <td className="p-4 text-muted-foreground">{seller.wilaya}</td>
                            <td className="p-4 text-foreground font-medium">{seller.totalProducts}</td>
                            <td className="p-4 font-bold text-secondary">
                              {seller.totalRevenue.toLocaleString()} دج
                            </td>
                            <td className="p-4 text-foreground">{seller.totalOrders}</td>
                            <td className="p-4">
                              <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
                                {status.label}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex gap-2">
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive hover:text-destructive"
                                  onClick={() => toast({ title: "تم إيقاف البائع" })}
                                >
                                  <Ban className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {filteredSellers.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">لا يوجد بائعين مطابقين للبحث</p>
                </div>
              )}
            </div>
          )}

          {/* Join Requests Tab */}
          {activeTab === "join_requests" && (
            <div className="space-y-6">
              {/* Filters */}
              <div className="dash-card p-4 flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="ابحث في طلبات الانضمام..."
                    value={joinSearch}
                    onChange={(e) => setJoinSearch(e.target.value)}
                    className="pr-10"
                  />
                </div>
                <Select value={joinRole} onValueChange={setJoinRole}>
                  <SelectTrigger className="w-[160px]">
                    <Filter className="w-4 h-4 ml-2" />
                    <SelectValue placeholder="النوع" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">الكل</SelectItem>
                    <SelectItem value="affiliate">مسوّق</SelectItem>
                    <SelectItem value="seller">بائع</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Join Requests Table */}
              <div className="dash-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-100/95 dark:bg-slate-800/60 border-b border-border/50">
                      <tr>
                        <th className="text-right p-4 font-semibold text-foreground">الاسم</th>
                        <th className="text-right p-4 font-semibold text-foreground">النوع</th>
                        <th className="text-right p-4 font-semibold text-foreground">الموقع / النشاط</th>
                        <th className="text-right p-4 font-semibold text-foreground">التاريخ</th>
                        <th className="text-right p-4 font-semibold text-foreground">إجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredJoinRequests.map((req) => (
                        <tr key={req.id} className="hover:bg-muted/50 transition-colors">
                          <td className="p-4">
                            <div>
                              <p className="font-bold text-foreground">{req.name}</p>
                              <p className="text-xs text-muted-foreground font-mono">{req.email}</p>
                              <p className="text-[10px] text-muted-foreground">{req.phone}</p>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${req.role === "affiliate" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
                              }`}>
                              {req.role === "affiliate" ? "مسوّق" : "بائع"}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="space-y-0.5">
                              <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-muted-foreground" /> {req.wilaya}
                              </p>
                              {req.role === "seller" && (
                                <p className="text-xs text-secondary font-bold flex items-center gap-1.5">
                                  <Store className="w-3.5 h-3.5" /> {req.storeName}
                                </p>
                              )}
                              {req.role === "affiliate" && (
                                <p className="text-[10px] text-muted-foreground font-mono flex items-center gap-1.5">
                                  <CreditCard className="w-3.5 h-3.5" /> {req.ccp}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="p-4 text-sm text-muted-foreground font-medium">{req.date}</td>
                          <td className="p-4 text-left">
                            <div className="flex gap-2 justify-end">
                              <Button
                                size="sm"
                                variant="hero"
                                className="bg-secondary hover:bg-secondary/90 h-9 px-4 rounded-xl gap-2 shadow-lg shadow-secondary/20"
                                onClick={() => handleApproveJoin(req.id)}
                              >
                                <Check className="w-4 h-4" /> قبول
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-9 px-4 rounded-xl gap-2 border-destructive/20 text-destructive hover:bg-destructive/5 hover:text-destructive hover:border-destructive/30"
                                onClick={() => handleRejectJoin(req.id)}
                              >
                                <X className="w-4 h-4" /> رفض
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {filteredJoinRequests.length === 0 && (
                  <div className="text-center py-20 bg-muted/20">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 border border-border/50 shadow-inner">
                      <UserPlus className="w-8 h-8 text-muted-foreground/30" />
                    </div>
                    <p className="text-muted-foreground font-bold">لا توجد طلبات انضمام حالياً</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-1">سيظهر الطلبات الجديدة هنا للمراجعة والقبول.</p>
                  </div>
                )}
              </div>
            </div>
          )}


          {activeTab === "orders" && (
            <div className="space-y-6">
              {/* Filters */}
              <div className="dash-card p-4 flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="ابحث عن طلبية..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="pr-10"
                  />
                </div>
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
              </div>

              {/* Orders Table */}
              <div className="dash-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-100/95 dark:bg-slate-800/60 border-b border-border/50">
                      <tr>
                        <th className="text-right p-4 font-semibold text-foreground">المنتج</th>
                        <th className="text-right p-4 font-semibold text-foreground">الزبون</th>
                        <th className="text-right p-4 font-semibold text-foreground">المسوّق</th>
                        <th className="text-right p-4 font-semibold text-foreground">الولاية</th>
                        <th className="text-right p-4 font-semibold text-foreground">المبلغ</th>
                        <th className="text-right p-4 font-semibold text-foreground">الحالة</th>
                        <th className="text-right p-4 font-semibold text-foreground">إجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredOrders.map((order) => {
                        const status = statusConfig[order.status as keyof typeof statusConfig];
                        return (
                          <tr key={order.id} className="hover:bg-muted/50 transition-colors">
                            <td className="p-4">
                              <p className="font-medium text-foreground">{order.productName}</p>
                              <p className="text-sm text-muted-foreground">x{order.quantity}</p>
                            </td>
                            <td className="p-4">
                              <p className="text-foreground">{order.customerName}</p>
                              <p className="text-sm text-muted-foreground">{order.customerPhone}</p>
                            </td>
                            <td className="p-4 text-muted-foreground">{order.affiliateName}</td>
                            <td className="p-4 text-muted-foreground">{order.wilaya}</td>
                            <td className="p-4 font-bold text-foreground">{order.amount.toLocaleString()} دج</td>
                            <td className="p-4">
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
                                <status.icon className="w-4 h-4" />
                                {status.label}
                              </span>
                            </td>
                            <td className="p-4">
                              <Select
                                value={order.status}
                                onValueChange={(value) => handleUpdateOrderStatus(order.id, value)}
                              >
                                <SelectTrigger className="w-[140px] h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">قيد الانتظار</SelectItem>
                                  <SelectItem value="confirmed">مؤكد</SelectItem>
                                  <SelectItem value="shipped">قيد التوصيل</SelectItem>
                                  <SelectItem value="delivered">تم التسليم</SelectItem>
                                  <SelectItem value="cancelled">ملغي</SelectItem>
                                </SelectContent>
                              </Select>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
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
                    <Button className="h-12 gap-2 rounded-xl" onClick={handleOpenAddProduct}>
                      <Plus className="w-4 h-4" />
                      إضافة منتج
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
                    <span>{filteredProducts.length} منتج من أصل {products.length}</span>
                  </div>
                )}
              </div>

              {/* Products Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="dash-card overflow-hidden"
                  >
                    <div className="aspect-video relative group">
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                         <Button size="sm" variant="secondary" className="rounded-full h-9 w-9 p-0" onClick={() => handleToggleProductStatus(product.id, 'isVisible')}>
                            {product.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                         </Button>
                         <Button size="sm" variant="secondary" className="rounded-full h-9 w-9 p-0" onClick={() => handleToggleProductStatus(product.id, 'isTrend')}>
                            <TrendingUp className={`w-4 h-4 ${product.isTrend ? "text-orange-500" : ""}`} />
                         </Button>
                         <Button size="sm" variant="secondary" className="rounded-full h-9 w-9 p-0" onClick={() => handleToggleProductStatus(product.id, 'isFeatured')}>
                            <Star className={`w-4 h-4 ${product.isFeatured ? "text-yellow-500 fill-yellow-500" : ""}`} />
                         </Button>
                      </div>
                      <div className="absolute top-3 right-3 flex flex-col gap-2">
                        {!product.isVisible && <Badge variant="destructive" className="font-bold">مخفي</Badge>}
                        {product.isTrend && <Badge className="bg-orange-500 hover:bg-orange-600 font-bold border-none shadow-lg">ترند 🔥</Badge>}
                        {product.isFeatured && <Badge className="bg-yellow-500 hover:bg-yellow-600 font-bold border-none shadow-lg text-black">مميز ⭐</Badge>}
                      </div>
                      <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm text-slate-900 px-3 py-1 rounded-full text-[10px] font-bold shadow-lg">
                        {product.stock} قـطـعـة
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="outline" className="text-[10px] py-0">{product.category}</Badge>
                        {product.videoUrl && <Video className="w-4 h-4 text-primary animate-pulse" />}
                      </div>
                      <h3 className="font-bold text-foreground line-clamp-1">{product.name}</h3>
                      <div className="flex justify-between items-end mt-4">
                        <div className="space-y-0.5">
                          <p className="text-xs text-muted-foreground line-through opacity-50">{product.originalPrice.toLocaleString()} دج</p>
                          <p className="text-xl font-black text-secondary">{product.price.toLocaleString()} دج</p>
                        </div>
                        <div className="text-left">
                          <p className="text-[10px] text-muted-foreground font-bold">العمولة</p>
                          <p className="font-bold text-primary">{product.commission.toLocaleString()} دج</p>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-6">
                        <Button variant="outline" className="flex-1 gap-2 rounded-xl h-10 font-bold text-xs" onClick={() => handleOpenEditProduct(product)}>
                          <Edit className="w-3.5 h-3.5" />
                          تعديل
                        </Button>
                        <Button variant="ghost" size="icon" className="h-10 w-10 text-destructive hover:bg-destructive/10 rounded-xl" onClick={() => handleDeleteProduct(product.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Withdrawals Tab */}
          {activeTab === "withdrawals" && (
            <div className="space-y-6">
              {/* Stats for Withdrawals */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "طلبات معلقة", value: mockWithdrawalRequests.filter(r => r.status === "pending").length, color: "text-amber-600 bg-amber-50" },
                  { label: "إجمالي السحوبات", value: `${mockWithdrawalRequests.filter(r => r.status === "completed").reduce((sum, r) => sum + r.amount, 0).toLocaleString()} دج`, color: "text-emerald-600 bg-emerald-50 col-span-2" },
                ].map((stat, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`dash-card p-4 flex flex-col items-center justify-center text-center ${stat.color}`}>
                    <p className="text-2xl font-black">{stat.value}</p>
                    <p className="text-xs font-bold opacity-80">{stat.label}</p>
                  </motion.div>
                ))}
              </div>

              {/* Filters */}
              <div className="dash-card p-4 flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="ابحث عن اسم أو حساب..."
                    value={withdrawalSearch}
                    onChange={(e) => setWithdrawalSearch(e.target.value)}
                    className="pr-10"
                  />
                </div>
                <Select value={withdrawalStatus} onValueChange={setWithdrawalStatus}>
                  <SelectTrigger className="w-[160px]">
                    <Filter className="w-4 h-4 ml-2" />
                    <SelectValue placeholder="الحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الحالات</SelectItem>
                    <SelectItem value="pending">قيد الانتظار</SelectItem>
                    <SelectItem value="completed">تم الدفع</SelectItem>
                    <SelectItem value="rejected">مرفوض</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Table */}
              <div className="dash-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-100/95 dark:bg-slate-800/60 border-b border-border/50">
                      <tr>
                        <th className="text-right p-4 font-semibold text-foreground text-sm">المستفيد</th>
                        <th className="text-right p-4 font-semibold text-foreground text-sm">المبلغ</th>
                        <th className="text-right p-4 font-semibold text-foreground text-sm">طريقة الدفع</th>
                        <th className="text-right p-4 font-semibold text-foreground text-sm">الحالة</th>
                        <th className="text-right p-4 font-semibold text-foreground text-sm">التاريخ</th>
                        <th className="text-right p-4 font-semibold text-foreground text-sm">إجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredWithdrawals.length > 0 ? filteredWithdrawals.map((req) => (
                        <tr key={req.id} className="hover:bg-muted/50 transition-colors">
                          <td className="p-4">
                            <p className="font-bold text-foreground text-sm">{req.requesterName}</p>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${req.requesterType === "seller" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"}`}>
                              {req.requesterType === "seller" ? "بائع" : "مسوّق"}
                            </span>
                          </td>
                          <td className="p-4 font-black text-foreground text-sm">
                            {req.amount.toLocaleString()} دج
                          </td>
                          <td className="p-4">
                            <p className="text-xs font-bold text-foreground">{req.method}</p>
                            <p className="text-[10px] text-muted-foreground font-mono">{req.accountDetails}</p>
                          </td>
                          <td className="p-4">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${req.status === "pending" ? "bg-amber-100 text-amber-700" :
                                req.status === "completed" ? "bg-emerald-100 text-emerald-700" :
                                  "bg-red-100 text-red-700"
                              }`}>
                              {req.status === "pending" ? "قيد الانتظار" : req.status === "completed" ? "تم الدفع" : "مرفوض"}
                            </span>
                          </td>
                          <td className="p-4 text-xs text-muted-foreground">{req.date}</td>
                          <td className="p-4">
                            {req.status === "pending" && (
                              <div className="flex gap-2">
                                <Button size="sm" className="h-8 text-[10px] bg-emerald-600 hover:bg-emerald-700" onClick={() => toast({ title: "تم قبول الطلب", description: "سيتم تحويل المبلغ قريباً" })}>
                                  قبول
                                </Button>
                                <Button size="sm" variant="destructive" className="h-8 text-[10px]" onClick={() => toast({ title: "تم رفض الطلب", variant: "destructive" })}>
                                  رفض
                                </Button>
                              </div>
                            )}
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-muted-foreground text-sm">لا توجد طلبات سحب حالياً</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === "analytics" && (
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="dash-card-interactive p-6"
              >
                <h3 className="text-lg font-bold text-foreground mb-6">تحليل المبيعات الشهرية</h3>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                      <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                        formatter={(value: any) => [`${value.toLocaleString()} دج`, ""]}
                      />
                      <Bar dataKey="revenue" fill="hsl(142, 76%, 36%)" radius={[4, 4, 0, 0]} name="الإيرادات" />
                      <Bar dataKey="commissions" fill="hsl(217, 91%, 60%)" radius={[4, 4, 0, 0]} name="العمولات" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className="max-w-2xl space-y-6">
              <div className="dash-card-interactive p-6">
                <h3 className="text-lg font-bold text-foreground mb-4">إعدادات المنصة</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
                    <div>
                      <p className="font-semibold text-foreground">نسبة العمولة الافتراضية</p>
                      <p className="text-sm text-muted-foreground">النسبة التي يحصل عليها المسوّق</p>
                    </div>
                    <span className="text-xl font-bold text-secondary">50%</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
                    <div>
                      <p className="font-semibold text-foreground">يوم الدفع</p>
                      <p className="text-sm text-muted-foreground">يتم تحويل الأرباح كل</p>
                    </div>
                    <span className="text-lg font-bold text-foreground">نهاية الأسبوع</span>
                  </div>
                </div>
              </div>
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
                      
                      <div className="absolute bottom-4 right-4 bg-background/80 backdrop-blur-sm p-4 rounded-2xl border border-border/50 shadow-lg" dir="rtl">
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
                <div className="lg:w-2/3 space-y-6" dir="rtl">
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
              <div className="bg-card rounded-[2.5rem] shadow-sm border border-border/50 overflow-hidden" dir="rtl">
                <div className="p-8 border-b border-border flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-black text-foreground">قائمة الأسعار حسب الولايات</h3>
                    <p className="text-muted-foreground mt-1 text-sm">تفاصيل تكاليف الشحن ومدة التوصيل لكل ولاية.</p>
                  </div>
                  <div className="flex items-center gap-3 w-full sm:w-64">
                    <div className="relative w-full">
                      <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input 
                        placeholder="ابحث عن ولاية..." 
                        value={shippingSearch}
                        onChange={(e) => setShippingSearch(e.target.value)}
                        className="pr-10 rounded-xl h-10 w-full border-border/60" 
                      />
                    </div>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-right">
                    <thead>
                      <tr className="bg-muted/50 border-b border-border">
                        <th className="p-6 font-bold text-foreground">الولاية</th>
                        <th className="p-6 font-bold text-foreground">التوصيل للمنزل</th>
                        <th className="p-6 font-bold text-foreground">التوصيل للمكتب</th>
                        <th className="p-6 font-bold text-foreground text-center">وقت التوصيل</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredShippingRates.length > 0 ? (
                        filteredShippingRates.map((rate, idx) => (
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
                              <span className="flex items-center justify-center gap-2 text-muted-foreground font-medium">
                                <Clock className="w-4 h-4" />
                                {rate.deliveryTime}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="p-12 text-center text-muted-foreground">
                            لا توجد ولاية تطابق البحث "{shippingSearch}"
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      {/* Product Management Dialog */}
      <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 rounded-3xl border-none font-cairo" dir="rtl">
          <DialogHeader className="p-8 pb-0 text-right">
            <DialogTitle className="text-2xl font-black flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                {editingProduct ? <Edit className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
              </div>
              <div>
                <p>{editingProduct ? "تعديل منتج" : "إضافة منتج جديد"}</p>
                <p className="text-xs text-muted-foreground font-bold mt-1">أدخل معلومات المنتج بعناية لجذب المسوّقين</p>
              </div>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveProduct} className="p-8 pt-6 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column: Basic Info */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="font-bold text-sm">اسم المنتج</Label>
                  <Input 
                    value={productFormData.name} 
                    onChange={e => setProductFormData({...productFormData, name: e.target.value})} 
                    placeholder="مثال: ساعة ذكية الترا" 
                    className="h-12 rounded-xl bg-muted/30 border-none px-4"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-bold text-sm">الفئة (Niche)</Label>
                    <Select 
                      value={productFormData.category} 
                      onValueChange={v => setProductFormData({...productFormData, category: v})}
                    >
                      <SelectTrigger className="h-12 rounded-xl bg-muted/30 border-none px-4 text-right">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent dir="rtl">
                        {categories.filter(c => c !== "الكل").map(c => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold text-sm">المخزون المتوفر</Label>
                    <Input 
                      type="number"
                      value={productFormData.stock} 
                      onChange={e => setProductFormData({...productFormData, stock: Number(e.target.value)})} 
                      className="h-12 rounded-xl bg-muted/30 border-none px-4"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="font-bold text-sm">وصف المنتج (مميزات)</Label>
                  <Textarea 
                    value={productFormData.description} 
                    onChange={e => setProductFormData({...productFormData, description: e.target.value})} 
                    placeholder="اشرح مميزات المنتج التقنية..." 
                    className="min-h-[100px] rounded-xl bg-muted/30 border-none p-4"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="font-bold text-sm text-secondary">النص الإعلاني الجاهز</Label>
                  <Textarea 
                    value={productFormData.adText} 
                    onChange={e => setProductFormData({...productFormData, adText: e.target.value})} 
                    placeholder="اكتب نصاً جذاباً للمسوّقين لنسخه مباشرة..." 
                    className="min-h-[120px] rounded-xl bg-secondary/5 border-secondary/20 p-4 font-medium"
                  />
                </div>
              </div>

              {/* Right Column: Pricing & Media */}
              <div className="space-y-6">
                 <div className="p-6 rounded-3xl bg-secondary/5 border border-secondary/10 space-y-4">
                    <h4 className="font-black text-sm text-secondary flex items-center gap-2">
                      <Wallet className="w-4 h-4" /> إدارة الأسعار والعمولة
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold opacity-70">السعر الأصلي</Label>
                        <Input 
                          type="number"
                          value={productFormData.originalPrice} 
                          onChange={e => setProductFormData({...productFormData, originalPrice: Number(e.target.value)})} 
                          placeholder="المشطوب"
                          className="h-11 rounded-xl bg-white border-none px-3 font-mono"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold">سعر البيع النهائي</Label>
                        <Input 
                          type="number"
                          value={productFormData.price} 
                          onChange={e => setProductFormData({...productFormData, price: Number(e.target.value)})} 
                          placeholder="السعر الفعلي"
                          className="h-11 rounded-xl bg-white border-none px-3 font-mono font-bold text-secondary"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-primary">العمولة (دج)</Label>
                      <div className="relative">
                        <Input 
                          type="number"
                          value={productFormData.commission} 
                          onChange={e => setProductFormData({...productFormData, commission: Number(e.target.value)})} 
                          placeholder="50% من سعر البيع؟"
                          className="h-12 rounded-xl bg-primary/5 border-primary/20 px-4 font-black text-primary text-xl"
                        />
                        <Button 
                          type="button"
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setProductFormData({...productFormData, commission: (productFormData.price || 0) * 0.5})}
                          className="absolute left-2 top-1/2 -translate-y-1/2 h-8 text-[10px] font-black hover:bg-primary/10"
                        >
                          حساب 50%
                        </Button>
                      </div>
                    </div>
                 </div>

                 <div className="space-y-2">
                    <Label className="font-bold text-sm">رابط الصورة الرئيسية</Label>
                    <div className="relative">
                      <ImageIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        value={productFormData.image} 
                        onChange={e => setProductFormData({...productFormData, image: e.target.value})} 
                        placeholder="https://images..." 
                        className="h-12 pr-12 rounded-xl bg-muted/30 border-none px-4"
                      />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <Label className="font-bold text-sm">رابط فيديو المراجعة</Label>
                    <div className="relative">
                      <Video className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        value={productFormData.videoUrl} 
                        onChange={e => setProductFormData({...productFormData, videoUrl: e.target.value})} 
                        placeholder="Youtube / Instagram link..." 
                        className="h-12 pr-12 rounded-xl bg-muted/30 border-none px-4"
                      />
                    </div>
                 </div>

                 <div className="flex gap-4 pt-4 border-t border-border">
                    <div className="flex items-center gap-2">
                       <Switch 
                        checked={productFormData.isTrend} 
                        onCheckedChange={v => setProductFormData({...productFormData, isTrend: v})} 
                       />
                       <span className="text-sm font-bold flex items-center gap-1.5"><TrendingUp className="w-4 h-4 text-orange-500" /> ترند</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <Switch 
                        checked={productFormData.isFeatured} 
                        onCheckedChange={v => setProductFormData({...productFormData, isFeatured: v})} 
                       />
                       <span className="text-sm font-bold flex items-center gap-1.5"><Star className="w-4 h-4 text-yellow-500 fill-yellow-500" /> مميز</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <Switch 
                        checked={productFormData.isVisible} 
                        onCheckedChange={v => setProductFormData({...productFormData, isVisible: v})} 
                       />
                       <span className="text-sm font-bold flex items-center gap-1.5"><Eye className="w-4 h-4" /> مرئي</span>
                    </div>
                 </div>
              </div>
            </div>

            {/* Ad Materials Section */}
            <div className="p-6 rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 space-y-4">
               <h4 className="font-black text-sm flex items-center gap-2">
                 <Upload className="w-4 h-4 text-primary" /> رفع محتوى إعلاني جاهز (صور + نصوص)
               </h4>
               <p className="text-[10px] text-muted-foreground font-bold">يمكنك إضافة روابط لصور إضافية أو نصوص إعلانية بديلة ليستخدمها المسوّقون</p>
               
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button type="button" variant="outline" className="h-11 rounded-xl border-dashed gap-2" onClick={() => setProductFormData({
                    ...productFormData, 
                    adMaterials: [...(productFormData.adMaterials || []), { type: 'image', content: '' }]
                  })}>
                    <ImageIcon className="w-4 h-4" /> إضافة رابط صورة
                  </Button>
                  <Button type="button" variant="outline" className="h-11 rounded-xl border-dashed gap-2" onClick={() => setProductFormData({
                    ...productFormData, 
                    adMaterials: [...(productFormData.adMaterials || []), { type: 'text', content: '' }]
                  })}>
                    <FileText className="w-4 h-4" /> إضافة مسودة نص
                  </Button>
               </div>

               {productFormData.adMaterials && productFormData.adMaterials.length > 0 && (
                 <div className="space-y-3 mt-4">
                   {productFormData.adMaterials.map((mat, i) => (
                      <div key={i} className="flex gap-2 items-center">
                         <div className="flex-1 bg-white rounded-xl border border-slate-200 p-1 pr-3 flex items-center gap-3">
                            {mat.type === 'image' ? <ImageIcon className="w-4 h-4 text-muted-foreground" /> : <FileText className="w-4 h-4 text-muted-foreground" />}
                            <Input 
                              value={mat.content} 
                              onChange={e => {
                                const newMats = [...productFormData.adMaterials!];
                                newMats[i].content = e.target.value;
                                setProductFormData({...productFormData, adMaterials: newMats});
                              }}
                              placeholder={mat.type === 'image' ? "رابط الصورة..." : "النص الإعلاني..."}
                              className="border-none shadow-none h-9 text-xs"
                            />
                         </div>
                         <Button type="button" variant="ghost" size="icon" className="text-destructive h-9 w-9" onClick={() => {
                            const newMats = productFormData.adMaterials!.filter((_, index) => index !== i);
                            setProductFormData({...productFormData, adMaterials: newMats});
                         }}>
                            <Trash2 className="w-4 h-4" />
                         </Button>
                      </div>
                   ))}
                 </div>
               )}
            </div>

            <DialogFooter className="pt-6 sm:justify-start gap-3">
              <Button type="submit" variant="hero" className="w-full sm:w-auto h-14 px-12 rounded-2xl shadow-xl shadow-primary/20 font-black">
                {editingProduct ? "تحديث المنتج" : "حفظ المنتج ونشره"}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setIsProductDialogOpen(false)} className="w-full sm:w-auto h-14 px-8 rounded-2xl font-bold">
                إلغاء
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
