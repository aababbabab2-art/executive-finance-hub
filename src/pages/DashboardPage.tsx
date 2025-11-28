import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Receipt,
  BarChart3,
  RefreshCcw,
  Loader2,
  Wallet,
  AlertCircle,
  FileText,
  ArrowRight,
  CheckCircle2,
  Server
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { cn } from "@/lib/utils";

// --- LOGIKA & KONFIGURASI SISTEM (TIDAK DIUBAH) ---
const API_BASE_URL = "https://technokingindonesia.com/projekmagank/accurate-integration-project";

interface DashboardData {
  total_cash: number;
  total_outstanding: number;
  outstanding_count: number;
  revenue: number;
  cogs: number;
  expense: number;
  net_profit: number;
}

export function DashboardPage() {
  // --- STATE MANAGEMENT (LOGIKA ASLI) ---
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/dashboard_data.php`);
      const json = await res.json();
      if (json.s) {
        setData(json.d);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Format Rupiah Helper
  const fmt = (val: number) => `Rp ${val?.toLocaleString("id-ID")}`;

  // Data untuk Grafik (Diambil dari Logika KODE 2)
  const chartData = data
    ? [
        { name: "Pendapatan", amount: data.revenue, color: "#16a34a" }, // Green
        { name: "HPP", amount: data.cogs, color: "#ea580c" }, // Orange
        { name: "Beban", amount: data.expense, color: "#dc2626" }, // Red
        { name: "Laba Bersih", amount: data.net_profit, color: "#2563eb" }, // Blue
      ]
    : [];

  // --- MAPPING DATA KE UI TEMPLATE (PENYESUAIAN TAMPILAN) ---
  const metrics = [
    {
      title: "Total Cash & Bank",
      value: loading ? "..." : fmt(data?.total_cash || 0),
      subtitle: "Likuiditas Perusahaan",
      icon: DollarSign,
      trend: "neutral", 
      colorClass: "text-primary",
      bgClass: "bg-primary/10",
    },
    {
      title: "Outstanding Receivables",
      value: loading ? "..." : fmt(data?.total_outstanding || 0),
      subtitle: `${data?.outstanding_count || 0} Faktur Aktif`,
      icon: Receipt,
      trend: "down", 
      colorClass: "text-orange-500",
      bgClass: "bg-orange-500/10",
    },
    {
      title: "Monthly Revenue",
      value: loading ? "..." : fmt(data?.revenue || 0),
      subtitle: "Omzet Penjualan",
      icon: BarChart3,
      trend: "up",
      colorClass: "text-green-500",
      bgClass: "bg-green-500/10",
    },
    {
      title: "Net Profit",
      value: loading ? "..." : fmt(data?.net_profit || 0),
      subtitle: "Laba Bersih Bulan Ini",
      icon: TrendingUp,
      trend: (data?.net_profit || 0) >= 0 ? "up" : "down",
      colorClass: (data?.net_profit || 0) >= 0 ? "text-blue-500" : "text-red-500",
      bgClass: (data?.net_profit || 0) >= 0 ? "bg-blue-500/10" : "bg-red-500/10",
    },
  ];

  // Quick Actions (Fungsi navigasi dari KODE 2 dipetakan ke UI KODE 1)
  const quickActions = [
    { 
      title: "Buat Invoice", 
      icon: FileText, 
      color: "bg-primary", 
      onClick: () => window.location.href='/invoice' 
    },
    { 
      title: "Input Biaya", 
      icon: Wallet, 
      color: "bg-secondary", // Mapping secondary color style
      onClick: () => window.location.href='/kasbon' 
    },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Page Title & Refresh Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard Ringkasan</h1>
          <p className="text-muted-foreground mt-1">
            Overview Keuangan Real-time dari Accurate Online
          </p>
        </div>
        <Button 
            onClick={fetchData} 
            disabled={loading} 
            className="flex items-center gap-2 self-start"
        >
            {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <RefreshCcw className="w-4 h-4" />}
            Refresh Data
        </Button>
      </div>

      {/* Metric Cards (Layout KODE 1) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {metrics.map((metric, index) => (
          <Card key={index} className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{metric.title}</p>
                  <p className="text-xl lg:text-2xl font-bold text-foreground mt-1">
                    {metric.value}
                  </p>
                  <div className="flex items-center gap-1 mt-2 text-sm font-medium text-muted-foreground">
                    {/* Logika Trend Icon Visual */}
                    {metric.trend === "up" && <TrendingUp className="w-4 h-4 text-green-500" />}
                    {metric.trend === "down" && <TrendingDown className="w-4 h-4 text-red-500" />}
                    <span>{metric.subtitle}</span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${metric.bgClass}`}>
                  <metric.icon className={`w-6 h-6 ${metric.colorClass}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row & Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Chart Section (Menggunakan Data KODE 2 tapi Style KODE 1) */}
        <Card className="lg:col-span-2 shadow-sm">
            <CardHeader>
                <CardTitle>Financial Performance</CardTitle>
                <CardDescription>Analisa Keuangan Bulan Ini</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    {loading ? (
                         <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                             Loading Chart...
                         </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                            <XAxis type="number" hide />
                            <YAxis 
                                dataKey="name" 
                                type="category" 
                                width={100} 
                                tick={{fontSize: 12, fill: "hsl(var(--muted-foreground))"}} 
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip
                            cursor={{ fill: "transparent" }}
                            contentStyle={{
                                backgroundColor: "hsl(var(--card))",
                                border: "1px solid hsl(var(--border))",
                                borderRadius: "8px",
                            }}
                            formatter={(value: number) => fmt(value)}
                            />
                            <Bar dataKey="amount" radius={[0, 4, 4, 0]} barSize={32}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                            </Bar>
                        </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </CardContent>
        </Card>

        {/* Right Column: Quick Actions & Status */}
        <div className="space-y-6">
            
            {/* Quick Actions Card */}
            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>Common tasks</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                        {quickActions.map((action, index) => (
                        <button
                            key={index}
                            onClick={action.onClick}
                            className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted hover:bg-muted/80 transition-all duration-200 hover:scale-105 border border-transparent hover:border-border"
                        >
                            <div className={`p-3 rounded-lg ${action.color} text-primary-foreground`}>
                                <action.icon className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-medium text-foreground">{action.title}</span>
                        </button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Connection Status Card (Logika KODE 2 dikemas style KODE 1) */}
            <Card className="shadow-sm border-l-4 border-l-blue-500">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-blue-600" /> 
                        Status Koneksi
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                     <div className="flex justify-between items-center border-b border-border pb-2">
                        <span className="text-sm text-muted-foreground flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-500"/> API Status
                        </span>
                        <span className="text-sm font-bold text-green-600 bg-green-100 px-2 py-1 rounded">Terhubung</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-border pb-2">
                        <span className="text-sm text-muted-foreground flex items-center gap-2">
                            <Server className="w-4 h-4 text-gray-500"/> Database
                        </span>
                        <span className="text-xs font-mono bg-muted px-2 py-1 rounded text-foreground">zeus.accurate.id</span>
                    </div>
                    <div className="flex justify-between items-center pt-1">
                        <span className="text-sm text-muted-foreground">Periode Data</span>
                        <span className="text-sm font-medium text-foreground">Bulan Ini</span>
                    </div>
                </CardContent>
            </Card>

        </div>
      </div>

      {/* Footer / Recent Section Placeholder */}
      <Card className="shadow-sm">
         <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-1">
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Latest invoice activities overview</CardDescription>
            </div>
             <Button variant="ghost" className="text-sm text-primary hover:text-primary/80 flex items-center gap-1">
                 View All <ArrowRight className="w-4 h-4" />
            </Button>
         </CardHeader>
         <CardContent>
             {/* Karena API KODE 2 belum menyediakan list transaksi, kita tampilkan empty state yang rapi */}
             <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                 <Receipt className="w-12 h-12 mb-3 text-muted-foreground/50" />
                 <p>Data detail transaksi belum tersedia dari API.</p>
                 <p className="text-sm">Silakan cek ringkasan pada grafik di atas.</p>
             </div>
         </CardContent>
      </Card>
    </div>
  );
}

export default DashboardPage;