import React from "react";
import { motion } from "framer-motion";
import { Wallet, Clock, ShoppingCart, TrendingUp, Trophy, ChevronLeft } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface OverviewTabProps {
  dashboardStats: {
    totalRevenue: number;
    pendingEarnings: number;
    totalOrders: number;
    confirmedOrders: number;
    confirmationRate: number;
  };
  currentLevelInfo: {
    name: string;
    next?: string;
    target: number;
    color: string;
  };
  sellerEarningsData: any[];
  orders: any[];
  statusConfig: Record<string, any>;
  setActiveTab: (tab: any) => void;
  CustomTooltip: React.FC<any>;
}

const OverviewTab: React.FC<OverviewTabProps> = ({
  dashboardStats,
  currentLevelInfo,
  sellerEarningsData,
  orders,
  statusConfig,
  setActiveTab,
  CustomTooltip
}) => {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl p-4 md:p-6 shadow-sm border border-border/50"
        >
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-muted-foreground text-[10px] md:text-sm font-bold truncate">الأرباح المسلّمة</p>
              <p className="text-xl md:text-3xl font-black text-foreground mt-1 truncate">
                {dashboardStats.totalRevenue.toLocaleString()}
              </p>
              <p className="text-[10px] md:text-sm text-muted-foreground">دج</p>
            </div>
            <div className="w-10 h-10 md:w-14 md:h-14 bg-secondary/10 rounded-xl md:rounded-2xl flex items-center justify-center flex-shrink-0">
              <Wallet className="w-5 h-5 md:w-7 md:h-7 text-secondary" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl p-4 md:p-6 shadow-sm border border-border/50"
        >
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-muted-foreground text-[10px] md:text-sm font-bold truncate">الأرباح المعلّقة</p>
              <p className="text-xl md:text-3xl font-black text-foreground mt-1 truncate">
                {dashboardStats.pendingEarnings.toLocaleString()}
              </p>
              <p className="text-[10px] md:text-sm text-muted-foreground">دج</p>
            </div>
            <div className="w-10 h-10 md:w-14 md:h-14 bg-amber-500/10 rounded-xl md:rounded-2xl flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 md:w-7 md:h-7 text-amber-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-2xl p-4 md:p-6 shadow-sm border border-border/50"
        >
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-muted-foreground text-[10px] md:text-sm font-bold truncate">إجمالي الطلبيات</p>
              <p className="text-xl md:text-3xl font-black text-foreground mt-1 truncate">
                {dashboardStats.totalOrders}
              </p>
              <p className="text-[10px] md:text-sm text-secondary font-bold truncate">+{dashboardStats.confirmedOrders} مؤكد</p>
            </div>
            <div className="w-10 h-10 md:w-14 md:h-14 bg-primary/10 rounded-xl md:rounded-2xl flex items-center justify-center flex-shrink-0">
              <ShoppingCart className="w-5 h-5 md:w-7 md:h-7 text-primary" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-2xl p-4 md:p-6 shadow-sm border border-border/50"
        >
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-muted-foreground text-[10px] md:text-sm font-bold truncate">نسبة التأكيد</p>
              <p className="text-xl md:text-3xl font-black text-foreground mt-1 truncate">
                {dashboardStats.confirmationRate}%
              </p>
              <p className="text-[10px] md:text-sm text-secondary font-bold">ممتاز</p>
            </div>
            <div className="w-10 h-10 md:w-14 md:h-14 bg-secondary/10 rounded-xl md:rounded-2xl flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-5 h-5 md:w-7 md:h-7 text-secondary" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Level Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-r from-primary to-navy-800 rounded-3xl p-6 text-primary-foreground shadow-lg relative overflow-hidden group"
      >
        <div className="absolute top-0 left-0 w-full h-full bg-white/5 pointer-events-none" />
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
        <div className="flex items-center justify-between mb-4 relative z-10">
          <div>
            <p className="text-primary-foreground/70 text-xs md:text-sm font-bold">مستواك الحالي</p>
            <p className="text-xl md:text-2xl font-black">{currentLevelInfo.name}</p>
          </div>
          <div className="w-12 h-12 md:w-16 md:h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10">
            <Trophy className="w-8 h-8 md:w-10 md:h-10 text-amber-400 animate-pulse-glow" />
          </div>
        </div>

        {currentLevelInfo.next && (
          <>
            <div className="bg-white/10 rounded-full h-3 mb-3 relative z-10 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (dashboardStats.confirmedOrders / currentLevelInfo.target) * 100)}%` }}
                className="bg-gradient-to-r from-secondary to-amber-400 h-full rounded-full shadow-[0_0_15px_rgba(245,158,11,0.5)]"
              />
            </div>
            <div className="flex justify-between items-center relative z-10">
              <p className="text-[10px] md:text-xs text-primary-foreground/80 font-bold">
                باقي {Math.max(0, currentLevelInfo.target - dashboardStats.confirmedOrders)} طلبيات مؤكدة للترقية لـ {currentLevelInfo.next}
              </p>
              <p className="text-[10px] font-black font-mono text-primary-foreground/60">
                {dashboardStats.confirmedOrders} / {currentLevelInfo.target}
              </p>
            </div>
          </>
        )}
        {!currentLevelInfo.next && (
          <p className="text-sm text-amber-400 font-black mt-2 relative z-10">
            أنت الآن في أعلى مستوى متاح! تهانينا 🎉
          </p>
        )}
      </motion.div>

      {/* Revenue Evolution Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="bg-card rounded-[2.5rem] p-6 border border-border/50 shadow-sm overflow-hidden"
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-lg font-black text-foreground">تطور الإيرادات</h3>
            <p className="text-xs text-muted-foreground mt-1 font-bold">نظرة سريعة على مبيعاتك المحققة</p>
          </div>
          <Select defaultValue="6months">
            <SelectTrigger className="w-32 h-9 rounded-xl text-xs border-none bg-muted/50">
              <SelectValue placeholder="الفترة" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="3months">آخر 3 أشهر</SelectItem>
              <SelectItem value="6months">آخر 6 أشهر</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="h-[300px] w-full">
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
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10, fontWeight: 700 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10, fontWeight: 700 }}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              />
              <RechartsTooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="hsl(160, 84%, 39%)"
                strokeWidth={4}
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
        className="bg-card rounded-[2.5rem] shadow-sm border border-border/50 overflow-hidden"
      >
        <div className="p-6 border-b border-border/50 flex items-center justify-between bg-muted/20">
          <h2 className="text-lg font-black text-foreground">آخر الطلبيات</h2>
          <button
            onClick={() => setActiveTab("orders")}
            className="text-secondary text-xs font-black flex items-center gap-1 hover:gap-2 transition-all"
          >
            عرض الكل
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
        <div className="divide-y divide-border/50">
          {orders.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground bg-muted/5">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="w-8 h-8 opacity-20" />
              </div>
              <p className="font-bold">لا توجد طلبيات بعد</p>
            </div>
          ) : (
            orders.slice(0, 5).map((order) => {
              const status = statusConfig[order.status] || statusConfig.pending;
              return (
                <div key={order.id} className="p-5 hover:bg-muted/30 transition-colors flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${status.color}`}>
                      <status.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-black text-foreground text-sm line-clamp-1">{order.productName}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {order.selectedOffer && (
                          <span className="text-[9px] font-black bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-md">📦 {order.selectedOffer}</span>
                        )}
                        <span className="text-[10px] text-muted-foreground font-bold">{order.date}</span>
                        <span className="text-[10px] text-muted-foreground">•</span>
                        <span className="text-[10px] text-muted-foreground font-bold">{order.customerName}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-left flex flex-col items-end">
                    <p className="font-black text-foreground text-sm">{order.amount.toLocaleString()} دج</p>
                    <p className="text-[10px] text-secondary font-bold">ربحك: {order.commission.toLocaleString()} دج</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default OverviewTab;
