import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  LayoutDashboard, Users, Package, ShoppingCart, Wallet,
  Settings, Menu, X, TrendingUp, CheckCircle, XCircle,
  Truck, Clock, Eye, Edit, Ban, Search, Filter, Plus,
  BarChart3, ChevronLeft, AlertTriangle, SlidersHorizontal
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
import { mockProducts, categories } from "@/data/mockProducts";
import { mockAffiliates, mockAdminStats, mockAllOrders } from "@/data/mockAdminData";
import { useToast } from "@/hooks/use-toast";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell
} from "recharts";

type Tab = "overview" | "affiliates" | "orders" | "products" | "analytics" | "settings";

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

  const sidebarItems = [
    { id: "overview" as Tab, label: "نظرة عامة", icon: LayoutDashboard },
    { id: "affiliates" as Tab, label: "المسوّقين", icon: Users },
    { id: "orders" as Tab, label: "الطلبيات", icon: ShoppingCart },
    { id: "products" as Tab, label: "المنتجات", icon: Package },
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

  const filteredOrders = useMemo(() => {
    return mockAllOrders.filter((order) => {
      const matchesSearch = order.productName.includes(orderSearch) || 
                           order.customerName.includes(orderSearch) ||
                           order.affiliateName.includes(orderSearch);
      const matchesStatus = orderStatus === "all" || order.status === orderStatus;
      return matchesSearch && matchesStatus;
    });
  }, [orderSearch, orderStatus]);

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

  const handleSuspendAffiliate = (id: string) => {
    toast({ title: "تم إيقاف المسوّق" });
  };

  const handleUpdateOrderStatus = (id: string, status: string) => {
    toast({ title: `تم تحديث حالة الطلبية إلى ${status}` });
  };

  return (
    <div className="dashboard-page-admin">
      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 right-0 z-50 w-72 shrink-0 bg-gradient-to-b from-slate-900 via-[hsl(222,47%,12%)] to-[hsl(222,47%,7%)] text-white border-l border-white/[0.07] shadow-[4px_0_40px_-12px_rgba(0,0,0,0.45)] transform transition-transform duration-300 ease-out ${
        sidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
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
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-200 ${
                  activeTab === item.id
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
                        <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} tickFormatter={(v) => `${(v/1000000).toFixed(1)}M`} />
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

          {/* Orders Tab */}
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
                    <Button className="h-12 gap-2 rounded-xl">
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
                    className="dash-card overflow-hidden"
                  >
                    <div className="aspect-video relative">
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                      <div className="absolute top-3 left-3 bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm font-bold">
                        {product.stock} في المخزون
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-foreground">{product.name}</h3>
                      <div className="flex justify-between items-center mt-2">
                        <p className="text-xl font-bold text-primary">{product.price.toLocaleString()} دج</p>
                        <p className="text-sm text-muted-foreground">عمولة: {product.commission.toLocaleString()} دج</p>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button variant="outline" className="flex-1 gap-2">
                          <Edit className="w-4 h-4" />
                          تعديل
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
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
                      <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} tickFormatter={(v) => `${(v/1000000).toFixed(1)}M`} />
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

              <div className="dash-card-interactive p-6">
                <div className="flex items-start gap-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
                  <AlertTriangle className="w-6 h-6 text-yellow-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-foreground">ملاحظة مهمة</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      هذه نسخة تجريبية. لربط قاعدة بيانات حقيقية ونظام مصادقة، قم بتفعيل Lovable Cloud.
                    </p>
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

export default Admin;
