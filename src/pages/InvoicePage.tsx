import { useState, useEffect, useRef } from "react";
import { 
  Search, 
  Plus, 
  Filter, 
  Trash2, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Printer, 
  Send, 
  Loader2, 
  CalendarIcon, 
  X,
  Check,
  ChevronsUpDown
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

// --- KONFIGURASI API ---
const API_BASE_URL = "https://technokingindonesia.com/projekmagank/accurate-integration-project";

// --- COMPONENT ASYNC SELECT (DIPERBAIKI) ---
interface AsyncSelectProps {
    value: string;
    displayName?: string;
    onChange: (val: string, name: string, extra?: any) => void;
    placeholder: string;
    apiEndpoint: string;
}

const AsyncSelect: React.FC<AsyncSelectProps> = ({ value, displayName, onChange, placeholder, apiEndpoint }) => {
    const [query, setQuery] = useState("");
    const [options, setOptions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Fungsi Fetch Data dengan Debugging Log
    const fetchData = async (keyword: string) => {
        setLoading(true);
        try {
            console.log(`Fetching: ${apiEndpoint}?q=${keyword}`); // DEBUG LOG
            const res = await fetch(`${apiEndpoint}?q=${keyword}`);
            const json = await res.json();
            
            console.log("Response:", json); // DEBUG LOG: Cek di Console Browser (F12)

            if (json.s && Array.isArray(json.d)) {
                setOptions(json.d);
            } else {
                setOptions([]);
                console.warn("Format data backend tidak sesuai atau kosong:", json);
            }
        } catch(e) { 
            console.error("Fetch Error:", e);
            setOptions([]); 
        } finally { 
            setLoading(false); 
        }
    };

    // Debounce Search
    useEffect(() => {
        const timer = setTimeout(() => { 
            if (isOpen) fetchData(query); 
        }, 400);
        return () => clearTimeout(timer);
    }, [query, isOpen]);

    // Click Outside Listener
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    // JIKA ADA VALUE TERPILIH (TAMPILAN READ-ONLY VIEW)
    if (value && !isOpen) {
        return (
            <div className="relative flex items-center w-full">
                <div 
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors" 
                    onClick={() => { 
                        setIsOpen(true); 
                        setQuery(""); // Reset query saat dibuka ulang untuk memancing fetch all
                        fetchData(""); // Pancing data awal
                    }}
                >
                    <span className="truncate font-medium text-foreground">{displayName || value}</span>
                    <ChevronsUpDown className="h-4 w-4 text-muted-foreground opacity-50" />
                </div>
                <button 
                    type="button" 
                    onClick={(e) => { e.stopPropagation(); onChange("", ""); }} 
                    className="absolute right-8 p-1 hover:text-destructive transition-colors"
                >
                    <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                </button>
            </div>
        );
    }

    // TAMPILAN INPUT PENCARIAN & DROPDOWN
    return (
        <div className="relative w-full" ref={wrapperRef}>
            <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input 
                    className="flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-8 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" 
                    placeholder={placeholder} 
                    value={query} 
                    onChange={(e) => setQuery(e.target.value)} 
                    onFocus={() => setIsOpen(true)}
                    onClick={() => setIsOpen(true)} 
                    autoFocus={isOpen}
                />
                {loading && <Loader2 className="absolute right-2.5 top-3 h-4 w-4 animate-spin text-primary" />}
            </div>
            
            {/* DROPDOWN MENU - PERBAIKAN Z-INDEX & POSITIONING */}
            {isOpen && (
                <div className="absolute top-full left-0 z-[9999] mt-1 w-full min-w-[200px] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-lg animate-in fade-in-0 zoom-in-95">
                    <div className="max-h-[250px] overflow-y-auto p-1">
                        {options.length === 0 && !loading ? (
                            <div className="px-2 py-3 text-sm text-center text-muted-foreground italic">
                                Data tidak ditemukan
                            </div>
                        ) : (
                            options.map((opt, i) => (
                                <div 
                                    key={i} 
                                    className={cn(
                                        "relative flex cursor-default select-none items-center rounded-sm px-2 py-2 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer",
                                        value === opt.no && "bg-accent text-accent-foreground"
                                    )}
                                    onClick={() => { 
                                        onChange(opt.no, opt.label, opt); 
                                        setIsOpen(false); 
                                    }}
                                >
                                    <Check className={cn("mr-2 h-4 w-4", value === opt.no ? "opacity-100" : "opacity-0")} />
                                    <div className="flex flex-col">
                                        <span className="font-medium">{opt.label}</span>
                                        {/* Tampilkan info tambahan jika ada (misal No Item) */}
                                        {opt.no !== opt.label && <span className="text-xs text-muted-foreground">{opt.no}</span>}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// --- DATA MOCK UNTUK VISUALISASI ---
const summaryMetrics = [
    { title: "Total Invoiced", value: "Rp 323.287.500", color: "text-foreground" },
    { title: "Paid", value: "Rp 136.530.000", color: "text-green-600" },
    { title: "Pending", value: "Rp 169.275.000", color: "text-yellow-600" },
    { title: "Overdue", value: "Rp 17.482.500", color: "text-red-600" },
];

const mockInvoices = [
  { id: "INV-2024-0001", customer: "PT Maju Jaya", date: "2024-01-15", dueDate: "2024-02-15", total: "Rp 49.950.000", status: "Paid" },
  { id: "INV-2024-0002", customer: "CV Sukses Mandiri", date: "2024-01-18", dueDate: "2024-02-18", total: "Rp 36.075.000", status: "Pending" },
  { id: "INV-2024-0003", customer: "PT Sentosa Abadi", date: "2024-01-20", dueDate: "2024-02-20", total: "Rp 86.580.000", status: "Paid" },
];

// --- MAIN INVOICE PAGE ---
export function InvoicePage() {
    const { toast } = useToast();
    const [transDate, setTransDate] = useState<Date>(new Date());
    const [customerNo, setCustomerNo] = useState("");
    const [customerName, setCustomerName] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    
    // UI State
    const [searchTerm, setSearchTerm] = useState("");

    const [items, setItems] = useState([{ id: '1', itemNo: '', itemName: '', qty: 1, price: 0 }]);

    const updateItem = (id: string, field: string, val: any) => {
        setItems(prev => prev.map(r => r.id === id ? { ...r, [field]: val } : r));
    };

    const addItem = () => {
        setItems([...items, { id: Date.now().toString(), itemNo: '', itemName: '', qty: 1, price: 0 }]);
    };

    const deleteItem = (id: string) => {
        if(items.length > 1) {
            setItems(items.filter(i => i.id !== id));
        }
    };

    const subTotal = items.reduce((sum, i) => sum + (i.qty * i.price), 0);
    const taxTotal = subTotal * 0.12; 
    const grandTotal = subTotal + taxTotal;

    const handleSubmit = async () => {
        if (!customerNo) return toast({ title: "Validasi Gagal", description: "Pilih Pelanggan terlebih dahulu.", variant: "destructive" });
        if (items.some(i => !i.itemNo)) return toast({ title: "Validasi Gagal", description: "Pilih Barang terlebih dahulu.", variant: "destructive" });

        setLoading(true);
        try {
            const payload = {
                customerNo,
                transDate: format(transDate, "dd/MM/yyyy"),
                description: description || "Invoice via Integration App",
                detailItem: items.map(i => ({ itemNo: i.itemNo, quantity: i.qty, unitPrice: i.price }))
            };

            const res = await fetch(`${API_BASE_URL}/transaksi_invoice.php`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
            });
            const json = await res.json();

            if (json.s) {
                const invoiceNumber = json.r?.number || "Berhasil";
                toast({ 
                    title: "Sukses Disimpan!", 
                    description: `Nomor Invoice: ${invoiceNumber}`, 
                    className: "bg-green-600 text-white border-green-700" 
                });
                
                // Reset Form
                setItems([{ id: Date.now().toString(), itemNo: '', itemName: '', qty: 1, price: 0 }]);
                setDescription("");
                // setCustomerNo(""); setCustomerName(""); // Opsional: reset customer
            } else {
                const errorMsg = Array.isArray(json.d) ? json.d.join(", ") : (json.d?.message || "Terjadi kesalahan");
                throw new Error(errorMsg);
            }
        } catch (err: any) {
            toast({ title: "Gagal Menyimpan", description: err.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "Paid": return "bg-green-100 text-green-700";
            case "Pending": return "bg-yellow-100 text-yellow-700";
            case "Overdue": return "bg-red-100 text-red-700";
            default: return "bg-gray-100 text-gray-700";
        }
    };

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Sales Invoice</h1>
                    <p className="text-muted-foreground mt-1">
                        Create and manage customer invoices
                    </p>
                </div>
                <Button className="flex items-center gap-2 self-start" onClick={() => window.scrollTo({ top: 500, behavior: 'smooth' })}>
                    <Plus className="w-4 h-4" />
                    New Invoice
                </Button>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                {summaryMetrics.map((metric, idx) => (
                    <Card key={idx} className="shadow-sm">
                        <CardContent className="p-4">
                            <p className="text-sm text-muted-foreground">{metric.title}</p>
                            <p className={`text-2xl font-bold mt-1 ${metric.color}`}>{metric.value}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Filter Search */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search invoices..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                </div>
                <Button variant="outline" className="flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    Filter
                </Button>
            </div>

            {/* --- FORM CREATE INVOICE --- */}
            <Card className="shadow-sm border-input">
                <CardHeader>
                    <CardTitle>Create Invoice</CardTitle>
                    <CardDescription>Enter invoice details (Integrated with Accurate Online)</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        
                        {/* Section Pelanggan & Info Dasar */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="relative z-20"> {/* Tambahkan z-index agar dropdown customer muncul di atas elemen lain */}
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        Customer <span className="text-red-500">*</span>
                                    </label>
                                    <AsyncSelect 
                                        apiEndpoint={`${API_BASE_URL}/invoice_customer.php`} 
                                        placeholder="Cari Pelanggan..." 
                                        value={customerNo} displayName={customerName}
                                        onChange={(val, label) => { setCustomerNo(val); setCustomerName(label); }} 
                                    />
                                    <p className="text-[10px] text-muted-foreground mt-1">*Ketik nama pelanggan untuk mencari</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        Invoice Number
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Auto-generated by System"
                                        disabled
                                        className="w-full rounded-md border border-input bg-muted px-3 py-2 text-sm cursor-not-allowed opacity-70"
                                    />
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">
                                            Invoice Date
                                        </label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full justify-start text-left font-normal border-input",
                                                        !transDate && "text-muted-foreground"
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {transDate ? format(transDate, "PPP") : <span>Pick a date</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <Calendar
                                                    mode="single"
                                                    selected={transDate}
                                                    onSelect={(d) => d && setTransDate(d)}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">
                                            Tax Type
                                        </label>
                                        <div className="flex h-10 w-full items-center rounded-md border border-input bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
                                            PPN 12% (Auto)
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        Notes
                                    </label>
                                    <textarea
                                        rows={2}
                                        placeholder="Keterangan tambahan..."
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section Items Table */}
                        <div className="relative z-10"> {/* Container Table */}
                            <label className="block text-sm font-medium text-foreground mb-2">
                                Invoice Items <span className="text-red-500">*</span>
                            </label>
                            <div className="rounded-lg border border-input bg-card text-card-foreground shadow-sm overflow-visible"> {/* overflow-visible PENTING agar dropdown tidak terpotong */}
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-muted text-muted-foreground font-medium">
                                        <tr>
                                            <th className="px-3 py-3 w-10 text-center">#</th>
                                            <th className="px-3 py-3">Description / Item</th>
                                            <th className="px-3 py-3 w-24 text-center">Qty</th>
                                            <th className="px-3 py-3 w-40 text-right">Price</th>
                                            <th className="px-3 py-3 w-40 text-right">Total</th>
                                            <th className="px-3 py-3 w-10"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {items.map((item, index) => (
                                            <tr key={item.id} className="hover:bg-muted/50 transition-colors">
                                                <td className="px-3 py-2 text-center align-top pt-3 text-muted-foreground">{index + 1}</td>
                                                <td className="px-3 py-2 align-top pt-2 relative">
                                                    {/* ASYNC SELECT DI DALAM TABEL */}
                                                    <AsyncSelect 
                                                        apiEndpoint={`${API_BASE_URL}/invoice_item.php`} 
                                                        placeholder="Cari Item..." 
                                                        value={item.itemNo} displayName={item.itemName}
                                                        onChange={(val, label, obj) => { 
                                                            updateItem(item.id, 'itemNo', val); 
                                                            updateItem(item.id, 'itemName', label);
                                                            if (obj) updateItem(item.id, 'price', obj.price); 
                                                        }} 
                                                    />
                                                </td>
                                                <td className="px-3 py-2 align-top pt-2">
                                                    <input
                                                        type="number"
                                                        min={1}
                                                        value={item.qty}
                                                        onChange={(e) => updateItem(item.id, 'qty', parseFloat(e.target.value) || 0)}
                                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                                    />
                                                </td>
                                                <td className="px-3 py-2 align-top pt-2">
                                                    <input
                                                        type="number"
                                                        value={item.price}
                                                        onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-right focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                                    />
                                                </td>
                                                <td className="px-3 py-2 text-right font-medium align-top pt-4">
                                                    Rp {(item.qty * item.price).toLocaleString('id-ID')}
                                                </td>
                                                <td className="px-3 py-2 align-top pt-3 text-center">
                                                    <button 
                                                        onClick={() => deleteItem(item.id)}
                                                        className="p-1 hover:bg-destructive/10 text-destructive rounded transition-colors disabled:opacity-50"
                                                        disabled={items.length <= 1}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <button
                                onClick={addItem}
                                className="mt-3 text-sm text-primary hover:underline flex items-center gap-1 font-medium"
                            >
                                <Plus className="w-4 h-4" /> Add New Item Line
                            </button>
                        </div>

                        {/* Totals */}
                        <div className="flex justify-end pt-4">
                            <div className="w-full max-w-xs space-y-2 bg-muted/30 p-4 rounded-lg">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span className="text-foreground font-medium">Rp {subTotal.toLocaleString('id-ID')}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Tax (11%)</span>
                                    <span className="text-foreground font-medium">Rp {taxTotal.toLocaleString('id-ID')}</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold border-t border-border pt-2 mt-2">
                                    <span className="text-foreground">Total</span>
                                    <span className="text-primary">Rp {grandTotal.toLocaleString('id-ID')}</span>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-3 pt-4 border-t border-border">
                            <Button variant="outline">
                                Save as Draft
                            </Button>
                            <Button onClick={handleSubmit} disabled={loading} className="min-w-[140px]">
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                                {loading ? "Memproses..." : "Create Invoice"}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* List Invoice (Placeholder) */}
            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle>Invoice List</CardTitle>
                    <CardDescription>Recent invoices history</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-muted-foreground bg-muted font-medium">
                                <tr>
                                    <th className="px-4 py-3">Invoice #</th>
                                    <th className="px-4 py-3">Customer</th>
                                    <th className="px-4 py-3 hidden md:table-cell">Date</th>
                                    <th className="px-4 py-3 text-right">Total</th>
                                    <th className="px-4 py-3 text-center">Status</th>
                                    <th className="px-4 py-3 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {mockInvoices.map((inv) => (
                                    <tr key={inv.id} className="hover:bg-muted/50 transition-colors">
                                        <td className="px-4 py-3 font-medium text-primary">{inv.id}</td>
                                        <td className="px-4 py-3">{inv.customer}</td>
                                        <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{inv.date}</td>
                                        <td className="px-4 py-3 text-right font-medium">{inv.total}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(inv.status)}`}>
                                                {inv.status}
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
                                                    <DropdownMenuItem><Printer className="w-4 h-4 mr-2" /> Print</DropdownMenuItem>
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
};

export default InvoicePage;