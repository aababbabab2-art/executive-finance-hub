import { useState, useEffect, useRef } from "react";
import { 
  Search, 
  Plus, 
  Filter, 
  Trash2, 
  MoreHorizontal, 
  Eye, // Icon Mata untuk View
  Edit, 
  Loader2, 
  CalendarIcon, 
  X,
  Check,
  ChevronsUpDown,
  Save,
  RefreshCcw, // Icon Refresh
  FileText // Icon Detail di Modal
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
const TIMEOUT_MS = 6000;

// --- TYPE DEFINITIONS ---
interface Customer {
  id: number;
  name: string;
  customerNo: string;
}

interface Item {
  id: number | string;
  name: string;
  no: string; 
  unitName?: string; 
  itemType: string; 
}

interface LineItem {
  id: string;
  no: string; 
  itemName: string;
  quantity: number;
}

interface JobOrderData {
    id: number;
    number: string;
    transDate: string;
    customerName: string;
    description: string;
    amount: number;
    status: string;
}

// [BARU] Interface untuk Detail Modal
interface JobOrderDetail extends JobOrderData {
    customer: { customerNo: string; name: string };
    detailItem: {
        item: { no: string; name: string };
        quantity: number;
        itemUnit?: { name: string };
    }[];
}


// --- COMPONENT ASYNC SELECT ---
interface AsyncSelectProps {
    value: string;
    displayName?: string;
    onChange: (val: string, label: string) => void;
    options: { value: string; label: string }[];
    placeholder: string;
    loading?: boolean;
}

const AsyncSelect: React.FC<AsyncSelectProps> = ({ value, displayName, onChange, options, placeholder, loading = false }) => {
    const [query, setQuery] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const filteredOptions = options.filter(opt => 
        opt.label.toLowerCase().includes(query.toLowerCase()) || 
        opt.value.toLowerCase().includes(query.toLowerCase())
    );

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
                <button type="button" onClick={(e) => { e.stopPropagation(); onChange("", ""); }} className="absolute right-8 p-1 hover:text-destructive">
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
                    {filteredOptions.length === 0 ? (
                        <div className="px-2 py-3 text-sm text-center text-muted-foreground">Tidak ditemukan</div>
                    ) : (
                        filteredOptions.map((opt, i) => (
                            <div 
                                key={i} 
                                className={cn(
                                    "flex cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                                    value === opt.value && "bg-accent text-accent-foreground"
                                )}
                                onClick={() => { onChange(opt.value, opt.label); setIsOpen(false); }}
                            >
                                <Check className={cn("mr-2 h-4 w-4", value === opt.value ? "opacity-100" : "opacity-0")} />
                                <div className="flex flex-col">
                                    <span className="font-medium">{opt.label}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

// --- MAIN PAGE COMPONENT ---
export function JobOrderPage() {
    // --- STATE & LOGIC (KODE 2) ---
    const { toast } = useToast();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [items, setItems] = useState<Item[]>([]);
    const [loadingData, setLoadingData] = useState(false);
    const [saving, setSaving] = useState(false);

    // List Data State (Real Data)
    const [jobOrderList, setJobOrderList] = useState<JobOrderData[]>([]);
    const [loadingList, setLoadingList] = useState(false);
    
    // [TAMBAHAN] State Detail Modal
    const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
    const [detailData, setDetailData] = useState<JobOrderDetail | null>(null);
    const [loadingDetail, setLoadingDetail] = useState(false);

    // Form state
    const [transDate, setTransDate] = useState<Date>(new Date());
    const [customerNo, setCustomerNo] = useState("");
    const [customerName, setCustomerName] = useState(""); // Helper state untuk UI
    const [jobNumber, setJobNumber] = useState("");
    const [description, setDescription] = useState("");
    const [lineItems, setLineItems] = useState<LineItem[]>([]);

    // Search/Filter State
    const [searchTerm, setSearchTerm] = useState("");

    // --- FETCH MASTER DATA LOGIC (KODE 2 - DIJAMIN UTUH) ---
    const fetchMasterData = async (endpoint: string) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

        try {
            const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                signal: controller.signal,
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();

            if (data.s === true && Array.isArray(data.d)) {
                return data.d.filter((i: any) => i.name && i.id).map((i: any) => {
                    const cleanedData: any = {
                        id: String(i.id).trim(), 
                        name: String(i.name).trim(), 
                    };
                    if (i.customerNo) cleanedData.customerNo = String(i.customerNo).trim();
                    if (i.no) cleanedData.no = String(i.no).trim(); 
                    if (i.unitName) cleanedData.unitName = String(i.unitName).trim(); 
                    if (i.itemType) cleanedData.itemType = String(i.itemType).trim();
                    return cleanedData;
                });
            } else {
                throw new Error(data.d ? data.d[0] : `Failed to load ${endpoint}.`);
            }
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error(`Error loading ${endpoint}:`, error);
            }
            return [];
        } finally {
            clearTimeout(timeoutId);
        }
    };

    const loadMasterData = async () => {
        setLoadingData(true);
        const [customersData, itemsData] = await Promise.all([
            fetchMasterData('/JobOrder/MasterCustomer.php'),
            fetchMasterData('/JobOrder/MasterItem.php'),
        ]);

        const validCustomers: Customer[] = customersData.map((c: any) => ({
            id: Number(c.id),
            name: c.name,
            customerNo: c.customerNo,
        }));
        setCustomers(validCustomers);
        setItems(itemsData as Item[]);

        if (lineItems.length === 0 && itemsData.length > 0) {
            addLineItem();
        }
        setLoadingData(false);
    };

    // [BARU] Function untuk mengambil data List Job Order
    const fetchJobOrderList = async (keyword = "") => {
        setLoadingList(true);
        try {
            const url = new URL(`${API_BASE_URL}/JobOrder/List.php`);
            if (keyword) url.searchParams.append("q", keyword);

            const res = await fetch(url.toString());
            const json = await res.json();

            if (json.s === true && Array.isArray(json.d)) {
                setJobOrderList(json.d);
            } else {
                setJobOrderList([]);
            }
        } catch (error) {
            console.error("Gagal mengambil list job order", error);
            toast({ title: "Connection Error", description: "Gagal memuat daftar Job Order.", variant: "destructive" });
        } finally {
            setLoadingList(false);
        }
    };

    // [BARU] Fetch Detail Job Order
    const fetchJobOrderDetail = async (id: number) => {
        setLoadingDetail(true);
        setDetailData(null);
        try {
            const res = await fetch(`${API_BASE_URL}/JobOrder/Detail.php?id=${id}`);
            const json = await res.json();
            if (json.s === true) {
                setDetailData(json.d);
            } else {
                toast({ title: "Gagal", description: "Gagal memuat detail.", variant: "destructive" });
                setSelectedJobId(null);
            }
        } catch (error) {
            toast({ title: "Error", description: "Terjadi kesalahan koneksi.", variant: "destructive" });
        } finally {
            setLoadingDetail(false);
        }
    };


    // --- EFFECTS ---
    useEffect(() => {
        loadMasterData();
        fetchJobOrderList(); // [BARU] Load list saat pertama kali
    }, []);

    // [BARU] Debounce Search
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchJobOrderList(searchTerm);
        }, 600);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // [BARU] Trigger Fetch Detail saat ID berubah
    useEffect(() => {
        if (selectedJobId) {
            fetchJobOrderDetail(selectedJobId);
        }
    }, [selectedJobId]);


    // --- ITEM LOGIC (KODE 2) ---
    const addLineItem = () => {
        const newItem: LineItem = {
            id: Math.random().toString(36).substr(2, 9),
            no: "", 
            itemName: "",
            quantity: 1,
        };
        setLineItems([...lineItems, newItem]);
    };

    const updateLineItem = (id: string, field: keyof LineItem, value: string | number) => {
        setLineItems(
            lineItems.map((item) => {
                if (item.id === id) {
                    if (field === "no") { 
                        // LOGIKA KODE 2: Mencari item berdasarkan 'no'
                        const selectedItem = items.find((i) => String(i.no) === String(value));
                        return {
                            ...item,
                            no: value as string,
                            itemName: selectedItem?.name || "", 
                        };
                    }
                    return { ...item, [field]: value };
                }
                return item;
            })
        );
    };

    const removeLineItem = (id: string) => {
        if(lineItems.length > 1) {
            setLineItems(lineItems.filter((item) => item.id !== id));
        }
    };

    // --- SUBMIT LOGIC (KODE 2) ---
    const validateForm = (): boolean => {
        if (!customerNo) { toast({ title: "Validation Error", description: "Please select a customer.", variant: "destructive" }); return false; }
        if (!jobNumber.trim()) { toast({ title: "Validation Error", description: "Please enter a job order number.", variant: "destructive" }); return false; }
        if (!description.trim()) { toast({ title: "Validation Error", description: "Please enter a description.", variant: "destructive" }); return false; }
        if (lineItems.length === 0) { toast({ title: "Validation Error", description: "Please add at least one item.", variant: "destructive" }); return false; }
        for (const item of lineItems) {
            if (!item.no) { toast({ title: "Validation Error", description: "Please select an item for all line items.", variant: "destructive" }); return false; }
            if (item.quantity <= 0) { toast({ title: "Validation Error", description: "Quantity must be greater than 0.", variant: "destructive" }); return false; }
        }
        return true;
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        if(e) e.preventDefault();
        if (!validateForm()) return;

        setSaving(true);
        try {
            const detailItemsToSend = lineItems.map((lineItem) => ({
                itemNo: lineItem.no, 
                quantity: lineItem.quantity,
            }));

            const payload = {
                transDate: format(transDate, "dd/MM/yyyy"), 
                customerNo,
                number: jobNumber,
                description,
                detailItem: detailItemsToSend,
            };

            const response = await fetch(`${API_BASE_URL}/JobOrder/Transaksi.php`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (response.status === 200 && result.s === true) {
                toast({
                    title: "Success",
                    description: result.d[0] || "Job order saved successfully!",
                    className: "bg-green-600 text-white border-green-700"
                });
                // Reset form
                setCustomerNo(""); setCustomerName("");
                setJobNumber("");
                setDescription("");
                setLineItems([]);
                setTransDate(new Date());
                addLineItem();
                
                // [BARU] Refresh List setelah simpan
                fetchJobOrderList();
            } else {
                const errorMessage = result.d && Array.isArray(result.d) ? result.d.join('; ') : "Failed to save job order.";
                toast({ title: "Error", description: errorMessage, variant: "destructive" });
            }
        } catch (error) {
            toast({ title: "Error", description: `Failed to save job order.`, variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    // Prepare Options for Selects
    const customerOptions = customers.map(c => ({ value: c.customerNo, label: `${c.name} (${c.customerNo})` }));
    const itemOptions = items.filter(i => i.itemType === 'INVENTORY').map(i => ({ value: i.no, label: `${i.name}` }));

    return (
        <div className="space-y-6 p-6 relative">
            
            {/* --- MODAL DETAIL (OVERLAY) --- */}
            {selectedJobId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                        
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
                            <div>
                                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-primary" /> 
                                    Detail Job Order
                                </h3>
                                <p className="text-xs text-gray-500">Informasi lengkap transaksi</p>
                            </div>
                            <button onClick={() => setSelectedJobId(null)} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
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
                                    
                                    {/* Informasi Utama Grid */}
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
                                            <span className="block text-xs text-gray-500 uppercase tracking-wider">Status</span>
                                            <span className={cn(
                                                "inline-block px-2 py-0.5 rounded text-xs font-bold mt-1 uppercase",
                                                detailData.status === 'In Process' ? "bg-blue-100 text-blue-700" : 
                                                detailData.status === 'Closed' ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-700"
                                            )}>
                                                {detailData.status}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="border-t border-b py-4 border-dashed">
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div>
                                                <h4 className="text-sm font-semibold text-gray-500 mb-1">Pelanggan</h4>
                                                <p className="text-gray-900 font-medium text-base">{detailData.customer?.name}</p>
                                                <p className="text-xs text-gray-400 font-mono">{detailData.customer?.customerNo}</p>
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-semibold text-gray-500 mb-1">Keterangan Proyek</h4>
                                                <p className="text-gray-900 italic text-sm bg-gray-50 p-2 rounded border border-gray-100">
                                                    {detailData.description || "-"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Tabel Rincian Barang */}
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                                            <Check className="w-4 h-4 text-green-600"/> Rincian Barang / Material
                                        </h4>
                                        <div className="border rounded-lg overflow-hidden shadow-sm">
                                            <table className="w-full text-sm">
                                                <thead className="bg-gray-100/80 text-gray-600 font-medium border-b">
                                                    <tr>
                                                        <th className="px-4 py-2 text-left w-10">#</th>
                                                        <th className="px-4 py-2 text-left">Nama Barang</th>
                                                        <th className="px-4 py-2 text-center w-24">Qty</th>
                                                        <th className="px-4 py-2 text-left w-24">Satuan</th>
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
                                                            <td className="px-4 py-3 text-center font-bold bg-gray-50/50">{item.quantity}</td>
                                                            <td className="px-4 py-3 text-gray-500">{item.itemUnit?.name || 'PCS'}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                </div>
                            ) : (
                                <div className="text-center py-10 text-muted-foreground bg-gray-50 rounded-lg border border-dashed">
                                    Data detail tidak ditemukan atau gagal dimuat.
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 border-t bg-gray-50 flex justify-end">
                            <Button onClick={() => setSelectedJobId(null)} variant="outline">Tutup</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Job Order</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage and track all job orders (Integrated CSB)
                    </p>
                </div>
                <Button className="btn-gradient flex items-center gap-2 self-start" onClick={() => window.scrollTo({ top: 300, behavior: 'smooth' })}>
                    <Plus className="w-4 h-4" />
                    New Job Order
                </Button>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search job orders..."
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

            {/* FORM CARD */}
            <Card className="shadow-sm border-input">
                <CardHeader>
                    <CardTitle>Create Job Order</CardTitle>
                    <CardDescription>Enter job order details</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Job Order Number <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={jobNumber}
                                    onChange={(e) => setJobNumber(e.target.value)}
                                    placeholder="Enter job order number"
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    Manual input required by system
                                </p>
                            </div>
                            <div className="relative z-20">
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Customer Name <span className="text-red-500">*</span>
                                </label>
                                <AsyncSelect 
                                    options={customerOptions}
                                    value={customerNo}
                                    displayName={customerName}
                                    onChange={(val, label) => { setCustomerNo(val); setCustomerName(label); }}
                                    placeholder="Select customer..."
                                    loading={loadingData}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Project Description <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    rows={3}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Describe the project scope and deliverables"
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Transaction Date <span className="text-red-500">*</span>
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
                            
                            <div className="mt-4 relative z-10">
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Materials / Items <span className="text-red-500">*</span>
                                </label>
                                <div className="rounded-lg border border-input bg-card overflow-visible">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-muted text-muted-foreground font-medium">
                                            <tr>
                                                <th className="px-3 py-2 w-10 text-center">#</th>
                                                <th className="px-3 py-2">Item Name</th>
                                                <th className="px-3 py-2 w-24 text-center">Qty</th>
                                                <th className="px-3 py-2 w-10"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {lineItems.map((item, index) => (
                                                <tr key={item.id} className="hover:bg-muted/50">
                                                    <td className="px-3 py-2 text-center pt-3 text-muted-foreground">{index + 1}</td>
                                                    <td className="px-3 py-2 pt-2 relative">
                                                        <AsyncSelect 
                                                            options={itemOptions}
                                                            value={item.no} // PENTING: Value adalah 'no'
                                                            displayName={item.itemName}
                                                            onChange={(val, label) => updateLineItem(item.id, 'no', val)}
                                                            placeholder="Select Item..."
                                                            loading={loadingData}
                                                        />
                                                    </td>
                                                    <td className="px-3 py-2 pt-2">
                                                        <input
                                                            type="number"
                                                            min={1}
                                                            value={item.quantity}
                                                            onChange={(e) => updateLineItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                                        />
                                                    </td>
                                                    <td className="px-3 py-2 pt-3 text-center">
                                                        <button 
                                                            onClick={() => removeLineItem(item.id)}
                                                            className="p-1 hover:bg-destructive/10 text-destructive rounded transition-colors disabled:opacity-50"
                                                            disabled={lineItems.length <= 1}
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
                                    onClick={addLineItem}
                                    className="mt-2 text-sm text-primary hover:underline flex items-center gap-1 font-medium"
                                >
                                    <Plus className="w-4 h-4" /> Add Item
                                </button>
                            </div>

                            <div className="flex justify-end gap-3 pt-6">
                                <Button variant="outline">
                                    Cancel
                                </Button>
                                <Button onClick={handleSubmit} disabled={saving} className="min-w-[140px]">
                                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                    {saving ? "Saving..." : "Save Job Order"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* List Job Order Real Data */}
            <Card className="shadow-sm border-0">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Job Order List (Live)</CardTitle>
                        <CardDescription>50 data terbaru dari Accurate</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => fetchJobOrderList()} disabled={loadingList}>
                        <RefreshCcw className={cn("w-4 h-4 mr-2", loadingList && "animate-spin")} /> Refresh
                    </Button>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto rounded-lg border">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted text-muted-foreground font-semibold uppercase text-xs tracking-wider">
                                <tr>
                                    {/* KOLOM NOMOR URUT */}
                                    <th className="px-4 py-3 w-10 text-center">No.</th>
                                    <th className="px-4 py-3">JO Number</th>
                                    <th className="px-4 py-3">Date</th>
                                    <th className="px-4 py-3">Customer</th>
                                    <th className="px-4 py-3 hidden md:table-cell">Description</th>
                                    <th className="px-4 py-3 text-right">Value</th>
                                    <th className="px-4 py-3 text-center">Status</th>
                                    <th className="px-4 py-3 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border bg-card">
                                {loadingList ? (<tr><td colSpan={8} className="p-8 text-center text-muted-foreground"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2"/>Loading Data...</td></tr>) : jobOrderList.length === 0 ? (<tr><td colSpan={8} className="p-8 text-center text-muted-foreground">Tidak ada data.</td></tr>) : (
                                    jobOrderList.map((order, index) => (
                                        <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                                            {/* NOMOR URUT */}
                                            <td className="px-4 py-3 text-center text-muted-foreground">{index + 1}</td>
                                            
                                            <td className="px-4 py-3 font-medium text-primary">{order.number}</td>
                                            <td className="px-4 py-3 whitespace-nowrap">{order.transDate}</td>
                                            <td className="px-4 py-3">{order.customerName}</td>
                                            <td className="px-4 py-3 text-muted-foreground hidden md:table-cell truncate max-w-xs">{order.description}</td>
                                            <td className="px-4 py-3 text-right font-medium">{order.amount > 0 ? `Rp ${order.amount.toLocaleString('id-ID')}` : '-'}</td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={cn(
                                                    "px-2 py-1 rounded-full text-xs font-bold",
                                                    order.status === 'In Process' ? "bg-blue-100 text-blue-700" :
                                                    order.status === 'Closed' ? "bg-green-100 text-green-700" :
                                                    "bg-gray-100 text-gray-700"
                                                )}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                {/* ACTION VIEW DETAIL (HANYA INI YANG TERSISA) */}
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    onClick={() => setSelectedJobId(order.id)} 
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