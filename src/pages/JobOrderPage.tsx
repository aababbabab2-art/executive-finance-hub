import { useState } from "react";
import { Search, Plus, Filter, MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react";
import { CardWithHeader } from "@/components/ui/CardWithHeader";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const jobOrders = [
  {
    id: "JO-2024-001",
    customer: "PT Maju Jaya",
    description: "Website Development Project",
    startDate: "2024-01-15",
    endDate: "2024-03-15",
    value: "Rp 150.000.000",
    status: "In Progress",
    progress: 65,
  },
  {
    id: "JO-2024-002",
    customer: "CV Sukses Mandiri",
    description: "ERP Implementation",
    startDate: "2024-02-01",
    endDate: "2024-06-30",
    value: "Rp 450.000.000",
    status: "In Progress",
    progress: 30,
  },
  {
    id: "JO-2024-003",
    customer: "PT Sentosa Abadi",
    description: "Network Infrastructure Setup",
    startDate: "2024-01-05",
    endDate: "2024-02-28",
    value: "Rp 85.000.000",
    status: "Completed",
    progress: 100,
  },
  {
    id: "JO-2024-004",
    customer: "UD Berkah",
    description: "POS System Installation",
    startDate: "2024-03-01",
    endDate: "2024-03-31",
    value: "Rp 25.000.000",
    status: "Pending",
    progress: 0,
  },
  {
    id: "JO-2024-005",
    customer: "PT Global Indonesia",
    description: "Cloud Migration Services",
    startDate: "2024-02-15",
    endDate: "2024-05-15",
    value: "Rp 320.000.000",
    status: "In Progress",
    progress: 45,
  },
];

const JobOrderPage = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredOrders = jobOrders.filter(
    (order) =>
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Job Order</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track all job orders
          </p>
        </div>
        <button className="btn-gradient flex items-center gap-2 self-start">
          <Plus className="w-4 h-4" />
          New Job Order
        </button>
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
            className="input-floating pl-10"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-lg bg-card text-foreground hover:bg-muted transition-colors">
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      {/* Job Order Form */}
      <CardWithHeader title="Create Job Order" subtitle="Enter job order details">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Job Order Number
              </label>
              <input
                type="text"
                placeholder="Auto-generated"
                disabled
                className="input-floating bg-muted"
              />
              <p className="text-xs text-muted-foreground mt-1">
                System will generate this automatically
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Customer Name *
              </label>
              <input
                type="text"
                placeholder="Select or enter customer name"
                className="input-floating"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Choose from existing customers or add new
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Project Description *
              </label>
              <textarea
                rows={3}
                placeholder="Describe the project scope and deliverables"
                className="input-floating resize-none"
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Start Date *
                </label>
                <input type="date" className="input-floating" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  End Date *
                </label>
                <input type="date" className="input-floating" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Contract Value *
              </label>
              <input
                type="text"
                placeholder="Enter contract value (e.g., 100.000.000)"
                className="input-floating"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Total contract value in Rupiah
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Status
              </label>
              <select className="input-floating">
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button className="px-6 py-2.5 border border-border rounded-lg text-foreground hover:bg-muted transition-colors">
                Cancel
              </button>
              <button className="btn-gradient">Save Job Order</button>
            </div>
          </div>
        </div>
      </CardWithHeader>

      {/* Job Orders Table */}
      <CardWithHeader title="Job Order List" subtitle="All job orders in the system">
        <div className="overflow-x-auto">
          <table className="w-full table-striped table-hover">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-3 text-sm font-medium text-muted-foreground">
                  JO Number
                </th>
                <th className="text-left py-3 px-3 text-sm font-medium text-muted-foreground">
                  Customer
                </th>
                <th className="text-left py-3 px-3 text-sm font-medium text-muted-foreground hidden md:table-cell">
                  Description
                </th>
                <th className="text-left py-3 px-3 text-sm font-medium text-muted-foreground hidden lg:table-cell">
                  Period
                </th>
                <th className="text-right py-3 px-3 text-sm font-medium text-muted-foreground">
                  Value
                </th>
                <th className="text-center py-3 px-3 text-sm font-medium text-muted-foreground">
                  Progress
                </th>
                <th className="text-center py-3 px-3 text-sm font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} className="border-b border-border/50">
                  <td className="py-3 px-3 text-sm font-medium text-primary">{order.id}</td>
                  <td className="py-3 px-3 text-sm text-foreground">{order.customer}</td>
                  <td className="py-3 px-3 text-sm text-muted-foreground hidden md:table-cell">
                    {order.description}
                  </td>
                  <td className="py-3 px-3 text-sm text-muted-foreground hidden lg:table-cell">
                    {order.startDate} - {order.endDate}
                  </td>
                  <td className="py-3 px-3 text-sm text-foreground text-right font-medium">
                    {order.value}
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-primary"
                          style={{ width: `${order.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-10">
                        {order.progress}%
                      </span>
                    </div>
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

export default JobOrderPage;
