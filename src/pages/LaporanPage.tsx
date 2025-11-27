import { useState } from "react";
import { Download, FileText, Calendar, Filter, BarChart3, PieChart, TrendingUp, FileSpreadsheet } from "lucide-react";
import { CardWithHeader } from "@/components/ui/CardWithHeader";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPie,
  Pie,
  Cell,
  Legend,
} from "recharts";

const revenueByMonth = [
  { month: "Jan", revenue: 1200, target: 1000 },
  { month: "Feb", revenue: 1400, target: 1100 },
  { month: "Mar", revenue: 1100, target: 1200 },
  { month: "Apr", revenue: 1600, target: 1300 },
  { month: "May", revenue: 1800, target: 1400 },
  { month: "Jun", revenue: 1500, target: 1500 },
];

const expensesByCategory = [
  { name: "Salary", value: 45, color: "hsl(0, 75%, 31%)" },
  { name: "Operations", value: 25, color: "hsl(0, 65%, 45%)" },
  { name: "Marketing", value: 15, color: "hsl(199, 89%, 48%)" },
  { name: "Utilities", value: 10, color: "hsl(38, 92%, 50%)" },
  { name: "Others", value: 5, color: "hsl(220, 14%, 45%)" },
];

const reportTypes = [
  {
    id: "income-statement",
    title: "Income Statement",
    description: "Revenue and expenses summary",
    icon: TrendingUp,
    lastGenerated: "2024-01-31",
  },
  {
    id: "balance-sheet",
    title: "Balance Sheet",
    description: "Assets, liabilities, and equity",
    icon: FileSpreadsheet,
    lastGenerated: "2024-01-31",
  },
  {
    id: "cash-flow",
    title: "Cash Flow Statement",
    description: "Cash inflows and outflows",
    icon: BarChart3,
    lastGenerated: "2024-01-31",
  },
  {
    id: "receivables",
    title: "Receivables Aging",
    description: "Outstanding customer invoices",
    icon: FileText,
    lastGenerated: "2024-01-30",
  },
  {
    id: "payables",
    title: "Payables Aging",
    description: "Outstanding vendor invoices",
    icon: FileText,
    lastGenerated: "2024-01-30",
  },
  {
    id: "trial-balance",
    title: "Trial Balance",
    description: "Account balances summary",
    icon: PieChart,
    lastGenerated: "2024-01-31",
  },
];

const LaporanPage = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("monthly");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Laporan</h1>
          <p className="text-muted-foreground mt-1">
            Financial reports and analytics
          </p>
        </div>
        <button className="btn-gradient flex items-center gap-2 self-start">
          <Download className="w-4 h-4" />
          Export All Reports
        </button>
      </div>

      {/* Period Filter */}
      <CardWithHeader title="Report Parameters" subtitle="Select period and filters">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Report Period
            </label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="input-floating"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              From Date
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="input-floating"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              To Date
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="input-floating"
            />
          </div>
          <div className="flex items-end">
            <button className="btn-gradient w-full flex items-center justify-center gap-2">
              <Filter className="w-4 h-4" />
              Apply Filter
            </button>
          </div>
        </div>
      </CardWithHeader>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <CardWithHeader title="Revenue vs Target" subtitle="Monthly comparison (in millions)">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueByMonth}>
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
                <Legend />
                <Bar dataKey="revenue" name="Revenue" fill="hsl(0, 75%, 31%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="target" name="Target" fill="hsl(220, 14%, 75%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardWithHeader>

        {/* Expense Distribution */}
        <CardWithHeader title="Expense Distribution" subtitle="By category">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPie>
                <Pie
                  data={expensesByCategory}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {expensesByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
              </RechartsPie>
            </ResponsiveContainer>
          </div>
        </CardWithHeader>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="metric-card">
          <p className="text-sm text-muted-foreground">Total Revenue (YTD)</p>
          <p className="text-2xl font-bold text-foreground mt-1">Rp 8.6B</p>
          <p className="text-xs text-success mt-2">+18.5% vs last year</p>
        </div>
        <div className="metric-card">
          <p className="text-sm text-muted-foreground">Total Expenses (YTD)</p>
          <p className="text-2xl font-bold text-foreground mt-1">Rp 5.2B</p>
          <p className="text-xs text-destructive mt-2">+12.3% vs last year</p>
        </div>
        <div className="metric-card">
          <p className="text-sm text-muted-foreground">Net Profit (YTD)</p>
          <p className="text-2xl font-bold text-success mt-1">Rp 3.4B</p>
          <p className="text-xs text-success mt-2">+28.7% vs last year</p>
        </div>
        <div className="metric-card">
          <p className="text-sm text-muted-foreground">Profit Margin</p>
          <p className="text-2xl font-bold text-foreground mt-1">39.5%</p>
          <p className="text-xs text-success mt-2">+4.2% vs last year</p>
        </div>
      </div>

      {/* Available Reports */}
      <CardWithHeader title="Available Reports" subtitle="Generate and download financial reports">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reportTypes.map((report) => (
            <div
              key={report.id}
              className="p-4 border border-border rounded-lg hover:border-primary/50 hover:bg-muted/50 transition-all duration-200 cursor-pointer group"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <report.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-foreground">{report.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{report.description}</p>
                  <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    <span>Last: {report.lastGenerated}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button className="flex-1 px-3 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                  Generate
                </button>
                <button className="px-3 py-2 text-sm font-medium border border-border rounded-lg hover:bg-muted transition-colors">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </CardWithHeader>

      {/* Quick Export */}
      <CardWithHeader title="Quick Export" subtitle="Export data in various formats">
        <div className="flex flex-wrap gap-4">
          <button className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-lg hover:bg-muted transition-colors">
            <FileSpreadsheet className="w-4 h-4 text-success" />
            <span>Export to Excel</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-lg hover:bg-muted transition-colors">
            <FileText className="w-4 h-4 text-destructive" />
            <span>Export to PDF</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-lg hover:bg-muted transition-colors">
            <FileText className="w-4 h-4 text-info" />
            <span>Export to CSV</span>
          </button>
        </div>
      </CardWithHeader>
    </div>
  );
};

export default LaporanPage;
