import { useState, useEffect, useRef } from "react";
import { 
  Search, 
  Plus, 
  Filter, 
  Trash2, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  CheckCircle, 
  Loader2, 
  CalendarIcon, 
  X,
  Check,
  ChevronsUpDown,
  Wallet
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
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

// --- KONFIGURASI API (DARI KODE 2) ---
const API_BASE_URL = "https://technokingindonesia.com/projekmagank/accurate-integration-project";

// --- COMPONENT ASYNC SELECT (REUSABLE UI KODE 1 STYLE) ---
interface AsyncSelectProps {
    value: string;
    displayName?: string;
    onChange: (val: string, name: string, id?: number) => void;
    placeholder: string;
    filterType?: string; 
    apiEndpoint: string;
}

const AsyncSelect: React.FC<AsyncSelectProps> = ({ value, displayName, onChange, placeholder, filterType, apiEndpoint }) => {
    const [query, setQuery] = useState("");
    const [options, setOptions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const fetchOptions = async (q: string) => {
        setLoading(true);
        try {
            const url = new URL(apiEndpoint);
            if(q) url.searchParams.append("q", q);
            if(filterType) url.searchParams.append("type", filterType);
            
            const res = await fetch(url.toString());
            const json = await res.json();
            if(json.s) setOptions(json.d);
            else setOptions([]);
        } catch(e) {
            setOptions([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const t = setTimeout(() => { if(isOpen) fetchOptions(query); }, 400);
        return () => clearTimeout(t);
    }, [query, isOpen]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) setIsOpen(false);
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    if (value && !isOpen) return (
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

    return (
        <div className="relative w-full" ref={wrapperRef}>
            <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input 
                    className="flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-8 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" 
                    placeholder={placeholder} 
                    value={query} 
                    onChange={e => setQuery(e.target.value)} 
                    onFocus={() => setIsOpen(true)}
                />
                {loading && <Loader2 className="absolute right-2.5 top-3 h-4 w-4 animate-spin text-primary" />}
            </div>
            {isOpen && (
                <div className="absolute top-full left-0 z-[50] mt-1 w-full max-h-[250px] overflow-y-auto rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95">
                    {options.length === 0 && !loading ? (
                        <div className="px-2 py-3 text-sm text-center text-muted-foreground italic">Tidak ditemukan</div>
                    ) : (
                        options.map((opt, i) => (
                            <div key={i} className="cursor-pointer py-2 px-3 hover:bg-accent hover:text-accent-foreground border-b border-border/50 last:border-0 flex items-center" 
                                onClick={() => { onChange(opt.no || opt.customerNo, opt.label || opt.name, opt.id); setIsOpen(false); }}>
                                <Check className={cn("mr-2 h-4 w-4 opacity-0")} /> 
                                <div className="flex flex-col">
                                    <span className="font-medium text-sm">{opt.label || `${opt.customerNo} - ${opt.name}`}</span>
                                    {opt.accountType && <span className="text-[10px] text-muted-foreground">{opt.accountType}</span>}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

// --- DATA MOCK HISTORI (DARI KODE 1 - VISUAL ONLY) ---
const mockHistory = [
  { id: "PEL-2024-001", customer: "PT Maju Jaya", invoiceNo: "INV-2024-0001", paidAmount: "Rp 49.950.000", status: "Complete" },
  { id: "PEL-2024-002", customer: "CV Sukses Mandiri", invoiceNo: "INV-2024-0002", paidAmount: "Rp 20.000.000", status: "Partial" },
  { id: "PEL-2024-003", customer: "PT Sentosa Abadi", invoiceNo: "INV-2024-0003", paidAmount: "Rp 86.580.000", status: "Complete" },
];

interface Invoice {
    id: number;
    number: string;
    date: string;
    amount: number;
    outstanding: number;
    payAmount: number; 
}

export function PelunasanPage() {
    // --- STATE & LOGIC (DARI KODE 2) ---
    const { toast } = useToast();
    const [transDate, setTransDate] = useState<Date>(new Date());
    const [customerNo, setCustomerNo] = useState("");
    const [customerName, setCustomerName] = useState("");
    const [bankId, setBankId] = useState<number | null>(null);
    const [bankName, setBankName] = useState("");
    const [description, setDescription] = useState("");
    
    // State Data
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [searchInv, setSearchInv] = useState(""); 
    const [debouncedSearch, setDebouncedSearch] = useState(""); 
    const [loadingInv, setLoadingInv] = useState(false);
    const [saving, setSaving] = useState(false);

    // 1. Debounce Search
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchInv);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchInv]);

    // 2. Fetch Invoice Data
    useEffect(() => {
        if (!customerNo) { setInvoices([]); return; }
        
        setLoadingInv(true);
        let url = `${API_BASE_URL}/master_invoice.php?customerNo=${customerNo}`;
        if (debouncedSearch) {
            url += `&q=${debouncedSearch}`;
        }

        fetch(url)
            .then(res => res.json())
            .then(json => {
                if (json.s) {
                    setInvoices(json.d.map((inv: any) => ({ ...inv, payAmount: 0 })));
                } else {
                    setInvoices([]);
                }
            })
            .catch(() => setInvoices([]))
            .finally(() => setLoadingInv(false));
            
    }, [customerNo, debouncedSearch]);

    // Helper Functions
    const handlePayAll = (id: number) => {
        setInvoices(prev => prev.map(inv => 
            inv.id === id ? { ...inv, payAmount: inv.outstanding } : inv
        ));
    };

    const handleAmountChange = (id: number, val: number) => {
        setInvoices(prev => prev.map(inv => 
            inv.id === id ? { ...inv, payAmount: val } : inv
        ));
    };

    const totalOutstanding = invoices.reduce((sum, inv) => sum + (inv.outstanding || 0), 0);
    const totalBayar = invoices.reduce((sum, inv) => sum + (inv.payAmount || 0), 0);

    const handleSubmit = async () => {
        if (!customerNo || !bankId) return toast({ title: "Error", description: "Lengkapi data Customer & Bank.", variant: "destructive" });
        if (totalBayar <= 0) return toast({ title: "Error", description: "Belum ada nominal pembayaran.", variant: "destructive" });

        setSaving(true);
        try {
            const payload = {
                transDate: format(transDate, "dd/MM/yyyy"),
                customerNo,
                bankId,
                branchId: 50,
                description,
                invoices: invoices.filter(inv => inv.payAmount > 0).map(inv => ({ invoiceId: inv.id, payAmount: inv.payAmount }))
            };

            const res = await fetch(`${API_BASE_URL}/transaksi_pelunasan.php`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
            });
            const json = await res.json();

            if (json.s) {
                toast({ title: "Sukses!", description: `Bukti: ${json.d?.r?.number || json.r?.number}`, className: "bg-green-600 text-white" });
                setInvoices(prev => prev.map(i => ({...i, payAmount: 0}))); 
                setDescription(""); 
            } else {
                throw new Error(Array.isArray(json.d) ? json.d.join(", ") : JSON.stringify(json.d));
            }
        } catch (e: any) {
            toast({ title: "Gagal", description: e.message, variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "Complete": return "bg-green-100 text-green-700";
            case "Partial": return "bg-yellow-100 text-yellow-700";
            default: return "bg-gray-100 text-gray-700";
        }
    };

    return (
        <div className="space-y-6 p-6">
            {/* Page Header (KODE 1) */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Pelunasan Piutang</h1>
                    <p className="text-muted-foreground mt-1">
                        Record and manage receivable payments (Integrasi Accurate)
                    </p>
                </div>
                <Button className="btn-gradient flex items-center gap-2 self-start" onClick={() => window.scrollTo({ top: 350, behavior: 'smooth' })}>
                    <Plus className="w-4 h-4" />
                    Record Payment
                </Button>
            </div>

            {/* Summary Cards (DYNAMIC based on current view) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="shadow-sm">
                    <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">Total Receivables (Loaded)</p>
                        <p className="text-2xl font-bold text-foreground mt-1">Rp {totalOutstanding.toLocaleString('id-ID')}</p>
                        <p className="text-xs text-muted-foreground mt-2">From loaded invoices</p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm">
                    <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">Payment Amount</p>
                        <p className="text-2xl font-bold text-green-600 mt-1">Rp {totalBayar.toLocaleString('id-ID')}</p>
                        <p className="text-xs text-muted-foreground mt-2">Amount to be collected</p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm">
                    <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">Remaining Outstanding</p>
                        <p className="text-2xl font-bold text-destructive mt-1">Rp {(totalOutstanding - totalBayar).toLocaleString('id-ID')}</p>
                        <p className="text-xs text-muted-foreground mt-2">After this payment</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters & Search (Linked to KODE 2 Logic) */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search invoices by number..."
                        value={searchInv}
                        onChange={(e) => setSearchInv(e.target.value)}
                        className="w-full pl-10 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                    {loadingInv && <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-primary" />}
                </div>
                <Button variant="outline" className="flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    Filter
                </Button>
            </div>

            {/* Payment Form (Logic KODE 2 Integrated) */}
            <Card className="shadow-sm border-input">
                <CardHeader>
                    <CardTitle>Record Payment</CardTitle>
                    <CardDescription>Enter receivable payment details</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        {/* Left Column */}
                        <div className="space-y-4">
                            <div className="relative z-20">
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Customer <span className="text-red-500">*</span>
                                </label>
                                <AsyncSelect 
                                    apiEndpoint={`${API_BASE_URL}/master_customer.php`}
                                    placeholder="Select customer..."
                                    value={customerName} displayName={customerName}
                                    onChange={(val, name) => { setCustomerNo(val); setCustomerName(name); }}
                                />
                            </div>
                            <div className="relative z-10">
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Bank / Cash Account <span className="text-red-500">*</span>
                                </label>
                                <AsyncSelect 
                                    apiEndpoint={`${API_BASE_URL}/master_glaccount.php`}
                                    placeholder="Select bank account..."
                                    value={bankName} displayName={bankName}
                                    filterType="CASH_BANK"
                                    onChange={(val, name, id) => { setBankName(name); setBankId(id || null); }}
                                />
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Payment Date <span className="text-red-500">*</span>
                                </label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className={cn("w-full justify-start text-left font-normal border-input", !transDate && "text-muted-foreground")}>
                                            <CalendarIcon className="mr-2 h-4 w-4" /> 
                                            {transDate ? format(transDate, "dd/MM/yyyy") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={transDate} onSelect={(d) => d && setTransDate(d)} /></PopoverContent>
                                </Popover>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Notes / Reference
                                </label>
                                <Input 
                                    value={description} 
                                    onChange={e => setDescription(e.target.value)} 
                                    placeholder="Payment reference number..." 
                                />
                            </div>
                        </div>
                    </div>

                    {/* Outstanding Invoices Table */}
                    <div className="rounded-md border border-input mb-4">
                        <div className="p-4 border-b bg-muted/20">
                            <h3 className="font-semibold text-foreground">Outstanding Invoices</h3>
                        </div>
                        {invoices.length === 0 && !loadingInv ? (
                            <div className="p-8 text-center text-muted-foreground italic">
                                {customerNo ? "No outstanding invoices found." : "Select a customer to see invoices."}
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-muted text-muted-foreground font-medium">
                                        <tr>
                                            <th className="px-4 py-3">Invoice #</th>
                                            <th className="px-4 py-3">Date</th>
                                            <th className="px-4 py-3 text-right">Outstanding</th>
                                            <th className="px-4 py-3 text-right w-40">Pay Amount (Rp)</th>
                                            <th className="px-4 py-3 w-10"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {invoices.map((inv) => (
                                            <tr key={inv.id} className={cn("hover:bg-muted/50 transition-colors", inv.payAmount > 0 && "bg-green-50/50")}>
                                                <td className="px-4 py-3 font-medium text-primary">{inv.number}</td>
                                                <td className="px-4 py-3 text-muted-foreground">{inv.date}</td>
                                                <td className="px-4 py-3 text-right font-medium">{inv.outstanding.toLocaleString('id-ID')}</td>
                                                <td className="px-4 py-3">
                                                    <Input 
                                                        type="number" 
                                                        className="h-8 text-right font-medium"
                                                        value={inv.payAmount || ''} 
                                                        onChange={e => handleAmountChange(inv.id, parseFloat(e.target.value))}
                                                    />
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-100" onClick={() => handlePayAll(inv.id)} title="Pay Full">
                                                        <CheckCircle className="h-4 w-4" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button variant="outline">Cancel</Button>
                        <Button className="btn-gradient min-w-[150px]" onClick={handleSubmit} disabled={saving}>
                            {saving ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Wallet className="w-4 h-4 mr-2" />}
                            {saving ? "Processing..." : "Record Payment"}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Payment History (Placeholder KODE 1) */}
            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle>Payment History</CardTitle>
                    <CardDescription>Recent recorded payments (Mock Data)</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted text-muted-foreground font-medium">
                                <tr>
                                    <th className="px-4 py-3">Payment #</th>
                                    <th className="px-4 py-3">Customer</th>
                                    <th className="px-4 py-3 hidden md:table-cell">Invoice</th>
                                    <th className="px-4 py-3 text-right">Paid</th>
                                    <th className="px-4 py-3 text-center">Status</th>
                                    <th className="px-4 py-3 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {mockHistory.map((item) => (
                                    <tr key={item.id} className="hover:bg-muted/50 transition-colors">
                                        <td className="px-4 py-3 font-medium text-primary">{item.id}</td>
                                        <td className="px-4 py-3 text-foreground">{item.customer}</td>
                                        <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{item.invoiceNo}</td>
                                        <td className="px-4 py-3 text-right font-medium text-foreground">{item.paidAmount}</td>
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

export default PelunasanPage;