import { useState, useEffect, useRef } from "react";
import { 
    Search, 
    Plus, 
    Filter, 
    Trash2, 
    Eye, 
    Loader2, 
    CalendarIcon, 
    X,
    Check,
    ChevronsUpDown,
    ArrowRight,
    ArrowRightLeft,
    RefreshCcw,
    FileText,
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
const ROWS_PER_PAGE = 10; // [UPDATE] Batasan baris per halaman

// --- INTERFACES ---
interface TransferData {
    id: number;
    number: string;
    transDate: string;
    description: string;
    amount: number;
    status: string;
    fromBankName: string;
    toBankName: string;
}

// Interface Detail untuk Modal (Updated: Handle variasi nama field API)
interface TransferDetail extends TransferData {
    fromBank: { no: string; name: string };
    toBank: { no: string; name: string };
    fromBankAmount?: number; // Accurate sering pakai nama ini di detail
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

// --- MAIN PAGE COMPONENT ---
export function TransferPage() {
    const { toast } = useToast();
    
    // State Form
    const [transDate, setTransDate] = useState<Date>(new Date());
    const [fromBankId, setFromBankId] = useState<number | null>(null);
    const [fromBankName, setFromBankName] = useState("");
    const [toBankId, setToBankId] = useState<number | null>(null);
    const [toBankName, setToBankName] = useState("");
    const [amount, setAmount] = useState(0);
    const [description, setDescription] = useState("");
    const [saving, setSaving] = useState(false);
    
    // State List Data Real
    const [transferList, setTransferList] = useState<TransferData[]>([]);
    const [loadingList, setLoadingList] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // State Detail Modal
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [detailData, setDetailData] = useState<TransferDetail | null>(null);
    const [loadingDetail, setLoadingDetail] = useState(false);
    
    // [UPDATE] Pagination State
    const [currentPage, setCurrentPage] = useState(1);


    // Fetch List Transfer
    const fetchTransferList = async (keyword = "") => {
        setLoadingList(true);
        setCurrentPage(1); // Reset page on new fetch/search
        try {
            const url = new URL(`${API_BASE_URL}/Transfer/List.php`);
            if (keyword) url.searchParams.append("q", keyword);
            const res = await fetch(url.toString());
            const json = await res.json();
            if (json.s === true && Array.isArray(json.d)) {
                setTransferList(json.d);
            } else {
                setTransferList([]);
            }
        } catch (error) {
            toast({ title: "Connection Error", description: "Gagal memuat daftar transfer.", variant: "destructive" });
        } finally {
            setLoadingList(false);
        }
    };

    // Fetch Detail Transfer
    const fetchTransferDetail = async (id: number) => {
        setLoadingDetail(true);
        setDetailData(null);
        try {
            const res = await fetch(`${API_BASE_URL}/Transfer/Detail.php?id=${id}`);
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
        fetchTransferList();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => { fetchTransferList(searchTerm); }, 600);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Trigger Fetch Detail
    useEffect(() => {
        if (selectedId) {
            fetchTransferDetail(selectedId);
        }
    }, [selectedId]);

    const handleSubmit = async () => {
        if (!fromBankId || !toBankId) return toast({ title: "Error", description: "Pilih Bank Asal dan Tujuan.", variant: "destructive" });
        if (amount <= 0) return toast({ title: "Error", description: "Masukkan jumlah transfer.", variant: "destructive" });
        if (fromBankId === toBankId) return toast({ title: "Error", description: "Bank Asal dan Tujuan tidak boleh sama.", variant: "destructive" });

        setSaving(true);
        try {
            const payload = {
                transDate: format(transDate, "dd/MM/yyyy"),
                fromBankId,
                toBankId,
                amount,
                description: description || "Transfer Antar Bank"
            };

            const res = await fetch(`${API_BASE_URL}/Transfer/Transaksi.php`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
            });
            const json = await res.json();

            if (json.s) {
                toast({ title: "Sukses!", description: `Bukti Transfer: ${json.d?.r?.number || 'Tersimpan'}`, className: "bg-green-600 text-white" });
                setAmount(0);
                setDescription("");
                fetchTransferList(); // Refresh List
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

    // [UPDATE] Pagination Logic
    const totalPages = Math.ceil(transferList.length / ROWS_PER_PAGE);
    const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
    const paginatedData = transferList.slice(startIndex, startIndex + ROWS_PER_PAGE);

    const goToPage = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
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
                                    Detail Transfer
                                </h3>
                                <p className="text-xs text-gray-500">Rincian pemindahan dana</p>
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
                                            <span className="block text-xs text-gray-500 uppercase tracking-wider">Nominal</span>
                                            {/* FIX: Handle nama field yang bervariasi (amount / fromBankAmount) */}
                                            <span className="block font-bold text-indigo-600 mt-1">
                                                Rp {(detailData.amount || detailData.fromBankAmount || 0).toLocaleString('id-ID')}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="border-t border-b py-6 border-dashed">
                                        <div className="flex items-center justify-between px-4">
                                            <div className="flex-1">
                                                <h4 className="text-xs font-bold text-gray-400 uppercase mb-1">Dari (Sumber)</h4>
                                                <p className="text-gray-900 font-bold text-lg">{detailData.fromBank?.name}</p>
                                                <p className="text-sm text-gray-500 font-mono">{detailData.fromBank?.no}</p>
                                            </div>
                                            <div className="px-6">
                                                <ArrowRight className="w-8 h-8 text-gray-300" />
                                            </div>
                                            <div className="flex-1 text-right">
                                                <h4 className="text-xs font-bold text-gray-400 uppercase mb-1">Ke (Tujuan)</h4>
                                                <p className="text-gray-900 font-bold text-lg">{detailData.toBank?.name}</p>
                                                <p className="text-sm text-gray-500 font-mono">{detailData.toBank?.no}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h4 className="text-sm font-semibold text-gray-500 mb-1">Keterangan</h4>
                                        <p className="text-gray-800 italic text-sm">
                                            {detailData.description || "-"}
                                        </p>
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

            {/* Page Header - UPDATED WITH card-header-gradient */}
            <Card className="shadow-lg border-border">
                <div className="card-header-gradient rounded-b-none p-4 sm:p-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary-foreground">Transfer Bank</h1>
                            <p className="text-primary-foreground/90 mt-1 text-sm">Manage inter-bank transfers (Integrated Accurate)</p>
                        </div>
                        <Button 
                            className="bg-white text-primary hover:bg-white/90 shadow-md flex items-center gap-2 self-start md:self-auto" 
                            onClick={() => window.scrollTo({ top: 350, behavior: 'smooth' })}
                        >
                            <Plus className="w-4 h-4" />
                            New Transfer
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Filters - ASL: AS LIKE ORIGINAL */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search transfers..."
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

            {/* --- FORM TRANSFER - ASL: AS LIKE ORIGINAL --- */}
            <Card className="shadow-sm border-input">
                <CardHeader>
                    <CardTitle>New Bank Transfer</CardTitle>
                    <CardDescription>Transfer funds between accounts</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Left Column: Accounts */}
                            <div className="space-y-4">
                                <div className="space-y-2 relative z-20">
                                    <label className="block text-sm font-medium text-foreground">
                                        Source Account (Dari) <span className="text-red-500">*</span>
                                    </label>
                                    <AsyncAccountSelect 
                                        apiEndpoint={`${API_BASE_URL}/Transfer/MasterGlAccount.php`}
                                        placeholder="Select source bank..."
                                        value={fromBankName} displayName={fromBankName}
                                        filterType="CASH_BANK" 
                                        onChange={(val, name, id) => { setFromBankName(name); setFromBankId(id || null); }}
                                    />
                                    <p className="text-[10px] text-muted-foreground">The account from which funds will be transferred</p>
                                </div>
                                <div className="space-y-2 relative z-10">
                                    <label className="block text-sm font-medium text-foreground">
                                        Destination Account (Ke) <span className="text-red-500">*</span>
                                    </label>
                                    <AsyncAccountSelect 
                                        apiEndpoint={`${API_BASE_URL}/Transfer/MasterGlAccount.php`}
                                        placeholder="Select destination bank..."
                                        value={toBankName} displayName={toBankName}
                                        filterType="CASH_BANK" 
                                        onChange={(val, name, id) => { setToBankName(name); setToBankId(id || null); }}
                                    />
                                    <p className="text-[10px] text-muted-foreground">The account to which funds will be transferred</p>
                                </div>
                            </div>

                            {/* Right Column: Details */}
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-foreground">
                                        Transfer Date <span className="text-red-500">*</span>
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
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-foreground">
                                        Transfer Amount (Rp) <span className="text-red-500">*</span>
                                    </label>
                                    <Input 
                                        type="number" 
                                        className="text-right font-bold"
                                        value={amount || ''} 
                                        onChange={e => setAmount(parseFloat(e.target.value))} 
                                        placeholder="0"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-foreground">
                                        Description
                                    </label>
                                    <Textarea 
                                        value={description} 
                                        onChange={e => setDescription(e.target.value)} 
                                        placeholder="Purpose of the transfer" 
                                        className="resize-none min-h-[80px]"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3 pt-4 border-t border-border">
                            <Button variant="outline">Cancel</Button>
                            <Button onClick={handleSubmit} disabled={saving} className="btn-gradient min-w-[150px]">
                                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRightLeft className="mr-2 h-4 w-4" />}
                                {saving ? "Processing..." : "Process Transfer"}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* List Transfer (Real Data) - UPDATED WITH PAGINATION */}
            <Card className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Transfer History (Live)</CardTitle>
                        <CardDescription>Menampilkan {paginatedData.length} dari {transferList.length} total data.</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => fetchTransferList()} disabled={loadingList}>
                        <RefreshCcw className={cn("w-4 h-4 mr-2", loadingList && "animate-spin")} /> Refresh
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto rounded-lg border">
                        <table className="w-full text-sm text-left table-striped">
                            <thead className="bg-muted text-muted-foreground font-medium">
                                <tr>
                                    {/* Kolom No */}
                                    <th className="px-4 py-3 w-12 text-center">No</th>
                                    <th className="px-4 py-3">Transfer #</th>
                                    <th className="px-4 py-3">From / To</th>
                                    <th className="px-4 py-3 hidden lg:table-cell">Description</th>
                                    <th className="px-4 py-3 hidden md:table-cell">Date</th>
                                    <th className="px-4 py-3 text-right">Amount</th>
                                    <th className="px-4 py-3 text-center">Status</th>
                                    <th className="px-4 py-3 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {loadingList ? (
                                    <tr><td colSpan={8} className="p-8 text-center text-muted-foreground"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2"/>Loading...</td></tr>
                                ) : paginatedData.length === 0 ? (
                                    <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">Tidak ada data ditemukan.</td></tr>
                                ) : (
                                    paginatedData.map((item, idx) => (
                                        <tr key={item.id} className="hover:bg-muted/50 transition-colors">
                                            <td className="px-4 py-3 text-center text-muted-foreground">{startIndex + idx + 1}</td>
                                            <td className="px-4 py-3 font-medium text-primary">{item.number}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <span className="text-muted-foreground truncate max-w-[100px]" title={item.fromBankName}>{item.fromBankName}</span>
                                                    <ArrowRight className="w-4 h-4 text-primary shrink-0" />
                                                    <span className="text-foreground font-medium truncate max-w-[100px]" title={item.toBankName}>{item.toBankName}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell truncate max-w-xs">{item.description}</td>
                                            <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{item.transDate}</td>
                                            <td className="px-4 py-3 text-right font-medium text-foreground">{item.amount.toLocaleString('id-ID')}</td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(item.status)}`}>
                                                    {item.status}
                                                </span>
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

                    {/* Pagination Footer */}
                    {transferList.length > ROWS_PER_PAGE && (
                        <div className="flex items-center justify-between px-4 py-3 border-t mt-4">
                            <div className="text-sm text-muted-foreground">
                                Page {currentPage} of {totalPages}
                            </div>
                            <div className="space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => goToPage(currentPage - 1)}
                                    disabled={currentPage === 1 || loadingList}
                                >
                                    <ChevronLeft className="w-4 h-4" /> Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => goToPage(currentPage + 1)}
                                    disabled={currentPage === totalPages || loadingList}
                                >
                                    Next <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default TransferPage;