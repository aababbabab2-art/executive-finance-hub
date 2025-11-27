import { useState } from "react";
import { Search, Plus, Filter, MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react";
import { CardWithHeader } from "@/components/ui/CardWithHeader";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const penerimaanData = [
  {
    id: "PNR-2024-001",
    description: "Interest Income - BCA",
    category: "Bank Interest",
    amount: "Rp 1.250.000",
    date: "2024-01-31",
    account: "BCA - 1234567890",
    notes: "Monthly interest income",
  },
  {
    id: "PNR-2024-002",
    description: "Dividend Income - PT XYZ",
    category: "Investment",
    amount: "Rp 15.000.000",
    date: "2024-01-28",
    account: "Mandiri - 0987654321",
    notes: "Annual dividend payment",
  },
  {
    id: "PNR-2024-003",
    description: "Rental Income - Office Space",
    category: "Rental",
    amount: "Rp 8.500.000",
    date: "2024-01-25",
    account: "BCA - 1234567890",
    notes: "Monthly rental payment from tenant",
  },
  {
    id: "PNR-2024-004",
    description: "Tax Refund",
    category: "Tax",
    amount: "Rp 3.200.000",
    date: "2024-01-20",
    account: "Mandiri - 0987654321",
    notes: "PPh 23 refund",
  },
  {
    id: "PNR-2024-005",
    description: "Insurance Claim",
    category: "Insurance",
    amount: "Rp 25.000.000",
    date: "2024-01-15",
    account: "BCA - 1234567890",
    notes: "Vehicle insurance claim settlement",
  },
];

const categories = [
  "Bank Interest",
  "Investment",
  "Rental",
  "Tax",
  "Insurance",
  "Other Income",
];

const PenerimaanPage = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredData = penerimaanData.filter(
    (item) =>
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Bank Interest":
        return "bg-info/10 text-info";
      case "Investment":
        return "bg-success/10 text-success";
      case "Rental":
        return "bg-warning/10 text-warning";
      case "Tax":
        return "bg-primary/10 text-primary";
      case "Insurance":
        return "bg-secondary/10 text-secondary";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Penerimaan Lain</h1>
          <p className="text-muted-foreground mt-1">
            Record other income and receipts
          </p>
        </div>
        <button className="btn-gradient flex items-center gap-2 self-start">
          <Plus className="w-4 h-4" />
          New Receipt
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="metric-card">
          <p className="text-sm text-muted-foreground">Total This Month</p>
          <p className="text-2xl font-bold text-foreground mt-1">Rp 52.950.000</p>
        </div>
        <div className="metric-card">
          <p className="text-sm text-muted-foreground">Bank Interest</p>
          <p className="text-2xl font-bold text-info mt-1">Rp 1.250.000</p>
        </div>
        <div className="metric-card">
          <p className="text-sm text-muted-foreground">Investment Income</p>
          <p className="text-2xl font-bold text-success mt-1">Rp 15.000.000</p>
        </div>
        <div className="metric-card">
          <p className="text-sm text-muted-foreground">Other Income</p>
          <p className="text-2xl font-bold text-primary mt-1">Rp 36.700.000</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search receipts..."
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

      {/* Receipt Form */}
      <CardWithHeader title="Record New Receipt" subtitle="Enter receipt details">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Receipt Number
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
                Description *
              </label>
              <input
                type="text"
                placeholder="Enter receipt description"
                className="input-floating"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Brief description of the income source
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Category *
              </label>
              <select className="input-floating">
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat.toLowerCase().replace(" ", "-")}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Notes
              </label>
              <textarea
                rows={3}
                placeholder="Additional notes (optional)"
                className="input-floating resize-none"
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Receipt Date *
              </label>
              <input type="date" className="input-floating" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Amount *
              </label>
              <input
                type="text"
                placeholder="Enter amount received"
                className="input-floating"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Total amount received in Rupiah
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Receiving Account *
              </label>
              <select className="input-floating">
                <option value="">Select bank account</option>
                <option value="bca">BCA - 1234567890</option>
                <option value="mandiri">Mandiri - 0987654321</option>
                <option value="bri">BRI - 5432167890</option>
              </select>
              <p className="text-xs text-muted-foreground mt-1">
                Bank account where the funds were received
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Reference Number
              </label>
              <input
                type="text"
                placeholder="External reference (optional)"
                className="input-floating"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button className="px-6 py-2.5 border border-border rounded-lg text-foreground hover:bg-muted transition-colors">
                Cancel
              </button>
              <button className="btn-gradient">Save Receipt</button>
            </div>
          </div>
        </div>
      </CardWithHeader>

      {/* Receipt List */}
      <CardWithHeader title="Receipt History" subtitle="All recorded receipts">
        <div className="overflow-x-auto">
          <table className="w-full table-striped table-hover">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-3 text-sm font-medium text-muted-foreground">
                  Receipt #
                </th>
                <th className="text-left py-3 px-3 text-sm font-medium text-muted-foreground">
                  Description
                </th>
                <th className="text-center py-3 px-3 text-sm font-medium text-muted-foreground">
                  Category
                </th>
                <th className="text-left py-3 px-3 text-sm font-medium text-muted-foreground hidden md:table-cell">
                  Date
                </th>
                <th className="text-left py-3 px-3 text-sm font-medium text-muted-foreground hidden lg:table-cell">
                  Account
                </th>
                <th className="text-right py-3 px-3 text-sm font-medium text-muted-foreground">
                  Amount
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
                  <td className="py-3 px-3 text-sm text-foreground">{item.description}</td>
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(
                        item.category
                      )}`}
                    >
                      {item.category}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-sm text-muted-foreground hidden md:table-cell">
                    {item.date}
                  </td>
                  <td className="py-3 px-3 text-sm text-muted-foreground hidden lg:table-cell">
                    {item.account}
                  </td>
                  <td className="py-3 px-3 text-sm text-success text-right font-medium">
                    {item.amount}
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

export default PenerimaanPage;
