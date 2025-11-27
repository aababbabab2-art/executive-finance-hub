import { useState } from "react";
import { Search, Plus, Filter, MoreHorizontal, Eye, Edit, Trash2, ArrowRight } from "lucide-react";
import { CardWithHeader } from "@/components/ui/CardWithHeader";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const transferData = [
  {
    id: "TRF-2024-001",
    fromAccount: "BCA - 1234567890",
    toAccount: "Mandiri - 0987654321",
    amount: "Rp 50.000.000",
    date: "2024-01-28",
    description: "Operational fund transfer",
    status: "Completed",
  },
  {
    id: "TRF-2024-002",
    fromAccount: "Mandiri - 0987654321",
    toAccount: "BRI - 5432167890",
    amount: "Rp 25.000.000",
    date: "2024-01-25",
    description: "Payroll fund allocation",
    status: "Completed",
  },
  {
    id: "TRF-2024-003",
    fromAccount: "BCA - 1234567890",
    toAccount: "BRI - 5432167890",
    amount: "Rp 100.000.000",
    date: "2024-01-22",
    description: "Project fund transfer",
    status: "Completed",
  },
  {
    id: "TRF-2024-004",
    fromAccount: "BRI - 5432167890",
    toAccount: "BCA - 1234567890",
    amount: "Rp 15.000.000",
    date: "2024-01-20",
    description: "Petty cash replenishment",
    status: "Completed",
  },
  {
    id: "TRF-2024-005",
    fromAccount: "Mandiri - 0987654321",
    toAccount: "BCA - 1234567890",
    amount: "Rp 75.000.000",
    date: "2024-01-18",
    description: "Investment returns transfer",
    status: "Pending",
  },
];

const bankAccounts = [
  { id: "bca", name: "BCA", number: "1234567890", balance: "Rp 850.000.000" },
  { id: "mandiri", name: "Mandiri", number: "0987654321", balance: "Rp 425.000.000" },
  { id: "bri", name: "BRI", number: "5432167890", balance: "Rp 175.000.000" },
];

const TransferPage = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredData = transferData.filter(
    (item) =>
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.fromAccount.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.toAccount.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Transfer Bank</h1>
          <p className="text-muted-foreground mt-1">
            Manage inter-bank transfers
          </p>
        </div>
        <button className="btn-gradient flex items-center gap-2 self-start">
          <Plus className="w-4 h-4" />
          New Transfer
        </button>
      </div>

      {/* Bank Account Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {bankAccounts.map((account) => (
          <div key={account.id} className="metric-card">
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
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search transfers..."
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

      {/* Transfer Form */}
      <CardWithHeader title="New Bank Transfer" subtitle="Transfer funds between accounts">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Transfer Number
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
                Source Account *
              </label>
              <select className="input-floating">
                <option value="">Select source bank account</option>
                {bankAccounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name} - {account.number} ({account.balance})
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground mt-1">
                The account from which funds will be transferred
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Destination Account *
              </label>
              <select className="input-floating">
                <option value="">Select destination bank account</option>
                {bankAccounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name} - {account.number}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground mt-1">
                The account to which funds will be transferred
              </p>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Transfer Date *
              </label>
              <input type="date" className="input-floating" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Transfer Amount *
              </label>
              <input
                type="text"
                placeholder="Enter transfer amount"
                className="input-floating"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Amount to transfer in Rupiah
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Description *
              </label>
              <textarea
                rows={3}
                placeholder="Purpose of the transfer"
                className="input-floating resize-none"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button className="px-6 py-2.5 border border-border rounded-lg text-foreground hover:bg-muted transition-colors">
                Cancel
              </button>
              <button className="btn-gradient">Process Transfer</button>
            </div>
          </div>
        </div>
      </CardWithHeader>

      {/* Transfer History */}
      <CardWithHeader title="Transfer History" subtitle="All bank transfer records">
        <div className="overflow-x-auto">
          <table className="w-full table-striped table-hover">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-3 text-sm font-medium text-muted-foreground">
                  Transfer #
                </th>
                <th className="text-left py-3 px-3 text-sm font-medium text-muted-foreground">
                  From / To
                </th>
                <th className="text-left py-3 px-3 text-sm font-medium text-muted-foreground hidden lg:table-cell">
                  Description
                </th>
                <th className="text-left py-3 px-3 text-sm font-medium text-muted-foreground hidden md:table-cell">
                  Date
                </th>
                <th className="text-right py-3 px-3 text-sm font-medium text-muted-foreground">
                  Amount
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
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">{item.fromAccount.split(" - ")[0]}</span>
                      <ArrowRight className="w-4 h-4 text-primary" />
                      <span className="text-foreground font-medium">{item.toAccount.split(" - ")[0]}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-sm text-muted-foreground hidden lg:table-cell">
                    {item.description}
                  </td>
                  <td className="py-3 px-3 text-sm text-muted-foreground hidden md:table-cell">
                    {item.date}
                  </td>
                  <td className="py-3 px-3 text-sm text-foreground text-right font-medium">
                    {item.amount}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        item.status === "Completed"
                          ? "bg-success/10 text-success"
                          : "bg-warning/10 text-warning"
                      }`}
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

export default TransferPage;
