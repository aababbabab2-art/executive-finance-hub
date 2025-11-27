import { useState } from "react";
import { Search, Plus, Filter, MoreHorizontal, Eye, Edit, Trash2, CheckCircle, XCircle } from "lucide-react";
import { CardWithHeader } from "@/components/ui/CardWithHeader";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const kasbonData = [
  {
    id: "KSB-2024-001",
    employee: "Ahmad Fauzi",
    department: "Marketing",
    amount: "Rp 5.000.000",
    purpose: "Client Meeting Expenses",
    requestDate: "2024-01-15",
    status: "Approved",
  },
  {
    id: "KSB-2024-002",
    employee: "Siti Nurhaliza",
    department: "Operations",
    amount: "Rp 3.500.000",
    purpose: "Office Supplies",
    requestDate: "2024-01-18",
    status: "Pending",
  },
  {
    id: "KSB-2024-003",
    employee: "Budi Santoso",
    department: "IT",
    amount: "Rp 8.000.000",
    purpose: "Hardware Purchase",
    requestDate: "2024-01-20",
    status: "Approved",
  },
  {
    id: "KSB-2024-004",
    employee: "Dewi Lestari",
    department: "HR",
    amount: "Rp 2.500.000",
    purpose: "Training Materials",
    requestDate: "2024-01-22",
    status: "Rejected",
  },
  {
    id: "KSB-2024-005",
    employee: "Rudi Hartono",
    department: "Sales",
    amount: "Rp 10.000.000",
    purpose: "Travel Expenses",
    requestDate: "2024-01-25",
    status: "Pending",
  },
];

const KasbonPage = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredData = kasbonData.filter(
    (item) =>
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.employee.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.purpose.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-success/10 text-success";
      case "Pending":
        return "bg-warning/10 text-warning";
      case "Rejected":
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
          <h1 className="text-2xl font-bold text-foreground">Kasbon / Biaya</h1>
          <p className="text-muted-foreground mt-1">
            Manage employee cash advances and expenses
          </p>
        </div>
        <button className="btn-gradient flex items-center gap-2 self-start">
          <Plus className="w-4 h-4" />
          New Kasbon Request
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="metric-card">
          <p className="text-sm text-muted-foreground">Total Outstanding</p>
          <p className="text-2xl font-bold text-foreground mt-1">Rp 28.500.000</p>
          <p className="text-xs text-muted-foreground mt-2">5 active requests</p>
        </div>
        <div className="metric-card">
          <p className="text-sm text-muted-foreground">Pending Approval</p>
          <p className="text-2xl font-bold text-warning mt-1">Rp 13.500.000</p>
          <p className="text-xs text-muted-foreground mt-2">2 requests waiting</p>
        </div>
        <div className="metric-card">
          <p className="text-sm text-muted-foreground">Settled This Month</p>
          <p className="text-2xl font-bold text-success mt-1">Rp 45.000.000</p>
          <p className="text-xs text-muted-foreground mt-2">12 settled</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search kasbon requests..."
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

      {/* Kasbon Form */}
      <CardWithHeader title="New Kasbon Request" subtitle="Submit a cash advance request">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Request Number
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
                Employee Name *
              </label>
              <select className="input-floating">
                <option value="">Select employee</option>
                <option value="ahmad">Ahmad Fauzi - Marketing</option>
                <option value="siti">Siti Nurhaliza - Operations</option>
                <option value="budi">Budi Santoso - IT</option>
              </select>
              <p className="text-xs text-muted-foreground mt-1">
                Select the employee requesting the advance
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Amount Requested *
              </label>
              <input
                type="text"
                placeholder="Enter amount (e.g., 5.000.000)"
                className="input-floating"
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Request Date *
              </label>
              <input type="date" className="input-floating" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Purpose / Description *
              </label>
              <textarea
                rows={3}
                placeholder="Explain the purpose of this cash advance"
                className="input-floating resize-none"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Provide clear justification for approval
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Payment Method
              </label>
              <select className="input-floating">
                <option value="cash">Cash</option>
                <option value="transfer">Bank Transfer</option>
              </select>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button className="px-6 py-2.5 border border-border rounded-lg text-foreground hover:bg-muted transition-colors">
                Cancel
              </button>
              <button className="btn-gradient">Submit Request</button>
            </div>
          </div>
        </div>
      </CardWithHeader>

      {/* Kasbon List */}
      <CardWithHeader title="Kasbon Requests" subtitle="All cash advance requests">
        <div className="overflow-x-auto">
          <table className="w-full table-striped table-hover">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-3 text-sm font-medium text-muted-foreground">
                  Request ID
                </th>
                <th className="text-left py-3 px-3 text-sm font-medium text-muted-foreground">
                  Employee
                </th>
                <th className="text-left py-3 px-3 text-sm font-medium text-muted-foreground hidden md:table-cell">
                  Department
                </th>
                <th className="text-left py-3 px-3 text-sm font-medium text-muted-foreground hidden lg:table-cell">
                  Purpose
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
                  <td className="py-3 px-3 text-sm text-foreground">{item.employee}</td>
                  <td className="py-3 px-3 text-sm text-muted-foreground hidden md:table-cell">
                    {item.department}
                  </td>
                  <td className="py-3 px-3 text-sm text-muted-foreground hidden lg:table-cell">
                    {item.purpose}
                  </td>
                  <td className="py-3 px-3 text-sm text-foreground text-right font-medium">
                    {item.amount}
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
                          <CheckCircle className="w-4 h-4 mr-2" /> Approve
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <XCircle className="w-4 h-4 mr-2" /> Reject
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

export default KasbonPage;
