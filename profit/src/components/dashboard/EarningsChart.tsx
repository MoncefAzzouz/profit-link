import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const earningsData = [
  { month: "يناير", earnings: 12500, orders: 15 },
  { month: "فبراير", earnings: 18200, orders: 22 },
  { month: "مارس", earnings: 15800, orders: 19 },
  { month: "أبريل", earnings: 22400, orders: 28 },
  { month: "مايو", earnings: 28600, orders: 35 },
  { month: "يونيو", earnings: 45750, orders: 42 },
];

const orderStatusData = [
  { name: "مسلّمة", value: 142, color: "hsl(142, 76%, 36%)" },
  { name: "قيد التوصيل", value: 8, color: "hsl(262, 83%, 58%)" },
  { name: "ملغاة", value: 14, color: "hsl(0, 84%, 60%)" },
];

const topProductsData = [
  { name: "ساعة ذكية", orders: 45 },
  { name: "سماعات بلوتوث", orders: 38 },
  { name: "حقيبة ظهر", orders: 28 },
  { name: "كريم البشرة", orders: 22 },
  { name: "مكنسة ذكية", orders: 15 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
        <p className="font-semibold text-foreground">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name === "earnings" ? "الأرباح" : "الطلبيات"}: {entry.value.toLocaleString()}
            {entry.name === "earnings" && " دج"}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const EarningsChart = () => {
  return (
    <div className="space-y-6">
      {/* Earnings Over Time */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-2xl p-6 shadow-sm"
      >
        <h3 className="text-lg font-bold text-foreground mb-6">تطور الأرباح</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={earningsData}>
              <defs>
                <linearGradient id="earningsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="month"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                axisLine={{ stroke: "hsl(var(--border))" }}
              />
              <YAxis
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                axisLine={{ stroke: "hsl(var(--border))" }}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="earnings"
                stroke="hsl(142, 76%, 36%)"
                strokeWidth={3}
                fill="url(#earningsGradient)"
                name="earnings"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Order Status Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl p-6 shadow-sm"
        >
          <h3 className="text-lg font-bold text-foreground mb-6">توزيع الطلبيات</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={orderStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {orderStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [`${value} طلبية`, ""]}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-4">
            {orderStatusData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-muted-foreground">{item.name}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top Products */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-2xl p-6 shadow-sm"
        >
          <h3 className="text-lg font-bold text-foreground mb-6">أفضل المنتجات</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProductsData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  type="number"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                  width={80}
                />
                <Tooltip
                  formatter={(value: any) => [`${value} طلبية`, "المبيعات"]}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar
                  dataKey="orders"
                  fill="hsl(217, 91%, 60%)"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default EarningsChart;
