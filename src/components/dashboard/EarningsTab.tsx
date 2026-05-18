import React from "react";
import { motion } from "framer-motion";
import { Wallet, Clock, TrendingUp, Filter } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface EarningsTabProps {
  dashboardStats: any;
  sellerEarningsData: any[];
  orderStatusPieData: any[];
  CustomTooltip: React.FC<any>;
}

const EarningsTab: React.FC<EarningsTabProps> = ({
  dashboardStats,
  sellerEarningsData,
  orderStatusPieData,
  CustomTooltip
}) => {
  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-3 gap-6">
        {[
          {
            label: "الأرباح المسلّمة",
            value: `${dashboardStats.totalRevenue.toLocaleString()} دج`,
            color: "text-foreground",
            sub: "أرباح من طلبيات تم تسليمها",
            icon: Wallet,
          },
          {
            label: "الأرباح المعلّقة",
            value: `${dashboardStats.pendingEarnings.toLocaleString()} دج`,
            color: "text-amber-600",
            sub: "في انتظار تأكيد التسليم",
            icon: Clock,
          },
          {
            label: "متوسط الطلبية",
            value: `${Math.round(dashboardStats.totalRevenue / (dashboardStats.totalOrders || 1)).toLocaleString()} دج`,
            color: "text-secondary",
            sub: "قيمة مبيعاتك لكل طلب",
            icon: TrendingUp,
          },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-card rounded-[2rem] p-8 border border-border/50 shadow-sm relative overflow-hidden group hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between relative z-10">
              <div className="space-y-1">
                <p className="text-sm font-bold text-muted-foreground">{stat.label}</p>
                <p className={`text-3xl font-black ${stat.color}`}>{stat.value}</p>
                <p className="text-[10px] text-muted-foreground font-medium">{stat.sub}</p>
              </div>
              <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <stat.icon className="w-7 h-7 text-muted-foreground" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Revenue Evolution Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 bg-card rounded-[2.5rem] p-8 border border-border/50 shadow-sm"
        >
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-xl font-black text-foreground">تطور الأرباح</h3>
              <p className="text-xs text-muted-foreground mt-1">رسم بياني يوضح نمو مبيعاتك خلال الفترة الأخيرة</p>
            </div>
            <div className="flex gap-2">
              <Select defaultValue="6m">
                <SelectTrigger className="w-32 h-10 rounded-xl text-xs font-bold bg-muted/30">
                  <SelectValue placeholder="الفترة" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="1m">آخر شهر</SelectItem>
                  <SelectItem value="3m">آخر 3 أشهر</SelectItem>
                  <SelectItem value="6m">آخر 6 أشهر</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sellerEarningsData}>
                <defs>
                  <linearGradient id="earningsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border)/0.5)" />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11, fontWeight: 700 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11, fontWeight: 700 }}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                />
                <RechartsTooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(var(--primary))"
                  strokeWidth={4}
                  fill="url(#earningsGradient)"
                  name="الأرباح"
                />
              </AreaChart>
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
              <span className="text-4xl font-black text-foreground">{dashboardStats.totalOrders}</span>
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
  );
};

export default EarningsTab;
