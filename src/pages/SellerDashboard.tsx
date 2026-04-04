import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Package, ShoppingCart, Wallet, Users,
  Settings, LogOut, Menu, Plus, TrendingUp, Clock,
  CheckCircle, XCircle, Truck, ChevronLeft, Eye,
  BarChart3, AlertCircle, Pause, Play
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell,
} from "recharts";
import {
  mockSellerProducts, mockSellerOrders, mockSellerStats,
  sellerEarningsData, SellerProduct
} from "@/data/mockSellerData";

type Tab = "overview" | "products" | "orders" | "earnings" | "affiliates" | "settings";

const statusConfig = {
  pending: { label: "قيد الانتظار", icon: Clock, color: "text-yellow-600 bg-yellow-50 border-yellow-200" },
  confirmed: { label: "مؤكد", icon: CheckCircle, color: "text-blue-600 bg-blue-50 border-blue-200" },
  shipped: { label: "قيد التوصيل", icon: Truck, color: "text-purple-600 bg-purple-50 border-purple-200" },
  delivered: { label: "تم التسليم", icon: CheckCircle, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  cancelled: { label: "ملغي", icon: XCircle, color: "text-red-600 bg-red-50 border-red-200" },
};

const productStatusConfig = {
  active: { label: "نشط", color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  paused: { label: "متوقف", color: "text-yellow-700 bg-yellow-50 border-yellow-200" },
  out_of_stock: { label: "نفذ المخزون", color: "text-red-700 bg-red-50 border-red-200" },
};

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

const SellerDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

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

  const sidebarItems = [
    { id: "overview" as Tab, label: "نظرة عامة", icon: LayoutDashboard },
    { id: "products" as Tab, label: "المنتجات", icon: Package },
    { id: "orders" as Tab, label: "الطلبيات", icon: ShoppingCart },
    { id: "earnings" as Tab, label: "الإيرادات", icon: Wallet },
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
    <div className="min-h-screen bg-muted/30 flex" dir="rtl">
      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 right-0 z-50 w-72 bg-card border-l border-border transform transition-transform duration-300 ${
        sidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
      }`}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-border">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">L</span>
              </div>
              <div>
                <span className="text-xl font-bold text-foreground">LinkDZ</span>
                <span className="block text-xs text-muted-foreground">لوحة البائع</span>
              </div>
            </Link>
          </div>

          <div className="p-4 border-b border-border">
            <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl p-4 border border-border">
              <p className="font-semibold text-foreground">{user.storeName || user.name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <div className="mt-2 flex items-center gap-2">
                <span className="px-2.5 py-1 bg-primary/10 text-primary text-xs rounded-full font-semibold">
                  بائع معتمد ✓
                </span>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  activeTab === item.id
                    ? "bg-gradient-to-l from-primary to-primary/90 text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

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

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <main className="flex-1 min-h-screen">
        <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-xl border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-muted">
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold text-foreground">
              {sidebarItems.find(i => i.id === activeTab)?.label}
            </h1>
            <div />
          </div>
        </header>

        <div className="p-6">
          {/* ===== OVERVIEW ===== */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "إجمالي الإيرادات", value: `${mockSellerStats.totalRevenue.toLocaleString()} دج`, icon: Wallet, iconBg: "bg-secondary/10", iconColor: "text-secondary", sub: "↑ 18% عن الشهر الماضي" },
                  { label: "إجمالي الطلبيات", value: mockSellerStats.totalOrders, icon: ShoppingCart, iconBg: "bg-primary/10", iconColor: "text-primary", sub: `${mockSellerStats.pendingOrders} طلبية معلّقة` },
                  { label: "المسوّقون النشطون", value: mockSellerStats.activeAffiliates, icon: Users, iconBg: "bg-accent/10", iconColor: "text-accent", sub: "يروّجون لمنتجاتك" },
                  { label: "نسبة التأكيد", value: `${mockSellerStats.confirmationRate}%`, icon: TrendingUp, iconBg: "bg-secondary/10", iconColor: "text-secondary", sub: "أداء ممتاز" },
                ].map((stat, i) => (
                  <motion.div key={i} {...cardAnim(i * 0.08)} className="bg-card rounded-2xl p-6 shadow-sm border border-border/50 hover:shadow-md transition-shadow">
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

              {/* Revenue Chart */}
              <motion.div {...cardAnim(0.3)} className="bg-card rounded-2xl p-6 shadow-sm border border-border/50">
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

              {/* Recent Orders */}
              <motion.div {...cardAnim(0.4)} className="bg-card rounded-2xl shadow-sm border border-border/50">
                <div className="p-6 border-b border-border flex items-center justify-between">
                  <h2 className="text-lg font-bold text-foreground">آخر الطلبيات</h2>
                  <button onClick={() => setActiveTab("orders")} className="text-secondary text-sm font-medium flex items-center gap-1 hover:underline">
                    عرض الكل <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>
                <div className="divide-y divide-border">
                  {mockSellerOrders.slice(0, 4).map((order) => {
                    const status = statusConfig[order.status];
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
                  })}
                </div>
              </motion.div>
            </div>
          )}

          {/* ===== PRODUCTS ===== */}
          {activeTab === "products" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground">{mockSellerProducts.length} منتجات</p>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  إضافة منتج جديد
                </Button>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockSellerProducts.map((product, i) => {
                  const pStatus = productStatusConfig[product.status];
                  return (
                    <motion.div key={product.id} {...cardAnim(i * 0.08)} className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border/50 hover:shadow-md transition-all">
                      <div className="aspect-video relative">
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold border ${pStatus.color}`}>
                          {pStatus.label}
                        </div>
                      </div>
                      <div className="p-5">
                        <h3 className="font-bold text-foreground">{product.name}</h3>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-xl font-bold text-foreground">{product.price.toLocaleString()} دج</span>
                          <span className="text-sm text-secondary font-medium">عمولة: {product.commission.toLocaleString()} دج</span>
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
                          <Button variant="outline" size="sm" className="flex-1 gap-1">
                            <Eye className="w-4 h-4" /> عرض
                          </Button>
                          <Button variant="outline" size="sm" className="gap-1">
                            {product.status === "active" ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ===== ORDERS ===== */}
          {activeTab === "orders" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground">{mockSellerOrders.length} طلبيات</p>
              </div>
              <div className="bg-card rounded-2xl shadow-sm border border-border/50 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-right p-4 font-semibold text-foreground text-sm">المنتج</th>
                        <th className="text-right p-4 font-semibold text-foreground text-sm">المسوّق</th>
                        <th className="text-right p-4 font-semibold text-foreground text-sm">الزبون</th>
                        <th className="text-right p-4 font-semibold text-foreground text-sm">الولاية</th>
                        <th className="text-right p-4 font-semibold text-foreground text-sm">الحالة</th>
                        <th className="text-right p-4 font-semibold text-foreground text-sm">المبلغ</th>
                        <th className="text-right p-4 font-semibold text-foreground text-sm">التاريخ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {mockSellerOrders.map((order) => {
                        const status = statusConfig[order.status];
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
                          </tr>
                        );
                      })}
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
                  <motion.div key={i} {...cardAnim(i * 0.1)} className="bg-card rounded-2xl p-6 shadow-sm border border-border/50">
                    <p className="text-muted-foreground text-sm">{stat.label}</p>
                    <p className={`text-3xl font-bold mt-2 ${stat.color}`}>{stat.value}</p>
                  </motion.div>
                ))}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <motion.div {...cardAnim(0.3)} className="bg-card rounded-2xl p-6 shadow-sm border border-border/50">
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

                <motion.div {...cardAnim(0.4)} className="bg-card rounded-2xl p-6 shadow-sm border border-border/50">
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

          {/* ===== AFFILIATES ===== */}
          {activeTab === "affiliates" && (
            <div className="space-y-6">
              <motion.div {...cardAnim()} className="bg-gradient-to-l from-primary to-primary/90 rounded-2xl p-6 text-primary-foreground">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-primary-foreground/70">المسوّقون الذين يروّجون لمنتجاتك</p>
                    <p className="text-4xl font-bold mt-1">{mockSellerStats.activeAffiliates}</p>
                    <p className="text-primary-foreground/70 text-sm mt-1">مسوّق نشط</p>
                  </div>
                  <Users className="w-16 h-16 text-primary-foreground/20" />
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
                  <motion.div key={i} {...cardAnim(i * 0.06)} className="bg-card rounded-2xl p-5 shadow-sm border border-border/50 hover:shadow-md transition-all">
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
              <motion.div {...cardAnim()} className="bg-card rounded-2xl p-6 shadow-sm border border-border/50">
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

              <motion.div {...cardAnim(0.1)} className="bg-card rounded-2xl p-6 shadow-sm border border-border/50">
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
    </div>
  );
};

export default SellerDashboard;
