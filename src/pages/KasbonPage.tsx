import { useState, useEffect, useRef } from "react";
import { 
  Search, 
  Plus, 
  Filter, 
  Trash2, 
  Eye, // Icon View
  Loader2, 
  CalendarIcon, 
  X,
  Check,
  ChevronsUpDown,
  Send,
  RefreshCcw,
  FileText, // Icon Detail Modal
  AlignLeft
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar"; 
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

// --- KONFIGURASI API ---
const API_BASE_URL = "https://vexacreative.net/projekmagank/accurate-integration-project/Api";

// --- TIPE DATA ---
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

// Interface Data List Real
interface KasbonData {
    id: number;
    number: string;
    transDate: string;
    description: string;
    amount: number;
    status: string;
}

// [BARU] Interface Detail untuk Modal
interface KasbonDetail extends KasbonData {
    bank: { no: string; name: string }; // Akun Sumber
    detailAccount: {
        account: { no: string; name: string };
        amount: number;
        detailNotes: string;
    }[];
}

// --- COMPONENT ASYNC SELECT ---
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

// --- MAIN PAGE COMPONENT ---
export function KasbonPage() {
    const { toast } = useToast();
    const [transDate, setTransDate] = useState<Date>(new Date());
    
    // State Header Form
    const [bankId, setBankId] = useState<number | null>(null);
    const [bankName, setBankName] = useState("");
    const [description, setDescription] = useState("");
    const [saving, setSaving] = useState(false);
    
    // State Detail Form (Multi-row)
    const [detailAccounts, setDetailAccounts] = useState<DetailAccount[]>([
        { id: 'row_1', accountNo: '', accountName: '', amount: 0, detailNotes: '' },
    ]);

    // State List Data Real
    const [kasbonList, setKasbonList] = useState<KasbonData[]>([]);
    const [loadingList, setLoadingList] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // [BARU] State Detail Modal
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [detailData, setDetailData] = useState<KasbonDetail | null>(null);
    const [loadingDetail, setLoadingDetail] = useState(false);

    // Fetch List Kasbon
    const fetchKasbonList = async (keyword = "") => {
        setLoadingList(true);
        try {
            const url = new URL(`${API_BASE_URL}/Kasbon/List.php`);
            if (keyword) url.searchParams.append("q", keyword);
            const res = await fetch(url.toString());
            const json = await res.json();
            if (json.s === true && Array.isArray(json.d)) {
                setKasbonList(json.d);
            } else {
                setKasbonList([]);
            }
        } catch (error) {
            console.error("Error fetching list:", error);
            toast({ title: "Connection Error", description: "Gagal memuat daftar kasbon.", variant: "destructive" });
        } finally {
            setLoadingList(false);
        }
    };

    // [BARU] Fetch Detail Kasbon
    const fetchKasbonDetail = async (id: number) => {
        setLoadingDetail(true);
        setDetailData(null);
        try {
            const res = await fetch(`${API_BASE_URL}/Kasbon/Detail.php?id=${id}`);
            const json = await res.json();
            if (json.s === true) {
                setDetailData(json.d);
            } else {
                toast({ title: "Gagal", description: "Gagal memuat detail.", variant: "destructive" });
                setSelectedId(null);
            }
        } catch (error) {
            toast({ title: "Error", description: "Terjadi kesalahan koneksi.", variant: "destructive" });
        } finally {
            setLoadingDetail(false);
        }
    };

    // Initial Load & Search
    useEffect(() => {
        fetchKasbonList();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => { fetchKasbonList(searchTerm); }, 600);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Trigger Fetch Detail
    useEffect(() => {
        if (selectedId) {
            fetchKasbonDetail(selectedId);
        }
    }, [selectedId]);

    // Logic Baris Form
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

    // Submit Handler
    const handleSubmit = async () => {
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

            const res = await fetch(`${API_BASE_URL}/Kasbon/Transaksi.php`, {
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
                
                setDetailAccounts([{ id: `row_${Date.now()}`, accountNo: '', accountName: '', amount: 0, detailNotes: '' }]);
                setDescription("");
                fetchKasbonList();
            } else {
                const errorMsg = json.d?.message || (Array.isArray(json.d) ? json.d.join(", ") : "Terjadi kesalahan sistem.");
                throw new Error(errorMsg);
            }
        } catch (e: any) {
            toast({ title: "Gagal Menyimpan", description: e.message, variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const s = (status || "").toUpperCase();
        if (s === "APPROVED") return "bg-green-100 text-green-700";
        if (s === "REJECTED") return "bg-red-100 text-red-700";
        return "bg-yellow-100 text-yellow-700"; // Pending/Draft
    };

    return (
        <div className="space-y-6 p-6 relative">
            
            {/* --- MODAL DETAIL (OVERLAY) --- */}
            {selectedId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                        
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
                            <div>
                                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-primary" /> 
                                    Detail Pembayaran
                                </h3>
                                <p className="text-xs text-gray-500">Rincian transaksi pengeluaran</p>
                            </div>
                            <button onClick={() => setSelectedId(null)} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
                                <X className="w-6 h-6 text-gray-500" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 overflow-y-auto flex-1">
                            {loadingDetail ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
                                    <p className="text-sm text-gray-500">Mengambil data dari Accurate...</p>
                                </div>
                            ) : detailData ? (
                                <div className="space-y-6">
                                    
                                    {/* Info Utama Grid */}
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                                        <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-lg">
                                            <span className="block text-xs text-blue-600 font-semibold uppercase tracking-wider">No Transaksi</span>
                                            <span className="block text-lg font-bold text-gray-900 mt-1">{detailData.number}</span>
                                        </div>
                                        <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg">
                                            <span className="block text-xs text-gray-500 uppercase tracking-wider">Tanggal</span>
                                            <span className="block font-medium text-gray-900 mt-1">{detailData.transDate}</span>
                                        </div>
                                        <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg">
                                            <span className="block text-xs text-gray-500 uppercase tracking-wider">Total</span>
                                            <span className="block font-bold text-red-600 mt-1">Rp {detailData.amount.toLocaleString('id-ID')}</span>
                                        </div>
                                    </div>

                                    <div className="border-t border-b py-4 border-dashed">
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div>
                                                <h4 className="text-sm font-semibold text-gray-500 mb-1">Sumber Dana (Kas/Bank)</h4>
                                                <p className="text-gray-900 font-medium">{detailData.bank?.name}</p>
                                                <p className="text-xs text-gray-400 font-mono">{detailData.bank?.no}</p>
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-semibold text-gray-500 mb-1">Keterangan</h4>
                                                <p className="text-gray-900 italic text-sm bg-gray-50 p-2 rounded border border-gray-100">
                                                    {detailData.description || "-"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Tabel Rincian Biaya */}
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                                            <AlignLeft className="w-4 h-4 text-orange-600"/> Alokasi Biaya
                                        </h4>
                                        <div className="border rounded-lg overflow-hidden shadow-sm">
                                            <table className="w-full text-sm">
                                                <thead className="bg-gray-100/80 text-gray-600 font-medium border-b">
                                                    <tr>
                                                        <th className="px-4 py-2 text-left w-10">#</th>
                                                        <th className="px-4 py-2 text-left">Akun Biaya</th>
                                                        <th className="px-4 py-2 text-left">Catatan</th>
                                                        <th className="px-4 py-2 text-right w-32">Jumlah</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y bg-white">
                                                    {detailData.detailAccount?.map((item: any, idx: number) => (
                                                        <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                                            <td className="px-4 py-2 text-gray-500 text-center">{idx + 1}</td>
                                                            <td className="px-4 py-2 font-medium text-gray-800">
                                                                {item.account?.name}
                                                                <span className="block text-xs text-gray-400 mt-0.5">{item.account?.no}</span>
                                                            </td>
                                                            <td className="px-4 py-2 text-gray-600 italic">{item.detailNotes || "-"}</td>
                                                            <td className="px-4 py-2 text-right font-bold text-gray-900">
                                                                {item.amount.toLocaleString('id-ID')}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                </div>
                            ) : (
                                <div className="text-center py-10 text-muted-foreground bg-gray-50 rounded-lg border border-dashed">
                                    Data detail tidak ditemukan.
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 border-t bg-gray-50 flex justify-end">
                            <Button onClick={() => setSelectedId(null)} variant="outline">Tutup</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Page Header */}
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

            {/* Filters */}
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
                    <Filter className="w-4 h-4" /> Filter
                </Button>
            </div>

            {/* FORM CARD */}
            <Card className="shadow-sm border-input">
                <CardHeader>
                    <CardTitle>New Kasbon / Expense Request</CardTitle>
                    <CardDescription>Submit a cash advance or expense recording</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        
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
                                        apiEndpoint={`${API_BASE_URL}/Kasbon/MasterGlAccount.php`}
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
                                    <input type="text" placeholder="Auto-generated" disabled className="w-full rounded-md border border-input bg-muted px-3 py-2 text-sm opacity-70 cursor-not-allowed" />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-foreground">
                                        General Description
                                    </label>
                                    <textarea rows={3} placeholder="Explain the purpose of this cash advance/expense" value={description} onChange={(e) => setDescription(e.target.value)} className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none" />
                                </div>
                            </div>
                        </div>

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
                                                        apiEndpoint={`${API_BASE_URL}/Kasbon/MasterGlAccount.php`}
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
                                                    <input type="text" placeholder="Specific notes..." value={row.detailNotes} onChange={(e) => updateRow(row.id, 'detailNotes', e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                                                </td>
                                                <td className="px-3 py-2 align-top pt-2">
                                                    <input type="number" min={0} placeholder="0" value={row.amount || ''} onChange={(e) => updateRow(row.id, 'amount', parseFloat(e.target.value))} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-right focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                                                </td>
                                                <td className="px-3 py-2 align-top pt-3 text-center">
                                                    <button onClick={() => removeRow(row.id)} className="p-1 hover:bg-destructive/10 text-destructive rounded transition-colors disabled:opacity-50">
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
                            <button onClick={addRow} className="mt-2 text-sm text-primary hover:underline flex items-center gap-1 font-medium">
                                <Plus className="w-4 h-4" /> Add Allocation Row
                            </button>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-border">
                            <Button variant="outline">Cancel</Button>
                            <Button onClick={handleSubmit} disabled={saving} className="min-w-[140px]">
                                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                                {saving ? "Processing..." : "Submit Request"}
                            </Button>
                        </div>

                    </div>
                </CardContent>
            </Card>

            {/* [BARU] List View (REAL DATA) */}
            <Card className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Kasbon Requests (Live)</CardTitle>
                        <CardDescription>50 Data Terbaru dari Accurate</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => fetchKasbonList()} disabled={loadingList}>
                        <RefreshCcw className={cn("w-4 h-4 mr-2", loadingList && "animate-spin")} /> Refresh
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto rounded-lg border">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted text-muted-foreground font-medium">
                                <tr>
                                    {/* [BARU] Kolom No */}
                                    <th className="px-4 py-3 w-12 text-center">No</th>
                                    <th className="px-4 py-3">No. Transaksi</th>
                                    <th className="px-4 py-3">Tanggal</th>
                                    <th className="px-4 py-3 hidden md:table-cell">Keterangan</th>
                                    <th className="px-4 py-3 text-right">Total Amount</th>
                                    <th className="px-4 py-3 text-center">Status</th>
                                    <th className="px-4 py-3 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {loadingList ? (
                                    <tr><td colSpan={7} className="p-8 text-center text-muted-foreground"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2"/>Loading...</td></tr>
                                ) : kasbonList.length === 0 ? (
                                    <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Tidak ada data ditemukan.</td></tr>
                                ) : (
                                    kasbonList.map((item, idx) => (
                                        <tr key={item.id} className="hover:bg-muted/50 transition-colors">
                                            {/* Nomor Urut */}
                                            <td className="px-4 py-3 text-center text-muted-foreground">{idx + 1}</td>
                                            <td className="px-4 py-3 font-medium text-primary">{item.number}</td>
                                            <td className="px-4 py-3 text-foreground">{item.transDate}</td>
                                            <td className="px-4 py-3 text-muted-foreground hidden md:table-cell truncate max-w-xs">{item.description}</td>
                                            <td className="px-4 py-3 text-right font-medium text-foreground">{item.amount.toLocaleString('id-ID')}</td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(item.status)}`}>
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                {/* [BARU] Tombol View Detail (Icon Mata Saja) */}
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    onClick={() => setSelectedId(item.id)} 
                                                    className="h-8 w-8 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                                                    title="Lihat Detail"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default KasbonPage;