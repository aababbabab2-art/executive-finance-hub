import { useState, useEffect, useRef } from "react";
import { 
  Search, 
  Plus, 
  Filter, 
  Trash2, 
  Eye, // Icon View Detail
  Loader2, 
  CalendarIcon, 
  X,
  Check,
  ChevronsUpDown,
  Download,
  RefreshCcw,
  FileText // Icon Detail Modal
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

// --- KONFIGURASI API ---
const API_BASE_URL = "https://vexacreative.net/projekmagank/accurate-integration-project/Api";

// --- INTERFACES ---
interface ReceiptData {
    id: number;
    number: string;
    transDate: string;
    description: string;
    amount: number;
    status: string;
}

// Interface Detail untuk Modal
interface ReceiptDetail extends ReceiptData {
    bank: { no: string; name: string }; // Akun Penampung
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
    filterType?: string; 
    apiEndpoint: string;
}

const AsyncAccountSelect: React.FC<AsyncSelectProps> = ({ 
    value, displayName, onChange, placeholder, filterType, apiEndpoint 
}) => {
    const [query, setQuery] = useState("");
    const [options, setOptions] = useState<any[]>([]);
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
            if (data.s) setOptions(data.d);
            else setOptions([]);
        } catch (e) { setOptions([]); } 
        finally { setLoading(false); }
    };

    useEffect(() => {
        const timer = setTimeout(() => { if (isOpen) fetchAccounts(query); }, 500);
        return () => clearTimeout(timer);
    }, [query, isOpen]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) setIsOpen(false);
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    if (value && !isOpen) {
        return (
            <div className="relative flex items-center w-full">
                <div 
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm cursor-pointer hover:bg-muted/50" 
                    onClick={() => { setIsOpen(true); setQuery(""); }}
                >
                    <span className="truncate font-medium text-foreground">{displayName || value}</span>
                    <ChevronsUpDown className="h-4 w-4 text-muted-foreground opacity-50" />
                </div>
                <button type="button" onClick={(e) => { e.stopPropagation(); onChange("", "", 0); }} className="absolute right-8 p-1 hover:text-destructive">
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
                    onFocus={() => { setIsOpen(true); if(!options.length) fetchAccounts(""); }}
                />
                {loading && <Loader2 className="absolute right-2.5 top-3 h-4 w-4 animate-spin text-primary" />}
            </div>
            {isOpen && (
                <div className="absolute top-full left-0 z-[50] mt-1 w-full max-h-[250px] overflow-y-auto rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95">
                    {options.length === 0 && !loading ? (
                        <div className="px-2 py-3 text-sm text-center text-muted-foreground italic">Tidak ditemukan</div>
                    ) : (
                        options.map((opt, i) => (
                            <div 
                                key={i} 
                                className="cursor-pointer py-2 px-3 hover:bg-accent hover:text-accent-foreground border-b border-border/50 last:border-0 flex flex-col" 
                                onClick={() => { onChange(opt.no, `${opt.no} - ${opt.name}`, opt.id); setIsOpen(false); }}
                            >
                                <div className="font-medium text-sm">{opt.no} - {opt.name}</div>
                                <div className="text-[10px] text-muted-foreground">{opt.accountType}</div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

// --- DATA MOCK SUMMARY ---
const summaryMetrics = [
    { title: "Total This Month", value: "Rp 52.950.000", color: "text-foreground" },
    { title: "Bank Interest", value: "Rp 1.250.000", color: "text-blue-600" },
    { title: "Other Income", value: "Rp 36.700.000", color: "text-green-600" },
];

// --- MAIN PAGE COMPONENT ---
export function PenerimaanPage() {
    const { toast } = useToast();
    
    // State Form
    const [transDate, setTransDate] = useState<Date>(new Date());
    const [bankId, setBankId] = useState<number | null>(null);
    const [bankName, setBankName] = useState("");
    const [description, setDescription] = useState("");
    const [saving, setSaving] = useState(false);
    const [details, setDetails] = useState([{ id: '1', accountNo: '', accountName: '', amount: 0, notes: '' }]);

    // State List Data Real
    const [receiptList, setReceiptList] = useState<ReceiptData[]>([]);
    const [loadingList, setLoadingList] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // [BARU] State Detail Modal
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [detailData, setDetailData] = useState<ReceiptDetail | null>(null);
    const [loadingDetail, setLoadingDetail] = useState(false);

    // [BARU] Fetch List Penerimaan
    const fetchReceiptList = async (keyword = "") => {
        setLoadingList(true);
        try {
            const url = new URL(`${API_BASE_URL}/Penerimaan/List.php`);
            if (keyword) url.searchParams.append("q", keyword);
            const res = await fetch(url.toString());
            const json = await res.json();
            if (json.s === true && Array.isArray(json.d)) {
                setReceiptList(json.d);
            } else {
                setReceiptList([]);
            }
        } catch (error) {
            toast({ title: "Connection Error", description: "Gagal memuat daftar penerimaan.", variant: "destructive" });
        } finally {
            setLoadingList(false);
        }
    };

    // [BARU] Fetch Detail Penerimaan
    const fetchReceiptDetail = async (id: number) => {
        setLoadingDetail(true);
        setDetailData(null);
        try {
            const res = await fetch(`${API_BASE_URL}/Penerimaan/Detail.php?id=${id}`);
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
        fetchReceiptList();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => { fetchReceiptList(searchTerm); }, 600);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Trigger Fetch Detail
    useEffect(() => {
        if (selectedId) {
            fetchReceiptDetail(selectedId);
        }
    }, [selectedId]);

    // Logic Form
    const updateDetail = (id: string, field: string, val: any) => {
        setDetails(prev => prev.map(r => r.id === id ? { ...r, [field]: val } : r));
    };

    const addRow = () => {
        setDetails([...details, { id: Date.now().toString(), accountNo: '', accountName: '', amount: 0, notes: '' }]);
    };

    const removeRow = (id: string) => {
        if(details.length > 1) {
            setDetails(details.filter(d => d.id !== id));
        }
    };

    const totalAmount = details.reduce((sum, item) => sum + (item.amount || 0), 0);

    const handleSubmit = async () => {
        if (!bankId) return toast({ title: "Error", description: "Pilih Akun Bank Penerima.", variant: "destructive" });
        if (details.some(d => !d.accountNo || d.amount <= 0)) return toast({ title: "Error", description: "Lengkapi sumber pendapatan.", variant: "destructive" });

        setSaving(true);
        try {
            const payload = {
                transDate: format(transDate, "dd/MM/yyyy"),
                bankId,
                description: description || "Penerimaan Lain",
                detailAccount: details.map(d => ({ accountNo: d.accountNo, amount: d.amount, detailNotes: d.notes }))
            };

            const res = await fetch(`${API_BASE_URL}/Penerimaan/Transaksi.php`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
            });
            const json = await res.json();

            if (json.s) {
                const number = json.d?.r?.number || 'Tersimpan';
                toast({ title: "Sukses!", description: `No Bukti: ${number}`, className: "bg-green-600 text-white" });
                setDetails([{ id: Date.now().toString(), accountNo: '', accountName: '', amount: 0, notes: '' }]);
                setDescription("");
                fetchReceiptList(); // Refresh List
            } else {
                throw new Error(JSON.stringify(json.d));
            }
        } catch (e: any) {
            toast({ title: "Gagal", description: e.message, variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const s = (status || "").toUpperCase();
        if (s === "APPROVED") return "bg-green-100 text-green-700";
        if (s === "REJECTED") return "bg-red-100 text-red-700";
        return "bg-yellow-100 text-yellow-700"; 
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
                                    Detail Penerimaan
                                </h3>
                                <p className="text-xs text-gray-500">Rincian transaksi penerimaan</p>
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
                                            <span className="block font-bold text-green-600 mt-1">Rp {detailData.amount.toLocaleString('id-ID')}</span>
                                        </div>
                                    </div>

                                    <div className="border-t border-b py-4 border-dashed">
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div>
                                                <h4 className="text-sm font-semibold text-gray-500 mb-1">Masuk ke Bank</h4>
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

                                    {/* Tabel Rincian Akun */}
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                                            <Check className="w-4 h-4 text-green-600"/> Rincian Akun Pendapatan
                                        </h4>
                                        <div className="border rounded-lg overflow-hidden shadow-sm">
                                            <table className="w-full text-sm">
                                                <thead className="bg-gray-100/80 text-gray-600 font-medium border-b">
                                                    <tr>
                                                        <th className="px-4 py-2 text-left w-10">#</th>
                                                        <th className="px-4 py-2 text-left">Akun Pendapatan</th>
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
                    <h1 className="text-2xl font-bold text-foreground">Penerimaan Lain</h1>
                    <p className="text-muted-foreground mt-1">
                        Record other income and receipts (Non-Sales)
                    </p>
                </div>
                <Button className="btn-gradient flex items-center gap-2 self-start" onClick={() => window.scrollTo({ top: 350, behavior: 'smooth' })}>
                    <Plus className="w-4 h-4" /> New Receipt
                </Button>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {summaryMetrics.map((metric, idx) => (
                    <Card key={idx} className="shadow-sm">
                        <CardContent className="p-4">
                            <p className="text-sm text-muted-foreground">{metric.title}</p>
                            <p className={`text-2xl font-bold mt-1 ${metric.color}`}>{metric.value}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search receipts..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                </div>
                <Button variant="outline" className="flex items-center gap-2">
                    <Filter className="w-4 h-4" /> Filter
                </Button>
            </div>

            {/* --- FORM RECORD RECEIPT --- */}
            <Card className="shadow-sm border-input">
                <CardHeader>
                    <CardTitle>Record New Receipt</CardTitle>
                    <CardDescription>Enter receipt details (Integrated Accurate)</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {/* Header Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="space-y-2 relative z-20">
                                    <label className="block text-sm font-medium text-foreground">
                                        Deposit To Account (Bank/Kas) <span className="text-red-500">*</span>
                                    </label>
                                    <AsyncAccountSelect 
                                        apiEndpoint={`${API_BASE_URL}/Penerimaan/MasterGlAccount.php`}
                                        placeholder="Select deposit account..."
                                        value={bankName} displayName={bankName}
                                        filterType="CASH_BANK" 
                                        onChange={(val, name, id) => { setBankName(name); setBankId(id || null); }}
                                    />
                                    <p className="text-[10px] text-muted-foreground">The account receiving the funds</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-foreground">
                                        Receipt Date <span className="text-red-500">*</span>
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
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-foreground">Receipt Number</label>
                                    <input type="text" placeholder="Auto-generated" disabled className="w-full rounded-md border border-input bg-muted px-3 py-2 text-sm cursor-not-allowed opacity-70" />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-foreground">Description</label>
                                    <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="General description e.g., Interest Income" className="resize-none min-h-[80px]" />
                                </div>
                            </div>
                        </div>

                        {/* Income Source Details Table */}
                        <div className="mt-4 relative z-10">
                            <label className="block text-sm font-medium text-foreground mb-2">
                                Income Sources Details <span className="text-red-500">*</span>
                            </label>
                            <div className="rounded-lg border border-input bg-card overflow-visible">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-muted text-muted-foreground font-medium">
                                        <tr>
                                            <th className="px-3 py-2 w-10 text-center">#</th>
                                            <th className="px-3 py-2">Income Account</th>
                                            <th className="px-3 py-2 hidden md:table-cell">Notes</th>
                                            <th className="px-3 py-2 w-40 text-right">Amount (Rp)</th>
                                            <th className="px-3 py-2 w-10"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {details.map((row, index) => (
                                            <tr key={row.id} className="hover:bg-muted/50 transition-colors">
                                                <td className="px-3 py-2 text-center align-top pt-3 text-muted-foreground">{index + 1}</td>
                                                <td className="px-3 py-2 align-top pt-2 relative">
                                                    <AsyncAccountSelect 
                                                        apiEndpoint={`${API_BASE_URL}/Penerimaan/MasterGlAccount.php`}
                                                        placeholder="Select income account..."
                                                        value={row.accountNo} displayName={row.accountName}
                                                        onChange={(val, name) => { updateDetail(row.id, 'accountNo', val); updateDetail(row.id, 'accountName', name); }}
                                                    />
                                                </td>
                                                <td className="px-3 py-2 align-top pt-2 hidden md:table-cell">
                                                    <Input value={row.notes} onChange={e => updateDetail(row.id, 'notes', e.target.value)} placeholder="Line note..." />
                                                </td>
                                                <td className="px-3 py-2 align-top pt-2">
                                                    <Input type="number" className="text-right font-medium" value={row.amount || ''} onChange={e => updateDetail(row.id, 'amount', parseFloat(e.target.value))} />
                                                </td>
                                                <td className="px-3 py-2 align-top pt-3 text-center">
                                                    <button onClick={() => removeRow(row.id)} className="p-1 hover:bg-destructive/10 text-destructive rounded transition-colors disabled:opacity-50" disabled={details.length <= 1}>
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-muted/30 font-medium">
                                        <tr>
                                            <td colSpan={3} className="px-4 py-3 text-right text-muted-foreground">Total Receipt:</td>
                                            <td className="px-3 py-3 text-right text-primary font-bold">Rp {totalAmount.toLocaleString('id-ID')}</td>
                                            <td></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                            <button onClick={addRow} className="mt-2 text-sm text-primary hover:underline flex items-center gap-1 font-medium">
                                <Plus className="w-4 h-4" /> Add Income Line
                            </button>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3 pt-4 border-t border-border">
                            <Button variant="outline">Cancel</Button>
                            <Button onClick={handleSubmit} disabled={saving} className="min-w-[140px]">
                                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                                {saving ? "Processing..." : "Save Receipt"}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* List Receipt (Real Data) */}
            <Card className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Receipt History (Live)</CardTitle>
                        <CardDescription>50 data terbaru dari Accurate</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => fetchReceiptList()} disabled={loadingList}>
                        <RefreshCcw className={cn("w-4 h-4 mr-2", loadingList && "animate-spin")} /> Refresh
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted text-muted-foreground font-medium">
                                <tr>
                                    <th className="px-4 py-3 w-12 text-center">No</th>
                                    <th className="px-4 py-3">Receipt #</th>
                                    <th className="px-4 py-3">Date</th>
                                    <th className="px-4 py-3">Description</th>
                                    <th className="px-4 py-3 text-right">Amount</th>
                                    <th className="px-4 py-3 text-center">Status</th>
                                    <th className="px-4 py-3 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {loadingList ? (
                                    <tr><td colSpan={7} className="p-8 text-center text-muted-foreground"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2"/>Loading...</td></tr>
                                ) : receiptList.length === 0 ? (
                                    <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Tidak ada data ditemukan.</td></tr>
                                ) : (
                                    receiptList.map((item, idx) => (
                                        <tr key={item.id} className="hover:bg-muted/50 transition-colors">
                                            <td className="px-4 py-3 text-center text-muted-foreground">{idx + 1}</td>
                                            <td className="px-4 py-3 font-medium text-primary">{item.number}</td>
                                            <td className="px-4 py-3 text-muted-foreground">{item.transDate}</td>
                                            <td className="px-4 py-3 text-foreground">{item.description}</td>
                                            <td className="px-4 py-3 text-right font-medium text-green-600">{item.amount.toLocaleString('id-ID')}</td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={cn("px-2 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700")}>{item.status}</span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
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

export default PenerimaanPage;