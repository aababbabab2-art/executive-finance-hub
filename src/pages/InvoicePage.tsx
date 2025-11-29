import { useState, useEffect, useRef } from "react";
import { Send } from "lucide-react";
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
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

// --- KONFIGURASI API ---
const API_BASE_URL = "https://vexacreative.net/projekmagank/accurate-integration-project/Api";

// --- INTERFACES ---
interface InvoiceData {
    id: number;
    number: string;
    transDate: string;
    customerName: string;
    totalAmount: number;
    status: string;
}

// Interface Detail untuk Modal
interface InvoiceDetail extends InvoiceData {
    description: string;
    detailItem: {
        item: { no: string; name: string };
        quantity: number;
        unitPrice: number;
        totalPrice: number;
    }[];
}

// --- COMPONENT ASYNC SELECT ---
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

    const fetchData = async (keyword: string) => {
        setLoading(true);
        try {
            const res = await fetch(`${apiEndpoint}?q=${keyword}`);
            const json = await res.json();
            if (json.s && Array.isArray(json.d)) {
                setOptions(json.d);
            } else {
                setOptions([]);
            }
        } catch(e) { 
            setOptions([]); 
        } finally { 
            setLoading(false); 
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => { 
            if (isOpen) fetchData(query); 
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
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors" 
                    onClick={() => { 
                        setIsOpen(true); 
                        setQuery(""); 
                        fetchData(""); 
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
                />
                {loading && <Loader2 className="absolute right-2.5 top-3 h-4 w-4 animate-spin text-primary" />}
            </div>
            
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
                                        value === (opt.no || opt.id) && "bg-accent text-accent-foreground"
                                    )}
                                    onClick={() => { 
                                        onChange(opt.no || opt.customerNo || opt.id, opt.label || opt.name, opt); 
                                        setIsOpen(false); 
                                    }}
                                >
                                    <Check className={cn("mr-2 h-4 w-4", value === (opt.no || opt.id) ? "opacity-100" : "opacity-0")} />
                                    <div className="flex flex-col">
                                        <span className="font-medium">{opt.label || opt.name}</span>
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

// --- DATA MOCK SUMMARY ---
const summaryMetrics = [
    { title: "Total Invoiced", value: "Rp 323.287.500", color: "text-foreground" },
    { title: "Paid", value: "Rp 136.530.000", color: "text-green-600" },
    { title: "Pending", value: "Rp 169.275.000", color: "text-yellow-600" },
    { title: "Overdue", value: "Rp 17.482.500", color: "text-red-600" },
];

// --- MAIN INVOICE PAGE ---
export function InvoicePage() {
    const { toast } = useToast();
    
    // State Form
    const [transDate, setTransDate] = useState<Date>(new Date());
    const [customerNo, setCustomerNo] = useState("");
    const [customerName, setCustomerName] = useState("");
    const [description, setDescription] = useState("");
    const [saving, setSaving] = useState(false);
    const [items, setItems] = useState([{ id: '1', itemNo: '', itemName: '', qty: 1, price: 0 }]);

    // State List Data Real
    const [invoiceList, setInvoiceList] = useState<InvoiceData[]>([]);
    const [loadingList, setLoadingList] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // [BARU] State Detail Modal
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [detailData, setDetailData] = useState<InvoiceDetail | null>(null);
    const [loadingDetail, setLoadingDetail] = useState(false);

    // [BARU] Fetch List Invoice
    const fetchInvoiceList = async (keyword = "") => {
        setLoadingList(true);
        try {
            const url = new URL(`${API_BASE_URL}/Invoice/List.php`);
            if (keyword) url.searchParams.append("q", keyword);
            const res = await fetch(url.toString());
            const json = await res.json();
            if (json.s === true && Array.isArray(json.d)) {
                setInvoiceList(json.d);
            } else {
                setInvoiceList([]);
            }
        } catch (error) {
            toast({ title: "Connection Error", description: "Gagal memuat daftar invoice.", variant: "destructive" });
        } finally {
            setLoadingList(false);
        }
    };

    // [BARU] Fetch Detail Invoice
    const fetchInvoiceDetail = async (id: number) => {
        setLoadingDetail(true);
        setDetailData(null);
        try {
            const res = await fetch(`${API_BASE_URL}/Invoice/Detail.php?id=${id}`);
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
        fetchInvoiceList();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => { fetchInvoiceList(searchTerm); }, 600);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Trigger Fetch Detail
    useEffect(() => {
        if (selectedId) {
            fetchInvoiceDetail(selectedId);
        }
    }, [selectedId]);

    // Logic Form Item
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

        setSaving(true);
        try {
            const payload = {
                customerNo,
                transDate: format(transDate, "dd/MM/yyyy"),
                description: description || "Invoice via Integration App",
                detailItem: items.map(i => ({ itemNo: i.itemNo, quantity: i.qty, unitPrice: i.price }))
            };

            const res = await fetch(`${API_BASE_URL}/Invoice/Transaksi.php`, {
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
                fetchInvoiceList(); // Refresh List
            } else {
                const errorMsg = Array.isArray(json.d) ? json.d.join(", ") : (json.d?.message || "Terjadi kesalahan");
                throw new Error(errorMsg);
            }
        } catch (err: any) {
            toast({ title: "Gagal Menyimpan", description: err.message, variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "PAID": return "bg-green-100 text-green-700";
            case "OUTSTANDING": return "bg-yellow-100 text-yellow-700";
            case "OVERDUE": return "bg-red-100 text-red-700";
            default: return "bg-gray-100 text-gray-700";
        }
    };

    return (
        <div className="space-y-6 p-6 relative">
            
            {/* --- MODAL DETAIL (OVERLAY) --- */}
            {selectedId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                        
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
                            <div>
                                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-primary" /> 
                                    Detail Invoice
                                </h3>
                                <p className="text-xs text-gray-500">Rincian faktur penjualan</p>
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
                                    
                                    {/* Info Header */}
                                    <div className="flex justify-between items-start border-b pb-4">
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-900">{detailData.number}</h2>
                                            <p className="text-sm text-gray-500">{detailData.transDate}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className={cn("px-3 py-1 rounded-full text-sm font-bold uppercase", getStatusBadge(detailData.status))}>
                                                {detailData.status}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <h4 className="text-xs font-bold text-gray-400 uppercase mb-1">Customer</h4>
                                            <p className="font-semibold text-gray-800">{detailData.customerName}</p>
                                            <p className="text-sm text-gray-500 italic">{detailData.description || "-"}</p>
                                        </div>
                                        <div className="text-right">
                                            <h4 className="text-xs font-bold text-gray-400 uppercase mb-1">Total Amount</h4>
                                            <p className="text-2xl font-bold text-primary">Rp {detailData.totalAmount.toLocaleString('id-ID')}</p>
                                        </div>
                                    </div>

                                    {/* Tabel Rincian Barang */}
                                    <div className="border rounded-lg overflow-hidden shadow-sm">
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-100 text-gray-600 font-medium border-b">
                                                <tr>
                                                    <th className="px-4 py-2 text-left w-10">#</th>
                                                    <th className="px-4 py-2 text-left">Item Description</th>
                                                    <th className="px-4 py-2 text-center w-24">Qty</th>
                                                    <th className="px-4 py-2 text-right w-32">Price</th>
                                                    <th className="px-4 py-2 text-right w-32">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y bg-white">
                                                {detailData.detailItem?.map((item: any, idx: number) => (
                                                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-4 py-3 text-gray-500 text-center">{idx + 1}</td>
                                                        <td className="px-4 py-3 font-medium text-gray-800">
                                                            {item.item?.name}
                                                            <span className="block text-xs text-gray-400 mt-0.5">{item.item?.no}</span>
                                                        </td>
                                                        <td className="px-4 py-3 text-center">{item.quantity}</td>
                                                        <td className="px-4 py-3 text-right">{item.unitPrice.toLocaleString('id-ID')}</td>
                                                        <td className="px-4 py-3 text-right font-bold">{item.totalPrice.toLocaleString('id-ID')}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
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

            {/* Header Page */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Sales Invoice</h1>
                    <p className="text-muted-foreground mt-1">
                        Create and manage customer invoices
                    </p>
                </div>
                <Button className="flex items-center gap-2 self-start" onClick={() => window.scrollTo({ top: 500, behavior: 'smooth' })}>
                    <Plus className="w-4 h-4" /> New Invoice
                </Button>
            </div>

            {/* Metrics */}
            {/* <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                {summaryMetrics.map((metric, idx) => (
                    <Card key={idx} className="shadow-sm">
                        <CardContent className="p-4">
                            <p className="text-sm text-muted-foreground">{metric.title}</p>
                            <p className={`text-2xl font-bold mt-1 ${metric.color}`}>{metric.value}</p>
                        </CardContent>
                    </Card>
                ))}
            </div> */}

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
                    <Filter className="w-4 h-4" /> Filter
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
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="relative z-20">
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        Customer <span className="text-red-500">*</span>
                                    </label>
                                    <AsyncSelect 
                                        apiEndpoint={`${API_BASE_URL}/Invoice/MasterCustomer.php`} 
                                        placeholder="Cari Pelanggan..." 
                                        value={customerNo} displayName={customerName}
                                        onChange={(val, label) => { setCustomerNo(val); setCustomerName(label); }} 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        Invoice Number
                                    </label>
                                    <input type="text" placeholder="Auto-generated by System" disabled className="w-full rounded-md border border-input bg-muted px-3 py-2 text-sm cursor-not-allowed opacity-70" />
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">Invoice Date</label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal border-input", !transDate && "text-muted-foreground")}>
                                                    <CalendarIcon className="mr-2 h-4 w-4" />{transDate ? format(transDate, "PPP") : <span>Pick a date</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={transDate} onSelect={(d) => d && setTransDate(d)} initialFocus /></PopoverContent>
                                        </Popover>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">Tax Type</label>
                                        <div className="flex h-10 w-full items-center rounded-md border border-input bg-muted/50 px-3 py-2 text-sm text-muted-foreground">PPN 12% (Auto)</div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">Notes</label>
                                    <textarea rows={2} placeholder="Keterangan tambahan..." value={description} onChange={(e) => setDescription(e.target.value)} className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                                </div>
                            </div>
                        </div>

                        <div className="relative z-10">
                            <label className="block text-sm font-medium text-foreground mb-2">
                                Invoice Items <span className="text-red-500">*</span>
                            </label>
                            <div className="rounded-lg border border-input bg-card text-card-foreground shadow-sm overflow-visible">
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
                                                    <AsyncSelect 
                                                        apiEndpoint={`${API_BASE_URL}/Invoice/MasterItem.php`} 
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
                                                    <input type="number" min={1} value={item.qty} onChange={(e) => updateItem(item.id, 'qty', parseFloat(e.target.value) || 0)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                                                </td>
                                                <td className="px-3 py-2 align-top pt-2">
                                                    <input type="number" value={item.price} onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-right focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                                                </td>
                                                <td className="px-3 py-2 text-right font-medium align-top pt-4">
                                                    Rp {(item.qty * item.price).toLocaleString('id-ID')}
                                                </td>
                                                <td className="px-3 py-2 align-top pt-3 text-center">
                                                    <button onClick={() => deleteItem(item.id)} className="p-1 hover:bg-destructive/10 text-destructive rounded transition-colors disabled:opacity-50" disabled={items.length <= 1}>
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <button onClick={addItem} className="mt-3 text-sm text-primary hover:underline flex items-center gap-1 font-medium">
                                <Plus className="w-4 h-4" /> Add New Item Line
                            </button>
                        </div>

                        <div className="flex justify-end pt-4">
                            <div className="w-full max-w-xs space-y-2 bg-muted/30 p-4 rounded-lg">
                                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span className="text-foreground font-medium">Rp {subTotal.toLocaleString('id-ID')}</span></div>
                                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Tax (12%)</span><span className="text-foreground font-medium">Rp {taxTotal.toLocaleString('id-ID')}</span></div>
                                <div className="flex justify-between text-lg font-bold border-t border-border pt-2 mt-2"><span className="text-foreground">Total</span><span className="text-primary">Rp {grandTotal.toLocaleString('id-ID')}</span></div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-border">
                            <Button variant="outline">Save as Draft</Button>
                            <Button onClick={handleSubmit} disabled={saving} className="min-w-[140px]">
                                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                                {saving ? "Memproses..." : "Create Invoice"}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* List Invoice (Real Data) */}
            <Card className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Invoice List</CardTitle>
                        <CardDescription>Recent invoices history</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => fetchInvoiceList()} disabled={loadingList}>
                        <RefreshCcw className={cn("w-4 h-4 mr-2", loadingList && "animate-spin")} /> Refresh
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-muted-foreground bg-muted font-medium">
                                <tr>
                                    <th className="px-4 py-3 w-10 text-center">No.</th>
                                    <th className="px-4 py-3">Invoice #</th>
                                    <th className="px-4 py-3">Customer</th>
                                    <th className="px-4 py-3 hidden md:table-cell">Date</th>
                                    <th className="px-4 py-3 text-right">Total</th>
                                    {/* <th className="px-4 py-3 text-center">Status</th> */}
                                    <th className="px-4 py-3 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {loadingList ? (
                                    <tr><td colSpan={7} className="p-8 text-center text-muted-foreground"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2"/>Loading...</td></tr>
                                ) : invoiceList.length === 0 ? (
                                    <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Tidak ada data.</td></tr>
                                ) : (
                                    invoiceList.map((inv, idx) => (
                                        <tr key={inv.id} className="hover:bg-muted/50 transition-colors">
                                            <td className="px-4 py-3 text-center text-muted-foreground">{idx + 1}</td>
                                            <td className="px-4 py-3 font-medium text-primary">{inv.number}</td>
                                            <td className="px-4 py-3">{inv.customerName}</td>
                                            <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{inv.transDate}</td>
                                            <td className="px-4 py-3 text-right font-medium">Rp {inv.totalAmount.toLocaleString('id-ID')}</td>
                                            {/* <td className="px-4 py-3 text-center">
                                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(inv.status)}`}>
                                                    {inv.status}
                                                </span>
                                            </td> */}
                                            <td className="px-4 py-3 text-center">
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    onClick={() => setSelectedId(inv.id)} 
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

export default InvoicePage;