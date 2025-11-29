import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardList,
  Wallet,
  FileText,
  CheckCircle,
  ArrowDownCircle,
  ArrowRightLeft,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";

// Daftar Menu Navigasi
const navItems = [
  { title: "Dashboard", path: "/", icon: LayoutDashboard },
  { title: "Job Order", path: "/job-order", icon: ClipboardList },
  { title: "Kasbon & Biaya", path: "/kasbon", icon: Wallet },
  { title: "Sales Invoice", path: "/invoice", icon: FileText },
  // { title: "Pelunasan Piutang", path: "/pelunasan", icon: CheckCircle },
  { title: "Penerimaan Lain", path: "/penerimaan", icon: ArrowDownCircle },
  { title: "Transfer Bank", path: "/transfer", icon: ArrowRightLeft },
  { title: "Laporan", path: "/laporan", icon: BarChart3 },
];

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const Sidebar = ({ collapsed, setCollapsed }: SidebarProps) => {
  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen transition-all duration-300 ease-in-out bg-[#7F1D1D] text-white shadow-xl flex flex-col",
        // Menggunakan warna Maroon (#7F1D1D) sesuai request prompt design
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Sidebar Header / Logo */}
      <div className="flex h-16 items-center justify-between px-4 bg-black/10">
        {!collapsed && (
          <div className="flex items-center gap-3 animate-in fade-in duration-300">
            <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center border border-white/20">
              <span className="font-bold text-sm">AS</span>
            </div>
            <span className="font-semibold text-lg tracking-tight">Accurate Sys</span>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 mx-auto rounded bg-white/10 flex items-center justify-center border border-white/20">
            <span className="font-bold text-sm">AS</span>
          </div>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 mt-4 px-2 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group relative",
                isActive
                  ? "bg-white text-[#7F1D1D] shadow-md font-medium"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              )
            }
          >
            <item.icon
              className={cn(
                "w-5 h-5 flex-shrink-0 transition-transform duration-200",
              )}
            />
            
            {!collapsed && (
              <span className="truncate text-sm">{item.title}</span>
            )}

            {/* Tooltip saat collapsed */}
            {collapsed && (
                <div className="absolute left-14 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                    {item.title}
                </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Collapse Toggle Button (Footer) */}
      <div className="p-4 border-t border-white/10 bg-black/5">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 p-2 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          {!collapsed && <span className="text-sm font-medium">Minimize Menu</span>}
        </button>
      </div>
    </aside>
  );
};