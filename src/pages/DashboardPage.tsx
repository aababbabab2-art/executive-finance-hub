import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Receipt,
  BarChart3,
  Users,
  ArrowRight,
  Plus,
  FileText,
  Wallet,
  ArrowRightLeft,
} from "lucide-react";
import { CardWithHeader } from "@/components/ui/CardWithHeader";
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
} from "recharts";

const metrics = [
  {
    title: "Total Cash",
    value: "Rp 2.450.000.000",
    change: "+12.5%",
    trend: "up",
    icon: DollarSign,
  },
  {
    title: "Outstanding Receivables",
    value: "Rp 890.000.000",
    change: "-5.2%",
    trend: "down",
    icon: Receipt,
  },
  {
    title: "Monthly Revenue",
    value: "Rp 1.250.000.000",
    change: "+8.1%",
    trend: "up",
    icon: BarChart3,
  },
  {
    title: "Net Profit",
    value: "Rp 450.000.000",
    change: "+15.3%",
    trend: "up",
    icon: TrendingUp,
  },
];

const chartData = [
  { month: "Jan", revenue: 1200, expenses: 800, profit: 400 },
  { month: "Feb", revenue: 1400, expenses: 900, profit: 500 },
  { month: "Mar", revenue: 1100, expenses: 750, profit: 350 },
  { month: "Apr", revenue: 1600, expenses: 950, profit: 650 },
  { month: "May", revenue: 1800, expenses: 1000, profit: 800 },
  { month: "Jun", revenue: 1500, expenses: 850, profit: 650 },
  { month: "Jul", revenue: 2000, expenses: 1100, profit: 900 },
  { month: "Aug", revenue: 1900, expenses: 1050, profit: 850 },
  { month: "Sep", revenue: 2200, expenses: 1200, profit: 1000 },
  { month: "Oct", revenue: 2100, expenses: 1150, profit: 950 },
  { month: "Nov", revenue: 2400, expenses: 1300, profit: 1100 },
  { month: "Dec", revenue: 2600, expenses: 1400, profit: 1200 },
];

const recentTransactions = [
  { id: "INV-001", customer: "PT Maju Jaya", amount: "Rp 45.000.000", status: "Paid" },
  { id: "INV-002", customer: "CV Sukses Mandiri", amount: "Rp 32.500.000", status: "Pending" },
  { id: "INV-003", customer: "PT Sentosa Abadi", amount: "Rp 78.000.000", status: "Paid" },
  { id: "INV-004", customer: "UD Berkah", amount: "Rp 15.750.000", status: "Overdue" },
  { id: "INV-005", customer: "PT Global Indonesia", amount: "Rp 120.000.000", status: "Paid" },
];

const quickActions = [
  { title: "New Invoice", icon: FileText, color: "bg-primary" },
  { title: "Add Kasbon", icon: Wallet, color: "bg-secondary" },
  { title: "Transfer", icon: ArrowRightLeft, color: "bg-accent" },
  { title: "New Job", icon: Plus, color: "bg-info" },
];

const DashboardPage = () => {
  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's your financial overview.
          </p>
        </div>
        <button className="btn-gradient flex items-center gap-2 self-start">
          <Plus className="w-4 h-4" />
          Quick Action
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {metrics.map((metric, index) => (
          <div key={index} className="metric-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{metric.title}</p>
                <p className="text-xl lg:text-2xl font-bold text-foreground mt-1">
                  {metric.value}
                </p>
                <div
                  className={`flex items-center gap-1 mt-2 text-sm font-medium ${
                    metric.trend === "up" ? "text-success" : "text-destructive"
                  }`}
                >
                  {metric.trend === "up" ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  <span>{metric.change} from last month</span>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-primary/10">
                <metric.icon className="w-6 h-6 text-primary" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <CardWithHeader
          title="Financial Performance"
          subtitle="Revenue vs Expenses (in millions)"
          className="lg:col-span-2"
        >
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(0, 75%, 31%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(0, 75%, 31%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(220, 14%, 45%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(220, 14%, 45%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(0, 75%, 31%)"
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
                <Area
                  type="monotone"
                  dataKey="expenses"
                  stroke="hsl(220, 14%, 45%)"
                  fillOpacity={1}
                  fill="url(#colorExpenses)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardWithHeader>

        {/* Quick Actions */}
        <CardWithHeader title="Quick Actions" subtitle="Common tasks">
          <div className="grid grid-cols-2 gap-4">
            {quickActions.map((action, index) => (
              <button
                key={index}
                className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted hover:bg-muted/80 transition-all duration-200 hover:scale-105"
              >
                <div className={`p-3 rounded-lg ${action.color}`}>
                  <action.icon className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-sm font-medium text-foreground">{action.title}</span>
              </button>
            ))}
          </div>
        </CardWithHeader>
      </div>

      {/* Recent Transactions & Profit Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <CardWithHeader
          title="Recent Transactions"
          subtitle="Latest invoice activities"
          headerActions={
            <button className="text-sm text-primary-foreground/80 hover:text-primary-foreground flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </button>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full table-striped table-hover">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                    Invoice
                  </th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                    Customer
                  </th>
                  <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">
                    Amount
                  </th>
                  <th className="text-center py-3 px-2 text-sm font-medium text-muted-foreground">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((tx) => (
                  <tr key={tx.id} className="border-b border-border/50">
                    <td className="py-3 px-2 text-sm font-medium text-foreground">{tx.id}</td>
                    <td className="py-3 px-2 text-sm text-muted-foreground">{tx.customer}</td>
                    <td className="py-3 px-2 text-sm text-foreground text-right">{tx.amount}</td>
                    <td className="py-3 px-2 text-center">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          tx.status === "Paid"
                            ? "bg-success/10 text-success"
                            : tx.status === "Pending"
                            ? "bg-warning/10 text-warning"
                            : "bg-destructive/10 text-destructive"
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardWithHeader>

        {/* Profit Chart */}
        <CardWithHeader title="Monthly Profit" subtitle="Profit trend (in millions)">
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="profit" fill="hsl(0, 75%, 31%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardWithHeader>
      </div>
    </div>
  );
};

export default DashboardPage;
