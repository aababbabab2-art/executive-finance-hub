import { useState } from "react";
import { Search, Plus, Filter, MoreHorizontal, Eye, Edit, Trash2, CheckCircle } from "lucide-react";
import { CardWithHeader } from "@/components/ui/CardWithHeader";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const pelunasanData = [
  {
    id: "PEL-2024-001",
    customer: "PT Maju Jaya",
    invoiceNo: "INV-2024-0001",
    invoiceAmount: "Rp 49.950.000",
    paidAmount: "Rp 49.950.000",
    paymentDate: "2024-02-10",
    method: "Bank Transfer",
    status: "Complete",
  },
  {
    id: "PEL-2024-002",
    customer: "CV Sukses Mandiri",
    invoiceNo: "INV-2024-0002",
    invoiceAmount: "Rp 36.075.000",
    paidAmount: "Rp 20.000.000",
    paymentDate: "2024-02-12",
    method: "Bank Transfer",
    status: "Partial",
  },
  {
    id: "PEL-2024-003",
    customer: "PT Sentosa Abadi",
    invoiceNo: "INV-2024-0003",
    invoiceAmount: "Rp 86.580.000",
    paidAmount: "Rp 86.580.000",
    paymentDate: "2024-02-15",
    method: "Cash",
    status: "Complete",
  },
  {
    id: "PEL-2024-004",
    customer: "UD Berkah",
    invoiceNo: "INV-2024-0004",
    invoiceAmount: "Rp 17.482.500",
    paidAmount: "Rp 0",
    paymentDate: "-",
    method: "-",
    status: "Unpaid",
  },
];

const outstandingInvoices = [
  { id: "INV-2024-0002", customer: "CV Sukses Mandiri", outstanding: "Rp 16.075.000", dueDate: "2024-02-18" },
  { id: "INV-2024-0004", customer: "UD Berkah", outstanding: "Rp 17.482.500", dueDate: "2024-01-25" },
  { id: "INV-2024-0005", customer: "PT Global Indonesia", outstanding: "Rp 133.200.000", dueDate: "2024-02-22" },
];

const PelunasanPage = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredData = pelunasanData.filter(
    (item) =>
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Complete":
        return "bg-success/10 text-success";
      case "Partial":
        return "bg-warning/10 text-warning";
      case "Unpaid":
        return "bg-destructive/10 text-destructive";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pelunasan Piutang</h1>
          <p className="text-muted-foreground mt-1">
            Record and manage receivable payments
          </p>
        </div>
        <button className="btn-gradient flex items-center gap-2 self-start">
          <Plus className="w-4 h-4" />
          Record Payment
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="metric-card">
          <p className="text-sm text-muted-foreground">Total Receivables</p>
          <p className="text-2xl font-bold text-foreground mt-1">Rp 190.087.500</p>
          <p className="text-xs text-muted-foreground mt-2">From 5 invoices</p>
        </div>
        <div className="metric-card">
          <p className="text-sm text-muted-foreground">Collected This Month</p>
          <p className="text-2xl font-bold text-success mt-1">Rp 156.530.000</p>
          <p className="text-xs text-muted-foreground mt-2">82.3% collection rate</p>
        </div>
        <div className="metric-card">
          <p className="text-sm text-muted-foreground">Outstanding</p>
          <p className="text-2xl font-bold text-destructive mt-1">Rp 166.757.500</p>
          <p className="text-xs text-muted-foreground mt-2">3 pending payments</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search payments..."
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

      {/* Payment Form */}
      <CardWithHeader title="Record Payment" subtitle="Enter receivable payment details">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Payment Number
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
                <option value="sukses">CV Sukses Mandiri</option>
                <option value="berkah">UD Berkah</option>
                <option value="global">PT Global Indonesia</option>
              </select>
              <p className="text-xs text-muted-foreground mt-1">
                Select customer with outstanding invoices
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Invoice Number *
              </label>
              <select className="input-floating">
                <option value="">Select invoice to settle</option>
                <option value="inv2">INV-2024-0002 - Rp 16.075.000 outstanding</option>
                <option value="inv4">INV-2024-0004 - Rp 17.482.500 outstanding</option>
                <option value="inv5">INV-2024-0005 - Rp 133.200.000 outstanding</option>
              </select>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Payment Date *
              </label>
              <input type="date" className="input-floating" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Amount Received *
              </label>
              <input
                type="text"
                placeholder="Enter payment amount"
                className="input-floating"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enter the exact amount received from customer
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Payment Method *
              </label>
              <select className="input-floating">
                <option value="transfer">Bank Transfer</option>
                <option value="cash">Cash</option>
                <option value="check">Check</option>
                <option value="card">Credit/Debit Card</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Bank Account (for Transfer)
              </label>
              <select className="input-floating">
                <option value="">Select receiving bank account</option>
                <option value="bca">BCA - 1234567890</option>
                <option value="mandiri">Mandiri - 0987654321</option>
              </select>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button className="px-6 py-2.5 border border-border rounded-lg text-foreground hover:bg-muted transition-colors">
                Cancel
              </button>
              <button className="btn-gradient">Record Payment</button>
            </div>
          </div>
        </div>
      </CardWithHeader>

      {/* Outstanding Invoices */}
      <CardWithHeader title="Outstanding Invoices" subtitle="Invoices awaiting payment">
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
                <th className="text-right py-3 px-3 text-sm font-medium text-muted-foreground">
                  Outstanding
                </th>
                <th className="text-center py-3 px-3 text-sm font-medium text-muted-foreground">
                  Due Date
                </th>
                <th className="text-center py-3 px-3 text-sm font-medium text-muted-foreground">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {outstandingInvoices.map((inv) => (
                <tr key={inv.id} className="border-b border-border/50">
                  <td className="py-3 px-3 text-sm font-medium text-primary">{inv.id}</td>
                  <td className="py-3 px-3 text-sm text-foreground">{inv.customer}</td>
                  <td className="py-3 px-3 text-sm text-destructive text-right font-medium">
                    {inv.outstanding}
                  </td>
                  <td className="py-3 px-3 text-sm text-muted-foreground text-center">
                    {inv.dueDate}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <button className="px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors">
                      Record Payment
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardWithHeader>

      {/* Payment History */}
      <CardWithHeader title="Payment History" subtitle="All recorded payments">
        <div className="overflow-x-auto">
          <table className="w-full table-striped table-hover">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-3 text-sm font-medium text-muted-foreground">
                  Payment #
                </th>
                <th className="text-left py-3 px-3 text-sm font-medium text-muted-foreground">
                  Customer
                </th>
                <th className="text-left py-3 px-3 text-sm font-medium text-muted-foreground hidden md:table-cell">
                  Invoice
                </th>
                <th className="text-right py-3 px-3 text-sm font-medium text-muted-foreground hidden lg:table-cell">
                  Invoice Amt
                </th>
                <th className="text-right py-3 px-3 text-sm font-medium text-muted-foreground">
                  Paid
                </th>
                <th className="text-center py-3 px-3 text-sm font-medium text-muted-foreground hidden md:table-cell">
                  Method
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
              {filteredData.map((item) => (
                <tr key={item.id} className="border-b border-border/50">
                  <td className="py-3 px-3 text-sm font-medium text-primary">{item.id}</td>
                  <td className="py-3 px-3 text-sm text-foreground">{item.customer}</td>
                  <td className="py-3 px-3 text-sm text-muted-foreground hidden md:table-cell">
                    {item.invoiceNo}
                  </td>
                  <td className="py-3 px-3 text-sm text-muted-foreground text-right hidden lg:table-cell">
                    {item.invoiceAmount}
                  </td>
                  <td className="py-3 px-3 text-sm text-foreground text-right font-medium">
                    {item.paidAmount}
                  </td>
                  <td className="py-3 px-3 text-sm text-muted-foreground text-center hidden md:table-cell">
                    {item.method}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(
                        item.status
                      )}`}
                    >
                      {item.status}
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

export default PelunasanPage;
