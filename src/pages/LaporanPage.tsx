import { useState, useEffect } from "react";
import { 
    Download, 
    Filter, 
    BarChart3, 
    TrendingUp, 
    Printer, 
    CalendarIcon, 
    Loader2, 
    Search,
    ChevronLeft, // Pagination
    ChevronRight // Pagination
} from "lucide-react";
import { 
    Card, 
    CardContent, 
    CardHeader, 
    CardTitle, 
    CardDescription 
} from "@/components/ui/card";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
} from "recharts";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar"; 
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

// --- KONFIGURASI API (DARI KODE 2) ---
const API_BASE_URL = "https://vexacreative.net/projekmagank/accurate-integration-project/Api";
const ROWS_PER_PAGE = 10; // [UPDATE] Batasan baris per halaman

// --- TYPE DEFINITIONS (DARI KODE 2) ---
interface AccountData {
    accountNo: string;
    accountName: string;
    accountType: string;
    amount: number;
}

// --- STATIC DATA UNTUK CHART TREN (PLACEHOLDER VISUAL) ---
const revenueTrendData = [
    { month: "Jan", revenue: 1200, target: 1000 },
    { month: "Feb", revenue: 1400, target: 1100 },
    { month: "Mar", revenue: 1100, target: 1200 },
    { month: "Apr", revenue: 1600, target: 1300 },
    { month: "May", revenue: 1800, target: 1400 },
    { month: "Jun", revenue: 1500, target: 1500 },
];

// --- ACCOUNT TYPE MAPPING FOR TABS ---
type ReportTab = 'SUMMARY' | 'REVENUE' | 'COGS' | 'EXPENSE' | 'ALL';

const TAB_MAPPING: Record<ReportTab, { name: string; types: string[]; color: string }> = {
    'SUMMARY': { name: 'SUMMARY P/L', types: [], color: 'text-primary' },
    'REVENUE': { name: 'PENDAPATAN', types: ['REVENUE', 'OTHER_INCOME'], color: 'text-green-600' },
    'COGS': { name: 'HPP', types: ['COGS'], color: 'text-orange-600' },
    'EXPENSE': { name: 'BEBAN', types: ['EXPENSE', 'OTHER_EXPENSE'], color: 'text-red-600' },
    'ALL': { name: 'ALL ACCOUNTS', types: ['REVENUE', 'OTHER_INCOME', 'COGS', 'EXPENSE', 'OTHER_EXPENSE'], color: 'text-foreground' },
};


export function LaporanPage() {
    // --- STATE & LOGIC (DARI KODE 2) ---
    const { toast } = useToast();
    
    // State Tanggal
    const [fromDate, setFromDate] = useState<Date>(new Date()); 
    const [toDate, setToDate] = useState<Date>(new Date());
    
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState<AccountData[]>([]);
    
    // [UPDATE] State Tab dan Pagination
    const [activeTab, setActiveTab] = useState<ReportTab>('SUMMARY');
    const [currentPage, setCurrentPage] = useState(1);
    
    // Fetch Data Logic
    const fetchReport = async () => {
        setLoading(true);
        setCurrentPage(1); // Reset page on new fetch
        try {
            if (!fromDate || !toDate) throw new Error("Tanggal belum dipilih.");

            const strFrom = format(fromDate, "dd/MM/yyyy");
            const strTo = format(toDate, "dd/MM/yyyy");
            
            const url = `${API_BASE_URL}/Laporan/Index.php?fromDate=${strFrom}&toDate=${strTo}`;

            const res = await fetch(url);
            if (!res.ok) throw new Error(`Server Error: ${res.status}`);

            const json = await res.json();

            if (json.s) {
                setReportData(json.d);
                toast({ title: "Data Dimuat", description: `Ditemukan ${json.d.length} akun.`, className: "bg-green-600 text-white" });
            } else {
                setReportData([]);
                toast({ title: "Info", description: json.d?.message || "Data tidak ditemukan", variant: "default" });
            }
        } catch (e: any) {
            toast({ title: "Error", description: e.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    // --- KALKULASI DATA REAL (DARI KODE 2) ---
    const getAccountsByType = (types: string[]) => reportData.filter(d => types.includes(d.accountType));
    const sumAmount = (data: AccountData[]) => data.reduce((acc, curr) => acc + curr.amount, 0);

    const revenueList = getAccountsByType(TAB_MAPPING.REVENUE.types);
    const cogsList = getAccountsByType(TAB_MAPPING.COGS.types);
    const expenseList = getAccountsByType(TAB_MAPPING.EXPENSE.types);

    const totalRevenue = sumAmount(revenueList);
    const totalCOGS = sumAmount(cogsList);
    const totalExpense = sumAmount(expenseList);
    const netProfit = totalRevenue - totalCOGS - totalExpense;

    // Data Real untuk Pie Chart
    const pieChartData = [
        { name: "Revenue", value: totalRevenue || 100, color: "hsl(142, 76%, 36%)" }, // Green
        { name: "COGS", value: totalCOGS || 30, color: "hsl(24, 94%, 50%)" },    // Orange
        { name: "Expenses", value: totalExpense || 20, color: "hsl(0, 84%, 60%)" }, // Red
    ];
    
    // --- Data untuk Tab Aktif ---
    const activeData = activeTab === 'SUMMARY' ? [] : getAccountsByType(TAB_MAPPING[activeTab].types);
    const totalDataLength = activeTab === 'SUMMARY' ? 0 : activeData.length;
    const totalPages = Math.ceil(totalDataLength / ROWS_PER_PAGE);
    const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
    const paginatedData = activeData.slice(startIndex, startIndex + ROWS_PER_PAGE);
    
    const goToPage = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    // Helper Render Rows (Styled like KODE 1 Table)
    const RenderRows = ({ data, startIdx = 0 }: { data: AccountData[], startIdx?: number }) => (
        <>
            {data.map((item, idx) => (
                <tr key={item.accountNo} className="flex justify-between py-2 border-b border-border/50 hover:bg-muted/50 transition-colors last:border-0 text-sm table-row">
                    <td className="w-10 px-2 text-center text-muted-foreground">{startIdx + idx + 1}</td>
                    <td className="flex-1 px-2">
                        <span className="text-foreground font-medium block">
                            {item.accountName}
                        </span>
                        <span className="text-muted-foreground text-xs block">
                            {item.accountNo}
                        </span>
                    </td>
                    <td className="w-32 px-2 text-right">
                        <span className={cn("font-medium", item.amount === 0 ? "text-muted-foreground/50" : "text-foreground")}>
                            {item.amount.toLocaleString('id-ID')}
                        </span>
                    </td>
                </tr>
            ))}
            {data.length === 0 && (
                <tr className="flex">
                    <td colSpan={3} className="text-xs text-muted-foreground italic py-4 text-center w-full">Tidak ada data akun dalam kategori ini.</td>
                </tr>
            )}
        </>
    );

    // Render Konten Tab
    const renderTabContent = () => {
        if (activeTab === 'SUMMARY') {
            return (
                <div className="p-6 space-y-8">
                    {/* PENDAPATAN */}
                    <div className="border-b pb-4">
                        <div className="flex items-center gap-2 mb-3">
                            <TrendingUp className="w-5 h-5 text-green-600" />
                            <h3 className="font-bold text-foreground uppercase border-b-2 border-green-100 flex-1 pb-1">Pendapatan Usaha</h3>
                        </div>
                        <div className="pl-7 space-y-1">
                            {revenueList.map((item, idx) => (
                                <div key={idx} className="flex justify-between py-1 border-b border-border/50 hover:bg-muted/50 transition-colors last:border-0 text-sm">
                                    <span className="text-muted-foreground pl-2">{item.accountNo} - {item.accountName}</span>
                                    <span className={cn("font-medium pr-2", item.amount === 0 ? "text-muted-foreground/50" : "text-foreground")}>{item.amount.toLocaleString('id-ID')}</span>
                                </div>
                            ))}
                            {revenueList.length === 0 && <div className="text-xs text-muted-foreground italic py-2 pl-2">Tidak ada data</div>}
                        </div>
                        <div className="flex justify-between mt-3 pt-2 border-t border-dashed ml-7 font-bold text-foreground bg-green-50/50 p-2 rounded">
                            <span>Total Pendapatan</span>
                            <span>{totalRevenue.toLocaleString('id-ID')}</span>
                        </div>
                    </div>

                    {/* HPP */}
                    <div className="border-b pb-4">
                        <div className="flex items-center gap-2 mb-3">
                            <BarChart3 className="w-5 h-5 text-orange-600" />
                            <h3 className="font-bold text-foreground uppercase border-b-2 border-orange-100 flex-1 pb-1">Beban Pokok Penjualan</h3>
                        </div>
                        <div className="pl-7 space-y-1">
                            {cogsList.map((item, idx) => (
                                <div key={idx} className="flex justify-between py-1 border-b border-border/50 hover:bg-muted/50 transition-colors last:border-0 text-sm">
                                    <span className="text-muted-foreground pl-2">{item.accountNo} - {item.accountName}</span>
                                    <span className={cn("font-medium pr-2", item.amount === 0 ? "text-muted-foreground/50" : "text-foreground")}>({item.amount.toLocaleString('id-ID')})</span>
                                </div>
                            ))}
                            {cogsList.length === 0 && <div className="text-xs text-muted-foreground italic py-2 pl-2">Tidak ada data</div>}
                        </div>
                        <div className="flex justify-between mt-3 pt-2 border-t border-dashed ml-7 font-bold text-foreground bg-orange-50/50 p-2 rounded">
                            <span>Total HPP</span>
                            <span>({totalCOGS.toLocaleString('id-ID')})</span>
                        </div>
                    </div>

                    {/* LABA KOTOR */}
                    <div className="mx-7 p-3 bg-muted/50 rounded border border-border flex justify-between font-bold text-lg print:bg-gray-100 print:border-black">
                        <span>Laba Kotor</span>
                        <span>{(totalRevenue - totalCOGS).toLocaleString('id-ID')}</span>
                    </div>

                    {/* BEBAN OPERASIONAL */}
                    <div className="border-b pb-4">
                        <div className="flex items-center gap-2 mb-3">
                            <Search className="w-5 h-5 text-red-600" />
                            <h3 className="font-bold text-foreground uppercase border-b-2 border-red-100 flex-1 pb-1">Beban Operasional</h3>
                        </div>
                        <div className="pl-7 space-y-1">
                            {expenseList.map((item, idx) => (
                                <div key={idx} className="flex justify-between py-1 border-b border-border/50 hover:bg-muted/50 transition-colors last:border-0 text-sm">
                                    <span className="text-muted-foreground pl-2">{item.accountNo} - {item.accountName}</span>
                                    <span className={cn("font-medium pr-2", item.amount === 0 ? "text-muted-foreground/50" : "text-foreground")}>({item.amount.toLocaleString('id-ID')})</span>
                                </div>
                            ))}
                            {expenseList.length === 0 && <div className="text-xs text-muted-foreground italic py-2 pl-2">Tidak ada data</div>}
                        </div>
                        <div className="flex justify-between mt-3 pt-2 border-t border-dashed ml-7 font-bold text-foreground bg-red-50/50 p-2 rounded">
                            <span>Total Beban</span>
                            <span>({totalExpense.toLocaleString('id-ID')})</span>
                        </div>
                    </div>

                    {/* LABA BERSIH */}
                    <div className="border-t-4 border-double border-foreground/20 pt-4 mt-8 print:border-black">
                        <div className="flex justify-between items-center px-4">
                            <span className="text-xl font-extrabold uppercase tracking-tight">Laba / (Rugi) Bersih</span>
                            <span className={cn("text-3xl font-extrabold", netProfit >= 0 ? "text-green-600" : "text-red-600")}>
                                Rp {netProfit.toLocaleString('id-ID')}
                            </span>
                        </div>
                    </div>
                </div>
            );
        }

        // Konten untuk Tab Detail (Revenue, COGS, Expense, All)
        return (
            <div className="p-0">
                <div className="overflow-x-auto rounded-lg border-t">
                    <table className="w-full text-sm text-left table-fixed">
                        <thead className="bg-muted text-muted-foreground font-medium uppercase text-xs tracking-wider">
                            <tr>
                                <th className="px-4 py-3 w-10 text-center">#</th>
                                <th className="px-4 py-3 w-1/2">Account Name</th>
                                <th className="px-4 py-3 w-1/4 text-right">Amount (Rp)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            <RenderRows data={paginatedData} startIdx={startIndex} />
                        </tbody>
                    </table>
                </div>
                
                {/* Pagination Footer */}
                {totalDataLength > ROWS_PER_PAGE && (
                    <div className="flex items-center justify-between px-4 py-3 border-t">
                        <div className="text-sm text-muted-foreground">
                            Showing {startIndex + 1} to {Math.min(startIndex + ROWS_PER_PAGE, totalDataLength)} of {totalDataLength} items.
                        </div>
                        <div className="space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => goToPage(currentPage - 1)}
                                disabled={currentPage === 1 || loading}
                            >
                                <ChevronLeft className="w-4 h-4" /> Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => goToPage(currentPage + 1)}
                                disabled={currentPage === totalPages || loading}
                            >
                                Next <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        );
    };
    
    // Handle tab change: reset pagination
    const handleTabChange = (tab: ReportTab) => {
        setActiveTab(tab);
        setCurrentPage(1);
    };

    return (
        <div className="space-y-6 p-6 print:p-0 print:bg-white">
            
            {/* Page Header (UPDATED with card-header-gradient) */}
            <Card className="shadow-lg border-border print:hidden">
                <div className="card-header-gradient rounded-b-none p-4 sm:p-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary-foreground">Laporan Keuangan</h1>
                            <p className="text-primary-foreground/90 mt-1 text-sm">Profit & Loss Statement (Laba Rugi)</p>
                        </div>
                        <div className="flex gap-2">
                             <Button variant="secondary" className="text-primary hover:bg-white/90 shadow-md" onClick={() => window.print()}>
                                 <Printer className="w-4 h-4 mr-2" /> Print Report
                             </Button>
                             <Button className="btn-gradient flex items-center gap-2" onClick={fetchReport} disabled={loading}>
                                 {loading ? <Loader2 className="animate-spin w-4 h-4"/> : <Download className="w-4 h-4" />}
                                 Generate Report
                             </Button>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Filter Section (Styled KODE 1) */}
            <Card className="shadow-sm border-input print:hidden">
                <CardHeader>
                    <CardTitle>Report Parameters</CardTitle>
                    <CardDescription>Select period range</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div className="md:col-span-1">
                            <label className="block text-sm font-medium text-foreground mb-2">From Date</label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal border-input", !fromDate && "text-muted-foreground")}>
                                        <CalendarIcon className="mr-2 h-4 w-4" /> {fromDate ? format(fromDate, "dd/MM/yyyy") : "Pick Date"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={fromDate} onSelect={(d) => d && setFromDate(d)} /></PopoverContent>
                            </Popover>
                        </div>
                        <div className="md:col-span-1">
                            <label className="block text-sm font-medium text-foreground mb-2">To Date</label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal border-input", !toDate && "text-muted-foreground")}>
                                        <CalendarIcon className="mr-2 h-4 w-4" /> {toDate ? format(toDate, "dd/MM/yyyy") : "Pick Date"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={toDate} onSelect={(d) => d && setToDate(d)} /></PopoverContent>
                            </Popover>
                        </div>
                        <div className="md:col-span-2">
                            <Button className="w-full flex items-center justify-center gap-2 btn-gradient" onClick={fetchReport} disabled={loading}>
                                <Filter className="w-4 h-4" />
                                {loading ? "Loading Data..." : "Apply Filter"}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Real-time Metrics (Data from API) - ASL: AS LIKE ORIGINAL */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 print:grid-cols-3">
                <Card className="shadow-sm">
                    <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">Total Revenue</p>
                        <p className="text-2xl font-bold text-green-600 mt-1">Rp {totalRevenue.toLocaleString('id-ID')}</p>
                        <p className="text-xs text-muted-foreground mt-2">Income from operations</p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm">
                    <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">Total Expenses (HPP+Ops)</p>
                        <p className="text-2xl font-bold text-red-600 mt-1">Rp {(totalCOGS + totalExpense).toLocaleString('id-ID')}</p>
                        <p className="text-xs text-muted-foreground mt-2">Cost of goods & operational</p>
                    </CardContent>
                </Card>
                <Card className={cn("shadow-sm border-l-4", netProfit >= 0 ? "border-l-green-500" : "border-l-red-500")}>
                    <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">Net Profit / Loss</p>
                        <p className={cn("text-2xl font-bold mt-1", netProfit >= 0 ? "text-green-600" : "text-red-600")}>
                            Rp {netProfit.toLocaleString('id-ID')}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">Final bottom line</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row (Print Hidden) - ASL: AS LIKE ORIGINAL */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:hidden">
                {/* Revenue Trend (Static Placeholder) */}
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle>Revenue Trend</CardTitle>
                        <CardDescription>Monthly target vs actual (Simulation)</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={revenueTrendData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                                    <YAxis stroke="hsl(var(--muted-foreground))" />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px" }}
                                    />
                                    <Legend />
                                    <Bar dataKey="revenue" name="Actual" fill="hsl(142, 76%, 36%)" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="target" name="Target" fill="hsl(220, 14%, 85%)" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Distribution Chart (REAL DATA) */}
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle>Cost Distribution</CardTitle>
                        <CardDescription>Based on current filtered data</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[250px] w-full flex items-center justify-center">
                            {totalRevenue === 0 && totalExpense === 0 ? (
                                <div className="text-muted-foreground text-sm">No data to display</div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={pieChartData}
                                            cx="50%" cy="50%"
                                            innerRadius={60} outerRadius={90}
                                            paddingAngle={2}
                                            dataKey="value"
                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        >
                                            {pieChartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px" }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Detailed Report Table (The Core Report) */}
            <Card className="shadow-lg border-input print:shadow-none print:border-0">
                <CardHeader className="border-b bg-muted/20 print:bg-white print:border-b-2 print:pb-2 p-0">
                    <div className="p-6 pb-2 print:p-0">
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle className="uppercase tracking-wider">Laporan Laba Rugi</CardTitle>
                                <CardDescription>
                                    Periode: {format(fromDate, "dd MMM yyyy")} - {format(toDate, "dd MMM yyyy")}
                                </CardDescription>
                            </div>
                            <div className="hidden print:block text-right">
                                 <p className="text-xs text-muted-foreground">Generated on {format(new Date(), "dd/MM/yyyy HH:mm")}</p>
                            </div>
                        </div>
                    </div>
                    
                    {/* [UPDATE] Breadcrumb Tab Navigation */}
                    <div className="flex border-b border-border print:hidden px-6 pt-2">
                        {(Object.keys(TAB_MAPPING) as ReportTab[]).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => handleTabChange(tab)}
                                className={cn(
                                    "px-4 py-2 text-sm font-medium transition-colors border-b-2",
                                    activeTab === tab
                                        ? `border-primary text-primary`
                                        : "border-transparent text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {TAB_MAPPING[tab].name}
                            </button>
                        ))}
                    </div>
                </CardHeader>
                
                <CardContent className="p-0">
                    {renderTabContent()}
                </CardContent>
            </Card>
        </div>
    );
}

export default LaporanPage;