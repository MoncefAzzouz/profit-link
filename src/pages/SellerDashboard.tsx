import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Package, ShoppingCart, Wallet, Users,
  Settings, LogOut, Menu, Plus, TrendingUp, Clock,
  CheckCircle, XCircle, Truck, ChevronLeft, Eye,
  BarChart3, AlertCircle, Pause, Play, Edit3, Trash2,
  Image, DollarSign, Layers, Tag, Save, X, Search,
  MoreVertical, ArrowUpRight, Sparkles, Store, LayoutTemplate, MessageSquare
} from "lucide-react";
import LandingPageBuilder from "@/components/seller/LandingPageBuilder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell,
} from "recharts";
import {
  mockSellerProducts as initialProducts, mockSellerOrders, mockSellerStats,
  sellerEarningsData, SellerProduct
} from "@/data/mockSellerData";
import { createAndersonShipment } from "@/services/andersonShipping";

type Tab = "overview" | "products" | "orders" | "earnings" | "withdrawals" | "affiliates" | "landing-pages" | "settings";

const statusConfig = {
  pending: { label: "قيد الانتظار", icon: Clock, color: "text-yellow-600 bg-yellow-50 border-yellow-200" },
  confirmed: { label: "مؤكد", icon: CheckCircle, color: "text-blue-600 bg-blue-50 border-blue-200" },
  shipped: { label: "قيد التوصيل", icon: Truck, color: "text-purple-600 bg-purple-50 border-purple-200" },
  delivered: { label: "تم التسليم", icon: CheckCircle, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  cancelled: { label: "ملغي", icon: XCircle, color: "text-red-600 bg-red-50 border-red-200" },
};

const productStatusConfig = {
  active: { label: "نشط", color: "text-emerald-700 bg-emerald-50 border-emerald-200", dot: "bg-emerald-500" },
  paused: { label: "متوقف", color: "text-yellow-700 bg-yellow-50 border-yellow-200", dot: "bg-yellow-500" },
  out_of_stock: { label: "نفذ المخزون", color: "text-red-700 bg-red-50 border-red-200", dot: "bg-red-500" },
};

const orderStatusPieData = [
  { name: "مسلّمة", value: 812, color: "hsl(160, 84%, 39%)" },
  { name: "قيد التوصيل", value: 64, color: "hsl(262, 83%, 58%)" },
  { name: "معلّقة", value: 23, color: "hsl(45, 93%, 47%)" },
  { name: "ملغاة", value: 45, color: "hsl(0, 84%, 60%)" },
];

const categories = ["إلكترونيات", "أزياء", "جمال", "رياضة", "منزل", "أطفال", "صحة", "أخرى"];

const emptyProduct: Omit<SellerProduct, "id"> = {
  name: "", price: 0, commission: 0, image: "", category: "إلكترونيات",
  stock: 0, totalSales: 0, status: "active",
};

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

const SellerDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Product CRUD state
  const [products, setProducts] = useState<SellerProduct[]>(initialProducts);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<SellerProduct | null>(null);
  const [productToDelete, setProductToDelete] = useState<SellerProduct | null>(null);
  const [formData, setFormData] = useState<Omit<SellerProduct, "id">>(emptyProduct);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  // Orders State
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Stats State
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    pendingOrders: 0,
    confirmationRate: 0,
    activeAffiliates: 0
  });

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('https://profit-link-3eri.onrender.com/api/orders/all');
        const res = await response.json();
        if (response.ok) {
          const fetchedOrders = res.data.map((o: any) => ({
            id: o.id,
            productName: o.product?.name || "منتج محذوف",
            affiliateName: o.affiliate?.name || "مسوق غير معروف",
            customerName: o.customerName,
            wilaya: o.wilaya,
            status: o.status.toLowerCase(),
            amount: o.totalAmount,
            date: new Date(o.createdAt).toLocaleDateString('ar-DZ'),
            trackingNumber: o.trackingNumber
          }));
          setOrders(fetchedOrders);

          // Calculate stats
          const revenue = fetchedOrders.reduce((acc: number, curr: any) => acc + curr.amount, 0);
          const pending = fetchedOrders.filter((o: any) => o.status === 'pending').length;
          const confirmed = fetchedOrders.filter((o: any) => o.status === 'confirmed' || o.status === 'shipped' || o.status === 'delivered').length;
          const affiliates = new Set(fetchedOrders.map((o: any) => o.affiliateName)).size;

          setStats({
            totalRevenue: revenue,
            totalOrders: fetchedOrders.length,
            pendingOrders: pending,
            confirmationRate: fetchedOrders.length > 0 ? Math.round((confirmed / fetchedOrders.length) * 100) : 0,
            activeAffiliates: affiliates
          });
        }
      } catch (err) {
        console.error("Failed to fetch orders", err);
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchOrders();
  }, []);
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(null);

  // Withdrawal state
  const [withdrawalDialogOpen, setWithdrawalDialogOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawMethod, setWithdrawMethod] = useState("CCP");
  const [withdrawAccount, setWithdrawAccount] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("seller_user");
    if (!storedUser) {
      navigate("/seller-register");
    } else {
      setUser(JSON.parse(storedUser));
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("seller_user");
    toast({ title: "تم تسجيل الخروج" });
    navigate("/");
  };

  // Order Action Handlers
  const handleWhatsAppConfirm = (order: any) => {
    const defaultText = `مرحباً ${order.customerName}، نتواصل معك من متجرنا لتأكيد طلبك لمنتج ${order.productName} بسعر ${order.amount.toLocaleString()} دج. هل العنوان ${order.wilaya} صحيح؟`;
    const encodedText = encodeURIComponent(defaultText);
    window.open(`https://wa.me/213${order.customerPhone || "000000000"}?text=${encodedText}`, "_blank");
  };

  const handleEcotrackShip = async (order: any) => {
    setProcessingOrderId(order.id);
    try {
      const response = await fetch(`https://profit-link-3eri.onrender.com/api/orders/${order.id}/push-ecotrack`, {
        method: 'POST',
      });
      const res = await response.json();
      
      if (response.ok) {
        toast({ 
          title: "تم إرسال الطلب لـ Ecotrack", 
          description: `رقم التتبع: ${res.tracking}` 
        });
        setOrders(orders.map(o => o.id === order.id ? { ...o, status: "shipped", trackingNumber: res.tracking } : o));
      } else {
        throw new Error(res.error || "Failed to push to Ecotrack");
      }
    } catch (err: any) {
      toast({ title: "خطأ في الإرسال", description: err.message, variant: "destructive" });
    } finally {
      setProcessingOrderId(null);
    }
  };

  const handleViewTracking = async (order: any) => {
    try {
      const response = await fetch(`https://profit-link-3eri.onrender.com/api/orders/${order.id}/tracking`);
      const res = await response.json();
      if (response.ok) {
        // Here you would typically open a dialog or show the info
        toast({ title: "حالة التتبع", description: `الحالة الحالية: ${res.data.status || "قيد المعالجة"}` });
      }
    } catch (err) {
      toast({ title: "خطأ", description: "فشل في جلب معلومات التتبع", variant: "destructive" });
    }
  };

  // Product CRUD handlers
  const openAddDialog = () => {
    setEditingProduct(null);
    setFormData(emptyProduct);
    setDialogOpen(true);
  };

  const openEditDialog = (product: SellerProduct) => {
    setEditingProduct(product);
    setFormData({
      name: product.name, price: product.price, commission: product.commission,
      image: product.image, category: product.category, stock: product.stock,
      totalSales: product.totalSales, status: product.status,
    });
    setDialogOpen(true);
  };

  const openDeleteDialog = (product: SellerProduct) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const handleSaveProduct = () => {
    if (!formData.name || !formData.price) {
      toast({ title: "خطأ", description: "يرجى ملء جميع الحقول المطلوبة", variant: "destructive" });
      return;
    }

    if (editingProduct) {
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...p, ...formData } : p));
      toast({ title: "✅ تم التحديث", description: `تم تحديث "${formData.name}" بنجاح` });
    } else {
      const newProduct: SellerProduct = {
        id: `sp-${Date.now()}`,
        ...formData,
      };
      setProducts(prev => [newProduct, ...prev]);
      toast({ title: "🎉 تمت الإضافة", description: `تم إضافة "${formData.name}" بنجاح` });
    }
    setDialogOpen(false);
  };

  const handleDeleteProduct = () => {
    if (productToDelete) {
      setProducts(prev => prev.filter(p => p.id !== productToDelete.id));
      toast({ title: "🗑️ تم الحذف", description: `تم حذف "${productToDelete.name}"` });
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  const toggleProductStatus = (product: SellerProduct) => {
    const newStatus = product.status === "active" ? "paused" : "active";
    setProducts(prev => prev.map(p => p.id === product.id ? { ...p, status: newStatus } : p));
    toast({ title: newStatus === "active" ? "▶️ تم التفعيل" : "⏸️ تم الإيقاف" });
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.includes(searchQuery) || p.category.includes(searchQuery);
    const matchesStatus = filterStatus === "all" || p.status === filterStatus;
    const matchesCategory = filterCategory === "all" || p.category === filterCategory;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const sidebarItems = [
    { id: "overview" as Tab, label: "نظرة عامة", icon: LayoutDashboard },
    { id: "products" as Tab, label: "المنتجات", icon: Package },
    { id: "landing-pages" as Tab, label: "صفحات الهبوط", icon: LayoutTemplate },
    { id: "orders" as Tab, label: "الطلبيات", icon: ShoppingCart },
    { id: "earnings" as Tab, label: "الإيرادات", icon: Wallet },
    { id: "withdrawals" as Tab, label: "طلبات السحب", icon: CheckCircle },
    { id: "affiliates" as Tab, label: "المسوّقون", icon: Users },
    { id: "settings" as Tab, label: "الإعدادات", icon: Settings },
  ];

  if (!user) return null;

  const cardAnim = (delay = 0) => ({
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  });

  return (
    <div className="dashboard-page-seller" dir="rtl">
      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 right-0 z-50 w-72 shrink-0 bg-gradient-to-b from-emerald-950 via-[hsl(160,35%,12%)] to-slate-950 text-white border-l border-emerald-500/15 shadow-[4px_0_40px_-12px_rgba(0,0,0,0.4)] transform transition-transform duration-300 ease-out ${
        sidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
      }`}>
        <div className="flex flex-col h-full">
          <div className="p-4 pt-5">
            <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-4 backdrop-blur-md">
              <Link to="/" className="flex items-center gap-3">
                <div className="w-11 h-11 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-600/35 ring-2 ring-white/15">
                  <span className="text-white font-bold text-lg">L</span>
                </div>
                <div>
                  <span className="text-lg font-bold tracking-tight">LinkDZ</span>
                  <span className="block text-xs text-emerald-200/90 font-medium">لوحة البائع</span>
                </div>
              </Link>
            </div>
          </div>

          <div className="px-4 pb-4">
            <div className="rounded-2xl border border-emerald-400/20 bg-gradient-to-br from-emerald-500/10 to-teal-900/20 p-4 backdrop-blur-sm">
              <p className="font-semibold text-white truncate">{user.storeName || user.name}</p>
              <p className="text-sm text-emerald-100/75 truncate">{user.email}</p>
              <div className="mt-3 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-500/25 text-emerald-100 text-xs rounded-full font-semibold ring-1 ring-emerald-400/30">
                  <Sparkles className="w-3 h-3" />
                  بائع معتمد
                </span>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-200 ${
                  activeTab === item.id
                    ? "bg-emerald-500/25 text-white shadow-lg shadow-black/20 ring-1 ring-emerald-400/40"
                    : "text-emerald-100/70 hover:bg-white/[0.07] hover:text-white"
                }`}
              >
                <item.icon className="w-5 h-5 shrink-0 opacity-95" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-200 hover:bg-rose-500/15 hover:text-white border border-transparent hover:border-rose-400/25 transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-[2px] z-40 lg:hidden" onClick={() => setSidebarOpen(false)} aria-hidden />
      )}

      {/* Main */}
      <main className="flex-1 min-h-screen flex flex-col min-w-0">
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
            <h1 className="text-lg md:text-xl font-bold text-foreground tracking-tight truncate flex-1 text-center lg:text-right">
              {sidebarItems.find(i => i.id === activeTab)?.label}
            </h1>
            <div className="flex items-center gap-2 shrink-0">
              <span className="hidden sm:inline-flex text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                متجر
              </span>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center ring-2 ring-emerald-400/30 shadow-md">
                <Store className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 p-4 md:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
          {/* ===== OVERVIEW ===== */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "إجمالي الإيرادات", value: `${stats.totalRevenue.toLocaleString()} دج`, icon: Wallet, iconBg: "bg-secondary/10", iconColor: "text-secondary", sub: "مبيعات حقيقية" },
                  { label: "إجمالي الطلبيات", value: stats.totalOrders, icon: ShoppingCart, iconBg: "bg-primary/10", iconColor: "text-primary", sub: `${stats.pendingOrders} طلبية معلّقة` },
                  { label: "المسوّقون النشطون", value: stats.activeAffiliates, icon: Users, iconBg: "bg-accent/10", iconColor: "text-accent", sub: "يروّجون لمنتجاتك" },
                  { label: "نسبة التأكيد", value: `${stats.confirmationRate}%`, icon: TrendingUp, iconBg: "bg-secondary/10", iconColor: "text-secondary", sub: "أداء المبيعات" },
                ].map((stat, i) => (
                  <motion.div key={i} {...cardAnim(i * 0.08)} className="dash-card-interactive p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-muted-foreground text-sm">{stat.label}</p>
                        <p className="text-3xl font-bold text-foreground mt-1">{stat.value}</p>
                        <p className="text-xs text-secondary mt-1">{stat.sub}</p>
                      </div>
                      <div className={`w-14 h-14 ${stat.iconBg} rounded-2xl flex items-center justify-center`}>
                        <stat.icon className={`w-7 h-7 ${stat.iconColor}`} />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.div {...cardAnim(0.3)} className="dash-card-interactive p-6">
                <h3 className="text-lg font-bold text-foreground mb-6">تطور الإيرادات</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={sellerEarningsData}>
                      <defs>
                        <linearGradient id="sellerRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                      <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="revenue" stroke="hsl(160, 84%, 39%)" strokeWidth={3} fill="url(#sellerRevenueGradient)" name="revenue" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              <motion.div {...cardAnim(0.4)} className="dash-card">
                <div className="p-6 border-b border-border flex items-center justify-between">
                  <h2 className="text-lg font-bold text-foreground">آخر الطلبيات</h2>
                  <button onClick={() => setActiveTab("orders")} className="text-secondary text-sm font-medium flex items-center gap-1 hover:underline">
                    عرض الكل <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>
                <div className="divide-y divide-border">
                  {loadingOrders ? (
                    <div className="p-12 flex flex-col items-center justify-center gap-4 text-muted-foreground">
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full" />
                      <p className="text-sm font-medium">جاري تحميل الطلبيات...</p>
                    </div>
                  ) : orders.length > 0 ? (
                    orders.slice(0, 5).map((order) => {
                      const status = statusConfig[order.status as keyof typeof statusConfig];
                      if (!status) return null;
                      return (
                        <div key={order.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${status.color}`}>
                              <status.icon className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{order.productName}</p>
                              <p className="text-sm text-muted-foreground">{order.customerName} - {order.wilaya}</p>
                            </div>
                          </div>
                          <div className="text-left">
                            <p className="font-bold text-foreground">{order.amount.toLocaleString()} دج</p>
                            <p className="text-xs text-muted-foreground">{order.date}</p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-12 text-center text-muted-foreground">
                      <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShoppingCart className="w-8 h-8 opacity-20" />
                      </div>
                      <p className="font-medium">بانتظار وصول أول طلبية...</p>
                      <p className="text-sm opacity-60">ستظهر هنا بمجرد قيام الزبون بعملية الشراء</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          )}

          {/* ===== PRODUCTS (with CRUD) ===== */}
          {activeTab === "products" && (
            <div className="space-y-6">
              {/* Header with stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "إجمالي المنتجات", value: products.length, icon: Package, gradient: "from-primary/10 to-primary/5" },
                  { label: "منتجات نشطة", value: products.filter(p => p.status === "active").length, icon: CheckCircle, gradient: "from-emerald-500/10 to-emerald-500/5" },
                  { label: "متوقفة", value: products.filter(p => p.status === "paused").length, icon: Pause, gradient: "from-yellow-500/10 to-yellow-500/5" },
                  { label: "نفذ المخزون", value: products.filter(p => p.status === "out_of_stock").length, icon: AlertCircle, gradient: "from-red-500/10 to-red-500/5" },
                ].map((stat, i) => (
                  <motion.div key={i} {...cardAnim(i * 0.06)} className={`bg-gradient-to-br ${stat.gradient} rounded-2xl p-4 border border-border/30`}>
                    <stat.icon className="w-5 h-5 text-muted-foreground mb-2" />
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </motion.div>
                ))}
              </div>

              {/* Toolbar */}
              <motion.div {...cardAnim(0.2)} className="dash-card p-4">
                <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                  <div className="flex flex-1 gap-3 w-full sm:w-auto">
                    <div className="relative flex-1">
                      <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="ابحث عن منتج..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pr-10 rounded-xl border-border/50 bg-muted/30 focus:bg-background"
                      />
                    </div>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-[140px] rounded-xl border-border/50">
                        <SelectValue placeholder="الحالة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">الكل</SelectItem>
                        <SelectItem value="active">نشط</SelectItem>
                        <SelectItem value="paused">متوقف</SelectItem>
                        <SelectItem value="out_of_stock">نفذ المخزون</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={filterCategory} onValueChange={setFilterCategory}>
                      <SelectTrigger className="w-[140px] rounded-xl border-border/50">
                        <SelectValue placeholder="التصنيف" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">كل التصنيفات</SelectItem>
                        {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={openAddDialog} className="gap-2 rounded-xl bg-gradient-to-l from-primary to-primary/90 shadow-md hover:shadow-lg transition-all w-full sm:w-auto">
                    <Sparkles className="w-4 h-4" />
                    إضافة منتج جديد
                  </Button>
                </div>
              </motion.div>

              {/* Product Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                  {filteredProducts.map((product, i) => {
                    const pStatus = productStatusConfig[product.status];
                    return (
                      <motion.div
                        key={product.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ delay: i * 0.05, duration: 0.4 }}
                        className="dash-card-interactive overflow-hidden hover:border-emerald-500/25 transition-all duration-300 group"
                      >
                        <div className="aspect-video relative overflow-hidden">
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className={`absolute top-3 right-3 px-3 py-1.5 rounded-full text-xs font-bold border backdrop-blur-sm ${pStatus.color}`}>
                            <span className={`inline-block w-1.5 h-1.5 rounded-full ${pStatus.dot} mr-1.5`} />
                            {pStatus.label}
                          </div>
                          {/* Quick actions overlay */}
                          <div className="absolute bottom-3 left-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                            <Button size="sm" variant="secondary" onClick={() => openEditDialog(product)} className="flex-1 rounded-lg backdrop-blur-sm bg-background/80 hover:bg-background gap-1.5 text-xs shadow-lg">
                              <Edit3 className="w-3.5 h-3.5" /> تعديل
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => openDeleteDialog(product)} className="rounded-lg backdrop-blur-sm bg-destructive/80 hover:bg-destructive gap-1.5 text-xs shadow-lg">
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                        <div className="p-5">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-bold text-foreground text-sm leading-tight">{product.name}</h3>
                            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full whitespace-nowrap">{product.category}</span>
                          </div>
                          <div className="flex items-center justify-between mt-3">
                            <span className="text-xl font-bold text-foreground">{product.price.toLocaleString()} دج</span>
                            <div className="flex items-center gap-1 text-sm text-secondary font-medium bg-secondary/10 px-2 py-0.5 rounded-full">
                              <ArrowUpRight className="w-3.5 h-3.5" />
                              {product.commission.toLocaleString()} دج
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                            <div className="text-sm text-muted-foreground">
                              <span className="font-semibold text-foreground">{product.totalSales}</span> مبيعة
                            </div>
                            <div className="text-sm text-muted-foreground">
                              مخزون: <span className={`font-semibold ${product.stock === 0 ? "text-destructive" : "text-foreground"}`}>{product.stock}</span>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-4">
                            <Button variant="outline" size="sm" onClick={() => openEditDialog(product)} className="flex-1 gap-1.5 rounded-xl hover:bg-primary/5 hover:border-primary/30 hover:text-primary transition-all">
                              <Edit3 className="w-3.5 h-3.5" /> تعديل
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => toggleProductStatus(product)} className="gap-1 rounded-xl">
                              {product.status === "active" ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => openDeleteDialog(product)} className="gap-1 rounded-xl text-destructive hover:bg-destructive/10 hover:border-destructive/30">
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              {filteredProducts.length === 0 && (
                <motion.div {...cardAnim()} className="text-center py-16">
                  <Package className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-lg font-semibold text-muted-foreground">لا توجد منتجات</p>
                  <p className="text-sm text-muted-foreground/70 mt-1">أضف منتجك الأول لبدء البيع</p>
                  <Button onClick={openAddDialog} className="mt-4 gap-2 rounded-xl">
                    <Plus className="w-4 h-4" /> إضافة منتج
                  </Button>
                </motion.div>
              )}
            </div>
          )}

          {/* ===== LANDING PAGES ===== */}
          {activeTab === "landing-pages" && <LandingPageBuilder />}

          {/* ===== ORDERS ===== */}
          {activeTab === "orders" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground">{orders.length} طلبيات حقيقية</p>
              </div>
              <div className="dash-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-100/95 dark:bg-slate-800/60 border-b border-border/50">
                      <tr>
                        <th className="text-right p-4 font-semibold text-foreground text-sm">المنتج</th>
                        <th className="text-right p-4 font-semibold text-foreground text-sm">المسوّق</th>
                        <th className="text-right p-4 font-semibold text-foreground text-sm">الزبون</th>
                        <th className="text-right p-4 font-semibold text-foreground text-sm">الولاية</th>
                        <th className="text-right p-4 font-semibold text-foreground text-sm">الحالة</th>
                        <th className="text-right p-4 font-semibold text-foreground text-sm">المبلغ</th>
                        <th className="text-right p-4 font-semibold text-foreground text-sm">التاريخ</th>
                        <th className="text-right p-4 font-semibold text-foreground text-sm">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {loadingOrders ? (
                        <tr>
                          <td colSpan={8} className="p-12 text-center">
                            <div className="flex flex-col items-center gap-3 text-muted-foreground">
                              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full" />
                              <p>جاري تحميل البيانات...</p>
                            </div>
                          </td>
                        </tr>
                      ) : orders.length > 0 ? (
                        orders.map((order) => {
                          const status = statusConfig[order.status as keyof typeof statusConfig];
                          const isProcessing = processingOrderId === order.id;
                          return (
                            <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                              <td className="p-4 font-medium text-foreground text-sm">{order.productName}</td>
                              <td className="p-4 text-muted-foreground text-sm">{order.affiliateName}</td>
                              <td className="p-4 text-muted-foreground text-sm">{order.customerName}</td>
                              <td className="p-4 text-muted-foreground text-sm">{order.wilaya}</td>
                              <td className="p-4">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${status.color}`}>
                                  <status.icon className="w-3.5 h-3.5" />
                                  {status.label}
                                </span>
                              </td>
                              <td className="p-4 font-bold text-foreground text-sm">{order.amount.toLocaleString()} دج</td>
                              <td className="p-4 text-muted-foreground text-sm">{order.date}</td>
                              <td className="p-4">
                                  <div className="flex items-center gap-2">
                                    <Button size="sm" variant="outline" className="gap-2 text-green-600 border-green-200 hover:bg-green-50" onClick={() => handleWhatsAppConfirm(order)}>
                                      <MessageSquare className="w-4 h-4" /> واتساب
                                    </Button>
                                    {(order.status === "pending" || order.status === "confirmed") && (
                                      <>
                                        <Button size="sm" className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white" disabled={isProcessing} onClick={() => handleEcotrackShip(order)}>
                                          {isProcessing ? <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" /> : <Truck className="w-4 h-4" />}
                                          Ecotrack
                                        </Button>
                                      </>
                                    )}
                                    {order.trackingNumber && (
                                      <Button size="sm" variant="ghost" className="gap-2 text-blue-600" onClick={() => handleViewTracking(order)}>
                                        <Eye className="w-4 h-4" /> تتبع
                                      </Button>
                                    )}
                                  </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={8} className="p-12 text-center text-muted-foreground italic">
                            لا توجد طلبيات مسجلة بعد.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ===== EARNINGS ===== */}
          {activeTab === "earnings" && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { label: "الإيرادات الإجمالية", value: `${mockSellerStats.totalRevenue.toLocaleString()} دج`, color: "text-foreground" },
                  { label: "العمولات المدفوعة للمسوّقين", value: `${(mockSellerStats.totalRevenue * 0.45).toLocaleString()} دج`, color: "text-accent" },
                  { label: "صافي الربح", value: `${(mockSellerStats.totalRevenue * 0.55).toLocaleString()} دج`, color: "text-secondary" },
                ].map((stat, i) => (
                  <motion.div key={i} {...cardAnim(i * 0.1)} className="dash-card-interactive p-6">
                    <p className="text-muted-foreground text-sm">{stat.label}</p>
                    <p className={`text-3xl font-bold mt-2 ${stat.color}`}>{stat.value}</p>
                  </motion.div>
                ))}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <motion.div {...cardAnim(0.3)} className="dash-card-interactive p-6">
                  <h3 className="text-lg font-bold text-foreground mb-6">الإيرادات الشهرية</h3>
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={sellerEarningsData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                        <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="revenue" fill="hsl(160, 84%, 39%)" radius={[8, 8, 0, 0]} name="revenue" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>

                <motion.div {...cardAnim(0.4)} className="dash-card-interactive p-6">
                  <h3 className="text-lg font-bold text-foreground mb-6">توزيع الطلبيات</h3>
                  <div className="h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={orderStatusPieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={4} dataKey="value">
                          {orderStatusPieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: any) => [`${value} طلبية`, ""]} contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap justify-center gap-3 mt-2">
                    {orderStatusPieData.map((item) => (
                      <div key={item.name} className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-xs text-muted-foreground">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          )}

          {/* Withdrawals Tab */}
          {activeTab === "withdrawals" && (
            <div className="space-y-6">
              {/* Withdrawal History */}
              <motion.div {...cardAnim(0.1)} className="dash-card">
                <div className="p-6 border-b border-border flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-foreground">طلبات السحب</h2>
                    <p className="text-sm text-muted-foreground mt-1">سجل عمليات سحب الأرباح الخاصة بك</p>
                  </div>
                  <Button onClick={() => setWithdrawalDialogOpen(true)} className="gap-2 rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-lg shadow-secondary/20">
                    <Wallet className="w-4 h-4" />
                    طلب سحب جديد
                  </Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50 border-b border-border/50">
                      <tr>
                        <th className="text-right p-4 font-semibold text-foreground text-sm">المبلغ</th>
                        <th className="text-right p-4 font-semibold text-foreground text-sm">طريقة الدفع</th>
                        <th className="text-right p-4 font-semibold text-foreground text-sm">الحالة</th>
                        <th className="text-right p-4 font-semibold text-foreground text-sm">التاريخ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      <tr className="hover:bg-muted/30 transition-colors">
                        <td className="p-4 font-bold text-foreground text-sm">85,000 دج</td>
                        <td className="p-4">
                          <p className="text-xs font-bold text-foreground">Baridimob</p>
                          <p className="text-[10px] text-muted-foreground font-mono">00799999000123456789</p>
                        </td>
                        <td className="p-4">
                          <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">تم الدفع</span>
                        </td>
                        <td className="p-4 text-xs text-muted-foreground">2024-01-18</td>
                      </tr>
                      <tr className="hover:bg-muted/30 transition-colors">
                        <td className="p-4 font-bold text-foreground text-sm">120,000 دج</td>
                        <td className="p-4">
                          <p className="text-xs font-bold text-foreground">CCP</p>
                          <p className="text-[10px] text-muted-foreground font-mono">0087654321 / 11</p>
                        </td>
                        <td className="p-4">
                          <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700">مرفوض</span>
                        </td>
                        <td className="p-4 text-xs text-muted-foreground">2024-01-15</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </motion.div>
            </div>
          )}

          {/* ===== AFFILIATES ===== */}
          {activeTab === "affiliates" && (
            <div className="space-y-6">
              <motion.div
                {...cardAnim()}
                className="relative overflow-hidden rounded-2xl border border-emerald-400/25 bg-gradient-to-l from-emerald-600 via-teal-700 to-emerald-900 p-6 text-white shadow-lg shadow-emerald-900/20 ring-1 ring-white/10"
              >
                <div className="pointer-events-none absolute -left-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
                <div className="relative flex items-center justify-between gap-4">
                  <div>
                    <p className="text-emerald-100/90 text-sm font-medium">المسوّقون الذين يروّجون لمنتجاتك</p>
                    <p className="text-4xl font-bold mt-1 tabular-nums">{mockSellerStats.activeAffiliates}</p>
                    <p className="text-emerald-100/80 text-sm mt-1">مسوّق نشط</p>
                  </div>
                  <Users className="w-16 h-16 text-white/25 shrink-0" />
                </div>
              </motion.div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: "أحمد بن سالم", orders: 156, earnings: "245,000 دج", level: 3 },
                  { name: "فاطمة الزهراء", orders: 89, earnings: "125,000 دج", level: 2 },
                  { name: "كريم محمودي", orders: 23, earnings: "32,000 دج", level: 1 },
                  { name: "سارة بوعلي", orders: 67, earnings: "78,000 دج", level: 2 },
                  { name: "يوسف العمري", orders: 12, earnings: "18,500 دج", level: 1 },
                  { name: "نورة حدّاد", orders: 45, earnings: "56,000 دج", level: 2 },
                ].map((aff, i) => (
                  <motion.div key={i} {...cardAnim(i * 0.06)} className="dash-card-interactive p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-secondary/20 to-secondary/5 flex items-center justify-center">
                        <span className="text-secondary font-bold">{aff.name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{aff.name}</p>
                        <p className="text-xs text-muted-foreground">المستوى {aff.level}</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-border">
                      <div className="text-sm text-muted-foreground">
                        <span className="font-semibold text-foreground">{aff.orders}</span> طلبية
                      </div>
                      <div className="text-sm font-semibold text-secondary">{aff.earnings}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* ===== SETTINGS ===== */}
          {activeTab === "settings" && (
            <div className="max-w-2xl space-y-6">
              <motion.div {...cardAnim()} className="dash-card-interactive p-6">
                <h3 className="text-lg font-bold text-foreground mb-4">معلومات المتجر</h3>
                <div className="space-y-3">
                  {[
                    { label: "اسم المتجر", value: user.storeName || "—" },
                    { label: "البريد الإلكتروني", value: user.email },
                    { label: "الهاتف", value: user.phone || "—" },
                    { label: "الولاية", value: user.wilaya || "—" },
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between items-center py-3 border-b border-border last:border-0">
                      <span className="text-muted-foreground text-sm">{item.label}</span>
                      <span className="text-foreground font-medium text-sm">{item.value}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div {...cardAnim(0.1)} className="dash-card-interactive p-6">
                <h3 className="text-lg font-bold text-foreground mb-4">الدعم الفني</h3>
                <div className="space-y-3">
                  <a href="https://wa.me/213555123456" target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 bg-secondary/5 rounded-xl hover:bg-secondary/10 transition-colors border border-secondary/10">
                    <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center">
                      <span className="text-xl">💬</span>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">واتساب</p>
                      <p className="text-sm text-muted-foreground">رد سريع خلال ساعة</p>
                    </div>
                  </a>
                  <a href="mailto:sellers@linkdz.com"
                    className="flex items-center gap-4 p-4 bg-primary/5 rounded-xl hover:bg-primary/10 transition-colors border border-primary/10">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                      <span className="text-xl">📧</span>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">البريد الإلكتروني</p>
                      <p className="text-sm text-muted-foreground">sellers@linkdz.com</p>
                    </div>
                  </a>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </main>

      {/* ===== ADD/EDIT PRODUCT DIALOG ===== */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              {editingProduct ? (
                <><Edit3 className="w-5 h-5 text-primary" /> تعديل المنتج</>
              ) : (
                <><Sparkles className="w-5 h-5 text-primary" /> إضافة منتج جديد</>
              )}
            </DialogTitle>
            <DialogDescription>
              {editingProduct ? "قم بتحديث بيانات المنتج" : "أدخل بيانات المنتج الجديد"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">اسم المنتج *</Label>
              <Input
                placeholder="مثال: ساعة ذكية متعددة الوظائف"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">السعر (دج) *</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.price || ""}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">عمولة المسوّق (دج)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.commission || ""}
                  onChange={(e) => setFormData({ ...formData, commission: Number(e.target.value) })}
                  className="rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">التصنيف</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">المخزون</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.stock || ""}
                  onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                  className="rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">رابط الصورة</Label>
              <Input
                placeholder="https://example.com/image.jpg"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className="rounded-xl"
                dir="ltr"
              />
              {formData.image && (
                <div className="mt-2 rounded-xl overflow-hidden border border-border h-32">
                  <img src={formData.image} alt="معاينة" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = "none")} />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">الحالة</Label>
              <Select value={formData.status} onValueChange={(v: any) => setFormData({ ...formData, status: v })}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">نشط</SelectItem>
                  <SelectItem value="paused">متوقف</SelectItem>
                  <SelectItem value="out_of_stock">نفذ المخزون</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-xl">
              إلغاء
            </Button>
            <Button onClick={handleSaveProduct} className="rounded-xl gap-2 bg-gradient-to-l from-primary to-primary/90">
              <Save className="w-4 h-4" />
              {editingProduct ? "حفظ التغييرات" : "إضافة المنتج"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===== DELETE CONFIRMATION DIALOG ===== */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-sm rounded-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2 text-destructive">
              <Trash2 className="w-5 h-5" /> حذف المنتج
            </DialogTitle>
            <DialogDescription>
              هل أنت متأكد من حذف "{productToDelete?.name}"؟ لا يمكن التراجع عن هذا الإجراء.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} className="rounded-xl">
              إلغاء
            </Button>
            <Button variant="destructive" onClick={handleDeleteProduct} className="rounded-xl gap-2">
              <Trash2 className="w-4 h-4" /> نعم، احذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
              <p className="text-[11px] text-muted-foreground">الرصيد القابل للسحب: {(mockSellerStats.totalRevenue * 0.55).toLocaleString()} دج</p>
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
              <Label className="text-sm font-semibold">تفاصيل الحساب ({withdrawMethod})</Label>
              <Input
                placeholder={withdrawMethod === "CCP" ? "رقم الحساب / المفتاح" : "رقم الـ RIP"}
                value={withdrawAccount}
                onChange={(e) => setWithdrawAccount(e.target.value)}
                className="rounded-xl font-mono"
              />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button 
              className="w-full h-12 rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/90 text-lg font-bold"
              onClick={() => {
                toast({ title: "✅ تم إرسال الطلب", description: "سيتم مراجعة طلبك وتحويل المبلغ خلال 24-48 ساعة" });
                setWithdrawalDialogOpen(false);
                setWithdrawAmount("");
                setWithdrawAccount("");
              }}
            >
              تأكيد الطلب
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SellerDashboard;
