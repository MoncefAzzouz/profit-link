import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Package, ShoppingCart, Wallet, Trophy, 
  HelpCircle, LogOut, Menu, X, Copy, Check, TrendingUp,
  Clock, CheckCircle, XCircle, Truck, Eye, ChevronLeft,
  Calendar, Filter, Search, SlidersHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format, parseISO, isAfter, isBefore, isEqual } from "date-fns";
import { ar } from "date-fns/locale";
import { mockProducts, categories } from "@/data/mockProducts";
import { mockOrders, mockAffiliateStats, Order } from "@/data/mockAffiliateData";
import { useToast } from "@/hooks/use-toast";
import EarningsChart from "@/components/dashboard/EarningsChart";

type Tab = "overview" | "products" | "orders" | "earnings" | "levels" | "support";

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
    { id: "orders" as Tab, label: "طلبياتي", icon: ShoppingCart },
    { id: "earnings" as Tab, label: "الأرباح", icon: Wallet },
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
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-card rounded-2xl overflow-hidden shadow-sm hover-lift"
                  >
                    <div className="aspect-video relative">
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                      <div className="absolute top-3 left-3 bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm font-bold">
                        {product.commission.toLocaleString()} دج عمولة
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-foreground">{product.name}</h3>
                      <p className="text-xl font-bold text-secondary mt-2">{product.price.toLocaleString()} دج</p>
                      <div className="flex gap-2 mt-4">
                        <Button
                          onClick={() => copyAffiliateLink(product.id, product.name)}
                          className="flex-1 gap-2"
                          variant={copiedId === product.id ? "secondary" : "default"}
                        >
                          {copiedId === product.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          {copiedId === product.id ? "تم النسخ" : "نسخ الرابط"}
                        </Button>
                        <Link to={`/product/${product.id}/${user.id}`}>
                          <Button variant="outline" size="icon">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {filteredProducts.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-xl text-muted-foreground">لا توجد منتجات مطابقة للبحث</p>
                </div>
              )}
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

          {/* Earnings Tab with Charts */}
          {activeTab === "earnings" && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card rounded-2xl p-6 shadow-sm"
                >
                  <p className="text-muted-foreground">الأرباح الإجمالية</p>
                  <p className="text-4xl font-bold text-foreground mt-2">{mockAffiliateStats.totalEarnings.toLocaleString()} دج</p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-card rounded-2xl p-6 shadow-sm"
                >
                  <p className="text-muted-foreground">الأرباح المعلّقة</p>
                  <p className="text-4xl font-bold text-accent mt-2">{mockAffiliateStats.pendingEarnings.toLocaleString()} دج</p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-card rounded-2xl p-6 shadow-sm"
                >
                  <p className="text-muted-foreground">الأرباح المدفوعة</p>
                  <p className="text-4xl font-bold text-secondary mt-2">{mockAffiliateStats.paidEarnings.toLocaleString()} دج</p>
                </motion.div>
              </div>

              {/* Charts */}
              <EarningsChart />

              <div className="bg-card rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-foreground mb-4">معلومات الدفع</h3>
                <p className="text-muted-foreground">
                  يتم تحويل الأرباح كل نهاية أسبوع تلقائياً. الطلبيات المؤكدة والمسلّمة فقط تُحتسب.
                </p>
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
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
