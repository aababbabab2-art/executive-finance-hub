import { useState } from "react";
import { Search, Plus, Filter, MoreHorizontal, Eye, Edit, Trash2, Printer, Send } from "lucide-react";
import { CardWithHeader } from "@/components/ui/CardWithHeader";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const invoices = [
  {
    id: "INV-2024-0001",
    customer: "PT Maju Jaya",
    date: "2024-01-15",
    dueDate: "2024-02-15",
    subtotal: "Rp 45.000.000",
    tax: "Rp 4.950.000",
    total: "Rp 49.950.000",
    status: "Paid",
  },
  {
    id: "INV-2024-0002",
    customer: "CV Sukses Mandiri",
    date: "2024-01-18",
    dueDate: "2024-02-18",
    subtotal: "Rp 32.500.000",
    tax: "Rp 3.575.000",
    total: "Rp 36.075.000",
    status: "Pending",
  },
  {
    id: "INV-2024-0003",
    customer: "PT Sentosa Abadi",
    date: "2024-01-20",
    dueDate: "2024-02-20",
    subtotal: "Rp 78.000.000",
    tax: "Rp 8.580.000",
    total: "Rp 86.580.000",
    status: "Paid",
  },
  {
    id: "INV-2024-0004",
    customer: "UD Berkah",
    date: "2024-01-10",
    dueDate: "2024-01-25",
    subtotal: "Rp 15.750.000",
    tax: "Rp 1.732.500",
    total: "Rp 17.482.500",
    status: "Overdue",
  },
  {
    id: "INV-2024-0005",
    customer: "PT Global Indonesia",
    date: "2024-01-22",
    dueDate: "2024-02-22",
    subtotal: "Rp 120.000.000",
    tax: "Rp 13.200.000",
    total: "Rp 133.200.000",
    status: "Sent",
  },
];

const InvoicePage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [invoiceItems, setInvoiceItems] = useState([
    { id: 1, description: "", qty: 1, price: "", total: "" },
  ]);

  const filteredInvoices = invoices.filter(
    (inv) =>
      inv.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Paid":
        return "bg-success/10 text-success";
      case "Pending":
        return "bg-warning/10 text-warning";
      case "Overdue":
        return "bg-destructive/10 text-destructive";
      case "Sent":
        return "bg-info/10 text-info";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const addItem = () => {
    setInvoiceItems([
      ...invoiceItems,
      { id: invoiceItems.length + 1, description: "", qty: 1, price: "", total: "" },
    ]);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Sales Invoice</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage customer invoices
          </p>
        </div>
        <button className="btn-gradient flex items-center gap-2 self-start">
          <Plus className="w-4 h-4" />
          New Invoice
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="metric-card">
          <p className="text-sm text-muted-foreground">Total Invoiced</p>
          <p className="text-2xl font-bold text-foreground mt-1">Rp 323.287.500</p>
        </div>
        <div className="metric-card">
          <p className="text-sm text-muted-foreground">Paid</p>
          <p className="text-2xl font-bold text-success mt-1">Rp 136.530.000</p>
        </div>
        <div className="metric-card">
          <p className="text-sm text-muted-foreground">Pending</p>
          <p className="text-2xl font-bold text-warning mt-1">Rp 169.275.000</p>
        </div>
        <div className="metric-card">
          <p className="text-sm text-muted-foreground">Overdue</p>
          <p className="text-2xl font-bold text-destructive mt-1">Rp 17.482.500</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search invoices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-floating pl-10"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-lg bg-card text-foreground hover:bg-muted transition-colors">
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      {/* Invoice Form */}
      <CardWithHeader title="Create Invoice" subtitle="Enter invoice details">
        <div className="space-y-6">
          {/* Header Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Invoice Number
                </label>
                <input
                  type="text"
                  placeholder="Auto-generated"
                  disabled
                  className="input-floating bg-muted"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Customer *
                </label>
                <select className="input-floating">
                  <option value="">Select customer</option>
                  <option value="maju">PT Maju Jaya</option>
                  <option value="sukses">CV Sukses Mandiri</option>
                  <option value="sentosa">PT Sentosa Abadi</option>
                </select>
                <p className="text-xs text-muted-foreground mt-1">
                  Select the customer for this invoice
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Reference Job Order
                </label>
                <select className="input-floating">
                  <option value="">Select job order (optional)</option>
                  <option value="jo1">JO-2024-001 - Website Development</option>
                  <option value="jo2">JO-2024-002 - ERP Implementation</option>
                </select>
              </div>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Invoice Date *
                  </label>
                  <input type="date" className="input-floating" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Due Date *
                  </label>
                  <input type="date" className="input-floating" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Payment Terms
                </label>
                <select className="input-floating">
                  <option value="net30">Net 30 Days</option>
                  <option value="net15">Net 15 Days</option>
                  <option value="cod">Cash on Delivery</option>
                  <option value="immediate">Immediate</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Additional notes for the invoice"
                  className="input-floating resize-none"
                />
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Invoice Items
            </label>
            <div className="overflow-x-auto border border-border rounded-lg">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted">
                    <th className="text-left py-3 px-3 text-sm font-medium text-muted-foreground">
                      #
                    </th>
                    <th className="text-left py-3 px-3 text-sm font-medium text-muted-foreground">
                      Description
                    </th>
                    <th className="text-center py-3 px-3 text-sm font-medium text-muted-foreground w-24">
                      Qty
                    </th>
                    <th className="text-right py-3 px-3 text-sm font-medium text-muted-foreground w-36">
                      Unit Price
                    </th>
                    <th className="text-right py-3 px-3 text-sm font-medium text-muted-foreground w-36">
                      Total
                    </th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceItems.map((item, index) => (
                    <tr key={item.id} className="border-t border-border">
                      <td className="py-2 px-3 text-sm text-muted-foreground">{index + 1}</td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          placeholder="Item description"
                          className="w-full px-2 py-1.5 border border-border rounded bg-background text-sm"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="number"
                          defaultValue={1}
                          min={1}
                          className="w-full px-2 py-1.5 border border-border rounded bg-background text-sm text-center"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          placeholder="0"
                          className="w-full px-2 py-1.5 border border-border rounded bg-background text-sm text-right"
                        />
                      </td>
                      <td className="py-2 px-3 text-sm text-foreground text-right font-medium">
                        Rp 0
                      </td>
                      <td className="py-2 px-3">
                        <button className="p-1 hover:bg-muted rounded text-destructive">
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
              className="mt-2 text-sm text-primary hover:underline flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Add Item
            </button>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-full max-w-xs space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground font-medium">Rp 0</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax (11%)</span>
                <span className="text-foreground font-medium">Rp 0</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t border-border pt-2">
                <span className="text-foreground">Total</span>
                <span className="text-primary">Rp 0</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button className="px-6 py-2.5 border border-border rounded-lg text-foreground hover:bg-muted transition-colors">
              Save as Draft
            </button>
            <button className="btn-gradient">Create Invoice</button>
          </div>
        </div>
      </CardWithHeader>

      {/* Invoice List */}
      <CardWithHeader title="Invoice List" subtitle="All sales invoices">
        <div className="overflow-x-auto">
          <table className="w-full table-striped table-hover">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-3 text-sm font-medium text-muted-foreground">
                  Invoice #
                </th>
                <th className="text-left py-3 px-3 text-sm font-medium text-muted-foreground">
                  Customer
                </th>
                <th className="text-left py-3 px-3 text-sm font-medium text-muted-foreground hidden md:table-cell">
                  Date
                </th>
                <th className="text-left py-3 px-3 text-sm font-medium text-muted-foreground hidden lg:table-cell">
                  Due Date
                </th>
                <th className="text-right py-3 px-3 text-sm font-medium text-muted-foreground">
                  Total
                </th>
                <th className="text-center py-3 px-3 text-sm font-medium text-muted-foreground">
                  Status
                </th>
                <th className="text-center py-3 px-3 text-sm font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="border-b border-border/50">
                  <td className="py-3 px-3 text-sm font-medium text-primary">{inv.id}</td>
                  <td className="py-3 px-3 text-sm text-foreground">{inv.customer}</td>
                  <td className="py-3 px-3 text-sm text-muted-foreground hidden md:table-cell">
                    {inv.date}
                  </td>
                  <td className="py-3 px-3 text-sm text-muted-foreground hidden lg:table-cell">
                    {inv.dueDate}
                  </td>
                  <td className="py-3 px-3 text-sm text-foreground text-right font-medium">
                    {inv.total}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(
                        inv.status
                      )}`}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-1 hover:bg-muted rounded">
                          <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="w-4 h-4 mr-2" /> View
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Printer className="w-4 h-4 mr-2" /> Print
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Send className="w-4 h-4 mr-2" /> Send
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="w-4 h-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardWithHeader>
    </div>
  );
};

export default InvoicePage;
