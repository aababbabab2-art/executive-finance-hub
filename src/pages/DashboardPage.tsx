import { useState, useEffect } from "react";
import { 
    Wallet, 
    TrendingUp, 
    TrendingDown, 
    CreditCard, 
    RefreshCcw, 
    Loader2,
    ArrowUpRight,
    ArrowDownRight,
    DollarSign,
    Activity,
    AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer, 
    Cell,
    PieChart,
    Pie,
    Legend
} from 'recharts';
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const API_BASE_URL = "https://vexacreative.net/projekmagank/accurate-integration-project/Api";

// Interfaces
interface DashboardData {
    summary: {
        total_cash: number;
        total_ar: number;
        revenue: number;
        expense: number;
        net_profit: number;
    };
    chart_bank: { name: string; value: number }[];
    chart_pl: { name: string; value: number }[];
    recent_invoices: { number: string; date: string; customer: string; amount: number; status: string }[];
    recent_expenses: { number: string; date: string; desc: string; amount: number }[];
}

const COLORS = ['#0ea5e9', '#f97316', '#ef4444', '#22c55e', '#8b5cf6'];

export function DashboardPage() {
    const { toast } = useToast();
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            console.log("Fetching Dashboard Data..."); // Debug Log
            const res = await fetch(`${API_BASE_URL}/Dashboard/DashboardData.php`);
            
            if (!res.ok) {
                throw new Error(`HTTP Error: ${res.status}`);
            }

            const json = await res.json();
            console.log("Dashboard Data Received:", json); // Debug Log

            if (json.s) {
                setData(json.d);
            } else {
                // Jika backend mengembalikan error logika (misal DB koneksi putus)
                throw new Error(json.message || "Gagal memuat data dashboard");
            }
        } catch (e: any) {
            console.error("Dashboard Error:", e);
            setError(e.message);
            toast({ 
                title: "Gagal Memuat Data", 
                description: "Periksa koneksi internet atau server backend.", 
                variant: "destructive" 
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Helper Format Rupiah yang Aman
    const fmt = (val: number | undefined) => {
        if (val === undefined || val === null) return "Rp 0";
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
    };

    // TAMPILAN LOADING AWAL (Agar tidak blank page saat data null)
    if (loading && !data) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
                <h2 className="text-lg font-semibold text-gray-700">Memuat Dashboard Eksekutif...</h2>
                <p className="text-sm text-gray-500">Menghubungkan ke Accurate Online</p>
            </div>
        );
    }

    // TAMPILAN JIKA ERROR FATAL
    if (error && !data) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
                <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md border border-red-100">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="h-8 w-8 text-red-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Gagal Memuat Dashboard</h2>
                    <p className="text-gray-600 mb-6 text-sm">{error}</p>
                    <Button onClick={fetchData} className="w-full">Coba Lagi</Button>
                </div>
            </div>
        );
    }

    // TAMPILAN UTAMA DASHBOARD
    return (
        <div className="min-h-screen bg-gray-50/50 p-6 space-y-8">
            
            {/* Header - UPDATED WITH card-header-gradient */}
            <Card className="shadow-lg border-border">
                <div className="card-header-gradient rounded-b-none">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary-foreground">Executive Dashboard</h1>
                            <p className="text-primary-foreground/90 mt-1 text-sm">Real-time financial overview</p>
                        </div>
                        <Button 
                            onClick={fetchData} 
                            disabled={loading} 
                            variant="secondary" 
                            className="text-primary hover:bg-white/90 bg-white/80 transition-all duration-300 shadow-md"
                        >
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <RefreshCcw className="mr-2 h-4 w-4"/>}
                            Refresh Data
                        </Button>
                    </div>
                </div>
            </Card>
            {/* End of Header Update */}

            {/* KPI CARDS - ASL: AS LIKE ORIGINAL */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Cash */}
                <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-all">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Kas & Bank</CardTitle>
                        <Wallet className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">
                            {fmt(data?.summary?.total_cash)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Likuiditas Perusahaan</p>
                    </CardContent>
                </Card>

                {/* Net Profit */}
                <Card className={cn("border-l-4 shadow-sm hover:shadow-md transition-all", (data?.summary?.net_profit || 0) >= 0 ? "border-l-green-500" : "border-l-red-500")}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Laba Bersih (Bulan Ini)</CardTitle>
                        <Activity className={cn("h-4 w-4", (data?.summary?.net_profit || 0) >= 0 ? "text-green-500" : "text-red-500")} />
                    </CardHeader>
                    <CardContent>
                        <div className={cn("text-2xl font-bold", (data?.summary?.net_profit || 0) >= 0 ? "text-green-700" : "text-red-600")}>
                            {fmt(data?.summary?.net_profit)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Revenue - COGS - Expense</p>
                    </CardContent>
                </Card>

                {/* Total AR */}
                <Card className="border-l-4 border-l-orange-500 shadow-sm hover:shadow-md transition-all">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Piutang Belum Lunas</CardTitle>
                        <CreditCard className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">
                            {fmt(data?.summary?.total_ar)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Outstanding Invoices</p>
                    </CardContent>
                </Card>

                {/* Revenue */}
                <Card className="border-l-4 border-l-indigo-500 shadow-sm hover:shadow-md transition-all">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Pendapatan (Bulan Ini)</CardTitle>
                        <DollarSign className="h-4 w-4 text-indigo-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">
                            {fmt(data?.summary?.revenue)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Total Omzet Masuk</p>
                    </CardContent>
                </Card>
            </div>

            {/* CHARTS SECTION - ASL: AS LIKE ORIGINAL */}
            <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
                
                {/* Bar Chart: Saldo Bank */}
                <Card className="lg:col-span-4 shadow-sm">
                    <CardHeader>
                        <CardTitle>Komposisi Kas & Bank</CardTitle>
                        <CardDescription>Saldo 5 akun likuiditas terbesar</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[300px] w-full">
                            {data?.chart_bank && data.chart_bank.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={data.chart_bank} layout="vertical" margin={{top: 5, right: 30, left: 20, bottom: 5}}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 11}} interval={0} />
                                        <Tooltip formatter={(value: number) => fmt(value)} contentStyle={{borderRadius: '8px'}} />
                                        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={30}>
                                            {data.chart_bank.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-gray-400 text-sm">Tidak ada data saldo bank</div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Pie Chart: Profit & Loss */}
                <Card className="lg:col-span-3 shadow-sm">
                    <CardHeader>
                        <CardTitle>Analisa Laba Rugi</CardTitle>
                        <CardDescription>Proporsi Pendapatan vs Biaya (Bulan Ini)</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            {data?.chart_pl && data.chart_pl.some(d => d.value > 0) ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={data.chart_pl}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {data.chart_pl.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={index === 0 ? '#22c55e' : index === 1 ? '#f97316' : '#ef4444'} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value: number) => fmt(value)} />
                                        <Legend verticalAlign="bottom" height={36}/>
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-gray-400 text-sm">Belum ada data transaksi bulan ini</div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* RECENT ACTIVITY TABLES - ASL: AS LIKE ORIGINAL */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Recent Invoices */}
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <ArrowUpRight className="h-5 w-5 text-green-600" /> Penjualan Terakhir
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {data?.recent_invoices && data.recent_invoices.length > 0 ? (
                                data.recent_invoices.map((inv, idx) => (
                                    <div key={idx} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0 hover:bg-gray-50 p-2 rounded transition-colors">
                                        <div>
                                            <p className="font-medium text-sm text-gray-900">{inv.customer}</p>
                                            <p className="text-xs text-gray-500">{inv.number} • {inv.date}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-sm text-gray-900">{fmt(inv.amount)}</p>
                                            <span className={cn(
                                                "text-[10px] px-2 py-0.5 rounded-full",
                                                inv.status === 'Paid' ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                                            )}>
                                                {inv.status}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-muted-foreground py-4 text-sm">Belum ada transaksi penjualan.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Expenses */}
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <ArrowDownRight className="h-5 w-5 text-red-600" /> Pengeluaran Terakhir
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {data?.recent_expenses && data.recent_expenses.length > 0 ? (
                                data.recent_expenses.map((exp, idx) => (
                                    <div key={idx} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0 hover:bg-gray-50 p-2 rounded transition-colors">
                                        <div>
                                            <p className="font-medium text-sm text-gray-900 truncate max-w-[180px]">{exp.desc}</p>
                                            <p className="text-xs text-gray-500">{exp.number} • {exp.date}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-sm text-red-600">{fmt(exp.amount)}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-muted-foreground py-4 text-sm">Belum ada pengeluaran.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}