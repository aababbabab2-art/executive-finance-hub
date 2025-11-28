import { useState, useEffect, useRef } from "react";
import { 
  Search, 
  Plus, 
  Filter, 
  Trash2, 
  MoreHorizontal, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  CalendarIcon, 
  X,
  Check,
  ChevronsUpDown,
  Wallet,
  Send
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar"; 
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

// --- KONFIGURASI API (DARI KODE 2) ---
const API_BASE_URL = "https://technokingindonesia.com/projekmagank/accurate-integration-project";

// --- TIPE DATA (DARI KODE 2) ---
interface GlAccount {
  id: number;
  name: string;
  no: string;
  accountType: string;
}

interface DetailAccount {
    id: string;
    accountNo: string;
    accountName: string;
    amount: number;
    detailNotes: string;
}

// --- COMPONENT ASYNC SELECT (REUSABLE & STYLED) ---
interface AsyncSelectProps {
    value: string;
    displayName?: string;
    onChange: (val: string, name: string, id?: number) => void;
    placeholder: string;
    filterType?: string;   // 'CASH_BANK' atau kosong
    apiEndpoint: string;
}

const AsyncAccountSelect: React.FC<AsyncSelectProps> = ({ 
    value, displayName, onChange, placeholder, filterType, apiEndpoint 
}) => {
    const [query, setQuery] = useState("");
    const [options, setOptions] = useState<GlAccount[]>([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const fetchAccounts = async (keyword: string) => {
        setLoading(true);
        try {
            const url = new URL(apiEndpoint);
            if (keyword) url.searchParams.append("q", keyword);
            if (filterType) url.searchParams.append("type", filterType);

            const res = await fetch(url.toString());
            const data = await res.json();

            if (data.s === true && Array.isArray(data.d)) {
                setOptions(data.d);
            } else {
                setOptions([]);
            }
        } catch (e) {
            setOptions([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            if (isOpen) fetchAccounts(query);
        }, 400);
        return () => clearTimeout(timer);
    }, [query, isOpen]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    if (value && !isOpen) {
        return (
            <div className="relative flex items-center w-full">
                <div 
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm cursor-pointer hover:bg-muted/50" 
                    onClick={() => { setIsOpen(true); setQuery(""); fetchAccounts(""); }}
                >
                    <span className="truncate font-medium text-foreground">{displayName || value}</span>
                    <ChevronsUpDown className="h-4 w-4 text-muted-foreground opacity-50" />
                </div>
                <button type="button" onClick={(e) => { e.stopPropagation(); onChange("", "", 0); }} className="absolute right-8 p-1 hover:text-destructive transition-colors">
                    <X className="h-4 w-4 text-muted-foreground" />
                </button>
            </div>
        );
    }

    return (
        <div className="relative w-full" ref={wrapperRef}>
            <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input 
                    className="flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-8 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" 
                    placeholder={placeholder} 
                    value={query} 
                    onChange={(e) => setQuery(e.target.value)} 
                    onFocus={() => setIsOpen(true)}
                    onClick={() => setIsOpen(true)}
                />
                {loading && <Loader2 className="absolute right-2.5 top-3 h-4 w-4 animate-spin text-primary" />}
            </div>
            {isOpen && (
                <div className="absolute top-full left-0 z-[50] mt-1 w-full max-h-[250px] overflow-y-auto rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95">
                    {options.length === 0 && !loading ? (
                        <div className="px-2 py-3 text-sm text-center text-muted-foreground italic">
                            {query ? "Tidak ditemukan." : "Ketik nama akun..."}
                        </div>
                    ) : (
                        options.map((opt) => (
                            <div 
                                key={opt.id} 
                                className={cn(
                                    "flex flex-col cursor-pointer select-none rounded-sm px-2 py-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground border-b border-border/50 last:border-0",
                                    value === opt.no && "bg-accent text-accent-foreground"
                                )}
                                onClick={() => { onChange(opt.no, `${opt.no} - ${opt.name}`, opt.id); setIsOpen(false); setQuery(""); }}
                            >
                                <div className="flex items-center">
                                    <Check className={cn("mr-2 h-4 w-4", value === opt.no ? "opacity-100" : "opacity-0")} />
                                    <span className="font-medium">{opt.no} - {opt.name}</span>
                                </div>
                                <span className="text-[10px] text-muted-foreground ml-6">{opt.accountType}</span>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

// --- DATA MOCK (DARI KODE 1 - VISUAL ONLY) ---
const mockKasbonData = [
  { id: "KSB-2024-001", employee: "Ahmad Fauzi", department: "Marketing", amount: "Rp 5.000.000", purpose: "Client Meeting Expenses", status: "Approved" },
  { id: "KSB-2024-002", employee: "Siti Nurhaliza", department: "Operations", amount: "Rp 3.500.000", purpose: "Office Supplies", status: "Pending" },
  { id: "KSB-2024-003", employee: "Budi Santoso", department: "IT", amount: "Rp 8.000.000", purpose: "Hardware Purchase", status: "Approved" },
];

const mockMetrics = [
    { title: "Total Outstanding", value: "Rp 28.500.000", subtitle: "5 active requests", color: "text-foreground" },
    { title: "Pending Approval", value: "Rp 13.500.000", subtitle: "2 requests waiting", color: "text-yellow-600" },
    { title: "Settled This Month", value: "Rp 45.000.000", subtitle: "12 settled", color: "text-green-600" },
];

// --- MAIN PAGE COMPONENT ---
export function KasbonPage() {
    // --- STATE & LOGIC (DARI KODE 2) ---
    const { toast } = useToast();
    const [transDate, setTransDate] = useState<Date>(new Date());
    
    // State Header
    const [bankId, setBankId] = useState<number | null>(null);
    const [bankName, setBankName] = useState("");
    const [description, setDescription] = useState("");
    const [saving, setSaving] = useState(false);
    
    // State Detail (Multi-row)
    const [detailAccounts, setDetailAccounts] = useState<DetailAccount[]>([
        { id: 'row_1', accountNo: '', accountName: '', amount: 0, detailNotes: '' },
    ]);

    // UI State
    const [searchTerm, setSearchTerm] = useState("");

    // Logic Baris
    const addRow = () => {
        setDetailAccounts([...detailAccounts, { 
            id: `row_${Date.now()}`, accountNo: '', accountName: '', amount: 0, detailNotes: '' 
        }]);
    };

    const removeRow = (id: string) => { 
        if (detailAccounts.length > 1) {
            setDetailAccounts(detailAccounts.filter(d => d.id !== id)); 
        } else {
            setDetailAccounts([{ id: 'row_1', accountNo: '', accountName: '', amount: 0, detailNotes: '' }]);
        }
    };

    const updateRow = (id: string, field: keyof DetailAccount, val: any) => {
        setDetailAccounts(prev => prev.map(r => r.id === id ? { ...r, [field]: val } : r));
    };

    const totalAmount = detailAccounts.reduce((sum, item) => sum + (item.amount || 0), 0);

    // Submit Handler (KODE 2 Logic)
    const handleSubmit = async () => {
        // Validasi
        if (!bankId) {
            toast({ title: "Validasi Gagal", description: "Mohon pilih Sumber Dana (Kas/Bank).", variant: "destructive" });
            return;
        }

        const validDetails = detailAccounts.filter(d => d.accountNo && d.amount > 0);
        if (validDetails.length === 0) {
            toast({ title: "Validasi Gagal", description: "Mohon isi setidaknya satu Akun Target dengan jumlah nominal.", variant: "destructive" });
            return;
        }

        setSaving(true);
        try {
            const payload = {
                transDate: format(transDate, "dd/MM/yyyy"), 
                bankId: bankId,
                description: description || "Pengeluaran Kasbon/Biaya via Web",
                detailAccount: validDetails.map(d => ({
                    accountNo: d.accountNo,
                    amount: d.amount,
                    detailNotes: d.detailNotes || description
                }))
            };

            const res = await fetch(`${API_BASE_URL}/transaksi_kasbon.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const json = await res.json();

            if (json.s === true) {
                toast({ 
                    title: "Berhasil Disimpan!", 
                    description: `Nomor Transaksi: ${json.d?.r?.number || 'Sukses'}`, 
                    className: "bg-green-600 text-white border-green-700" 
                });
                
                // Reset Form
                setDetailAccounts([{ id: `row_${Date.now()}`, accountNo: '', accountName: '', amount: 0, detailNotes: '' }]);
                setDescription("");
                // Opsional: setBankId(null); setBankName("");
            } else {
                const errorMsg = json.d?.message || (Array.isArray(json.d) ? json.d.join(", ") : "Terjadi kesalahan sistem.");
                throw new Error(errorMsg);
            }
        } catch (e: any) {
            toast({ 
                title: "Gagal Menyimpan", 
                description: e.message || "Koneksi ke server bermasalah.", 
                variant: "destructive" 
            });
        } finally {
            setSaving(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "Approved": return "bg-green-100 text-green-700";
            case "Pending": return "bg-yellow-100 text-yellow-700";
            case "Rejected": return "bg-red-100 text-red-700";
            default: return "bg-gray-100 text-gray-700";
        }
    };

    return (
        <div className="space-y-6 p-6">
            {/* Page Header (KODE 1) */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Kasbon / Biaya</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage employee cash advances and expenses
                    </p>
                </div>
                <Button className="btn-gradient flex items-center gap-2 self-start" onClick={() => window.scrollTo({ top: 350, behavior: 'smooth' })}>
                    <Plus className="w-4 h-4" />
                    New Kasbon Request
                </Button>
            </div>

            {/* Summary Cards (KODE 1) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {mockMetrics.map((metric, idx) => (
                    <Card key={idx} className="shadow-sm">
                        <CardContent className="p-4">
                            <p className="text-sm text-muted-foreground">{metric.title}</p>
                            <p className={`text-2xl font-bold mt-1 ${metric.color}`}>{metric.value}</p>
                            <p className="text-xs text-muted-foreground mt-2">{metric.subtitle}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Filters (KODE 1) */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search kasbon requests..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                </div>
                <Button variant="outline" className="flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    Filter
                </Button>
            </div>

            {/* --- FORM KASBON (LOGIC KODE 2 INTEGRATED) --- */}
            <Card className="shadow-sm border-input">
                <CardHeader>
                    <CardTitle>New Kasbon / Expense Request</CardTitle>
                    <CardDescription>Submit a cash advance or expense recording</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        
                        {/* HEADER FORM */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-foreground">
                                        Transaction Date <span className="text-red-500">*</span>
                                    </label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className={cn("w-full justify-start text-left font-normal border-input", !transDate && "text-muted-foreground")}>
                                                <CalendarIcon className="mr-2 h-4 w-4" /> 
                                                {transDate ? format(transDate, "PPP") : <span>Pick a date</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar mode="single" selected={transDate} onSelect={(d) => d && setTransDate(d)} initialFocus />
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                <div className="space-y-2 relative z-20">
                                    <label className="block text-sm font-medium text-foreground">
                                        Source Fund (Kas/Bank) <span className="text-red-500">*</span>
                                    </label>
                                    <AsyncAccountSelect 
                                        apiEndpoint={`${API_BASE_URL}/master_glaccount.php`}
                                        placeholder="Cari akun kas/bank..."
                                        value={bankName ? bankName.split(" - ")[0] : ""}
                                        displayName={bankName}
                                        filterType="CASH_BANK" 
                                        onChange={(val, name, id) => { 
                                            setBankName(name); 
                                            setBankId(id || null);
                                        }}
                                    />
                                    <p className="text-[10px] text-muted-foreground">Select the source account for this expense</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-foreground">
                                        Request Number
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Auto-generated"
                                        disabled
                                        className="w-full rounded-md border border-input bg-muted px-3 py-2 text-sm opacity-70 cursor-not-allowed"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-foreground">
                                        General Description
                                    </label>
                                    <textarea
                                        rows={3}
                                        placeholder="Explain the purpose of this cash advance/expense"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* DETAIL TABLE (Menggantikan Input Amount Sederhana KODE 1) */}
                        <div className="mt-4 relative z-10">
                            <label className="block text-sm font-medium text-foreground mb-2">
                                Expense Allocation Details <span className="text-red-500">*</span>
                            </label>
                            <div className="rounded-lg border border-input bg-card overflow-visible">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-muted text-muted-foreground font-medium">
                                        <tr>
                                            <th className="px-3 py-2 w-10 text-center">#</th>
                                            <th className="px-3 py-2">Target Account (Biaya/Aset)</th>
                                            <th className="px-3 py-2 hidden md:table-cell">Notes</th>
                                            <th className="px-3 py-2 w-40 text-right">Amount (Rp)</th>
                                            <th className="px-3 py-2 w-10"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {detailAccounts.map((row, index) => (
                                            <tr key={row.id} className="hover:bg-muted/50 transition-colors">
                                                <td className="px-3 py-2 text-center align-top pt-3 text-muted-foreground">{index + 1}</td>
                                                <td className="px-3 py-2 align-top pt-2 relative">
                                                    <AsyncAccountSelect 
                                                        apiEndpoint={`${API_BASE_URL}/master_glaccount.php`}
                                                        placeholder="Cari akun target..."
                                                        value={row.accountNo}
                                                        displayName={row.accountName}
                                                        onChange={(val, name) => { 
                                                            updateRow(row.id, 'accountNo', val); 
                                                            updateRow(row.id, 'accountName', name); 
                                                        }}
                                                    />
                                                </td>
                                                <td className="px-3 py-2 align-top pt-2 hidden md:table-cell">
                                                    <input 
                                                        type="text"
                                                        placeholder="Specific notes..." 
                                                        value={row.detailNotes} 
                                                        onChange={(e) => updateRow(row.id, 'detailNotes', e.target.value)} 
                                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                                    />
                                                </td>
                                                <td className="px-3 py-2 align-top pt-2">
                                                    <input 
                                                        type="number" 
                                                        min={0}
                                                        placeholder="0"
                                                        value={row.amount || ''} 
                                                        onChange={(e) => updateRow(row.id, 'amount', parseFloat(e.target.value))} 
                                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-right focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" 
                                                    />
                                                </td>
                                                <td className="px-3 py-2 align-top pt-3 text-center">
                                                    <button 
                                                        onClick={() => removeRow(row.id)}
                                                        className="p-1 hover:bg-destructive/10 text-destructive rounded transition-colors disabled:opacity-50"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-muted/30 font-medium">
                                        <tr>
                                            <td colSpan={3} className="px-4 py-3 text-right text-muted-foreground">Total Expense:</td>
                                            <td className="px-3 py-3 text-right text-primary">Rp {totalAmount.toLocaleString('id-ID')}</td>
                                            <td></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                            <button
                                onClick={addRow}
                                className="mt-2 text-sm text-primary hover:underline flex items-center gap-1 font-medium"
                            >
                                <Plus className="w-4 h-4" /> Add Allocation Row
                            </button>
                        </div>

                        {/* ACTIONS */}
                        <div className="flex justify-end gap-3 pt-4 border-t border-border">
                            <Button variant="outline">
                                Cancel
                            </Button>
                            <Button onClick={handleSubmit} disabled={saving} className="min-w-[140px]">
                                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                                {saving ? "Processing..." : "Submit Request"}
                            </Button>
                        </div>

                    </div>
                </CardContent>
            </Card>

            {/* List View (Placeholder KODE 1) */}
            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle>Kasbon Requests</CardTitle>
                    <CardDescription>Recent cash advance requests (Mock Data)</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted text-muted-foreground font-medium">
                                <tr>
                                    <th className="px-4 py-3">ID</th>
                                    <th className="px-4 py-3">Employee</th>
                                    <th className="px-4 py-3 hidden md:table-cell">Purpose</th>
                                    <th className="px-4 py-3 text-right">Amount</th>
                                    <th className="px-4 py-3 text-center">Status</th>
                                    <th className="px-4 py-3 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {mockKasbonData.map((item) => (
                                    <tr key={item.id} className="hover:bg-muted/50 transition-colors">
                                        <td className="px-4 py-3 font-medium text-primary">{item.id}</td>
                                        <td className="px-4 py-3 text-foreground">{item.employee}</td>
                                        <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{item.purpose}</td>
                                        <td className="px-4 py-3 text-right font-medium text-foreground">{item.amount}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(item.status)}`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <button className="p-1 hover:bg-muted rounded">
                                                        <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                                                    </button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem><Eye className="w-4 h-4 mr-2" /> View</DropdownMenuItem>
                                                    <DropdownMenuItem><CheckCircle className="w-4 h-4 mr-2" /> Approve</DropdownMenuItem>
                                                    <DropdownMenuItem className="text-destructive"><XCircle className="w-4 h-4 mr-2" /> Reject</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default KasbonPage;