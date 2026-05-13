import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell
} from "recharts";

type RevenuePoint = { month: string; revenue: number; commissions: number };
type DistributionPoint = { name: string; value: number; color: string };

export function RevenueAreaChart({ data }: { data: RevenuePoint[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
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
  );
}

export function OrderDistributionPieChart({ data }: { data: DistributionPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip formatter={(value: any) => [`${value} طلبية`, ""]} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function MonthlyBarChart({ data }: { data: RevenuePoint[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
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
  );
}
