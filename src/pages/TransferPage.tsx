import { useState, useEffect, useRef } from "react";
import { 
  Search, 
  Plus, 
  Filter, 
  Trash2, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Loader2, 
  CalendarIcon, 
  X,
  Check,
  ChevronsUpDown,
  ArrowRight,
  ArrowRightLeft
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

// --- KONFIGURASI API (DARI KODE 2) ---
const API_BASE_URL = "https://technokingindonesia.com/projekmagank/accurate-integration-project";

// --- COMPONENT ASYNC SELECT (REUSED) ---
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

// --- DATA MOCK UI (PLACEHOLDER DARI KODE 1) ---
const mockHistory = [
  { id: "TRF-2024-001", fromAccount: "BCA - 1234567890", toAccount: "Mandiri - 0987654321", amount: "Rp 50.000.000", date: "2024-01-28", description: "Operational fund transfer", status: "Completed" },
  { id: "TRF-2024-002", fromAccount: "Mandiri - 0987654321", toAccount: "BRI - 5432167890", amount: "Rp 25.000.000", date: "2024-01-25", description: "Payroll fund allocation", status: "Completed" },
  { id: "TRF-2024-003", fromAccount: "BCA - 1234567890", toAccount: "BRI - 5432167890", amount: "Rp 100.000.000", date: "2024-01-22", description: "Project fund transfer", status: "Completed" },
];

const bankAccounts = [
  { id: "bca", name: "BCA", number: "1234567890", balance: "Rp 850.000.000" },
  { id: "mandiri", name: "Mandiri", number: "0987654321", balance: "Rp 425.000.000" },
  { id: "bri", name: "BRI", number: "5432167890", balance: "Rp 175.000.000" },
];

// --- MAIN PAGE COMPONENT ---
export function TransferPage() {
    // --- STATE & LOGIC (DARI KODE 2) ---
    const { toast } = useToast();
    const [transDate, setTransDate] = useState<Date>(new Date());
    const [fromBankId, setFromBankId] = useState<number | null>(null);
    const [fromBankName, setFromBankName] = useState("");
    const [toBankId, setToBankId] = useState<number | null>(null);
    const [toBankName, setToBankName] = useState("");
    const [amount, setAmount] = useState(0);
    const [description, setDescription] = useState("");
    const [saving, setSaving] = useState(false);
    
    // UI State
    const [searchTerm, setSearchTerm] = useState("");

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

            const res = await fetch(`${API_BASE_URL}/transaksi_transfer.php`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
            });
            const json = await res.json();

            if (json.s) {
                toast({ title: "Sukses!", description: `Bukti Transfer: ${json.d?.r?.number || 'Tersimpan'}`, className: "bg-green-600 text-white" });
                setAmount(0);
                setDescription("");
            } else {
                throw new Error(JSON.stringify(json.d));
            }
        } catch (e: any) {
            toast({ title: "Gagal", description: e.message, variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6 p-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Transfer Bank</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage inter-bank transfers (Integrated Accurate)
                    </p>
                </div>
                <Button className="btn-gradient flex items-center gap-2 self-start" onClick={() => window.scrollTo({ top: 350, behavior: 'smooth' })}>
                    <Plus className="w-4 h-4" />
                    New Transfer
                </Button>
            </div>

            {/* Bank Account Cards (Visual Dummy KODE 1) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {bankAccounts.map((account) => (
                    <Card key={account.id} className="shadow-sm">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <span className="text-primary font-bold text-sm">{account.name.slice(0, 2)}</span>
                                </div>
                                <div>
                                    <p className="font-medium text-foreground">{account.name}</p>
                                    <p className="text-xs text-muted-foreground">{account.number}</p>
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-foreground">{account.balance}</p>
                            <p className="text-xs text-muted-foreground mt-1">Available Balance</p>
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

            {/* --- FORM TRANSFER --- */}
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
                                        apiEndpoint={`${API_BASE_URL}/master_glaccount.php`}
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
                                        apiEndpoint={`${API_BASE_URL}/master_glaccount.php`}
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

            {/* Transfer History (Placeholder KODE 1) */}
            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle>Transfer History</CardTitle>
                    <CardDescription>All bank transfer records (Mock Data)</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted text-muted-foreground font-medium">
                                <tr>
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
                                {mockHistory.map((item) => (
                                    <tr key={item.id} className="hover:bg-muted/50 transition-colors">
                                        <td className="px-4 py-3 font-medium text-primary">{item.id}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2 text-sm">
                                                <span className="text-muted-foreground">{item.fromAccount.split(" - ")[0]}</span>
                                                <ArrowRight className="w-4 h-4 text-primary" />
                                                <span className="text-foreground font-medium">{item.toAccount.split(" - ")[0]}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{item.description}</td>
                                        <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{item.date}</td>
                                        <td className="px-4 py-3 text-right font-medium text-foreground">{item.amount}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${item.status === "Completed" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
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
                                                    <DropdownMenuItem><Edit className="w-4 h-4 mr-2" /> Edit</DropdownMenuItem>
                                                    <DropdownMenuItem className="text-destructive"><Trash2 className="w-4 h-4 mr-2" /> Delete</DropdownMenuItem>
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
}

export default TransferPage;