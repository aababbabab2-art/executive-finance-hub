import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
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
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { title: "Dashboard", path: "/", icon: LayoutDashboard },
  { title: "Job Order", path: "/job-order", icon: ClipboardList },
  { title: "Kasbon/Biaya", path: "/kasbon", icon: Wallet },
  { title: "Sales Invoice", path: "/invoice", icon: FileText },
  { title: "Pelunasan Piutang", path: "/pelunasan", icon: CheckCircle },
  { title: "Penerimaan Lain", path: "/penerimaan", icon: ArrowDownCircle },
  { title: "Transfer Bank", path: "/transfer", icon: ArrowRightLeft },
  { title: "Laporan", path: "/laporan", icon: BarChart3 },
];

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const Sidebar = ({ collapsed, setCollapsed }: SidebarProps) => {
  const location = useLocation();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen transition-all duration-300 ease-in-out gradient-sidebar shadow-sidebar",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-sidebar-foreground/20 flex items-center justify-center">
              <span className="text-sidebar-foreground font-bold text-sm">AI</span>
            </div>
            <span className="text-sidebar-foreground font-semibold text-lg">Accurate</span>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 mx-auto rounded-lg bg-sidebar-foreground/20 flex items-center justify-center">
            <span className="text-sidebar-foreground font-bold text-sm">AI</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="mt-6 px-3 space-y-1 scrollbar-thin overflow-y-auto h-[calc(100vh-10rem)]">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                isActive
                  ? "bg-sidebar-foreground/20 text-sidebar-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-foreground/10 hover:text-sidebar-foreground"
              )}
            >
              <item.icon
                className={cn(
                  "w-5 h-5 flex-shrink-0 transition-transform duration-200",
                  isActive && "scale-110"
                )}
              />
              {!collapsed && (
                <span className="font-medium truncate">{item.title}</span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Collapse Button */}
      <div className="absolute bottom-4 left-0 right-0 px-3">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-foreground/10 hover:text-sidebar-foreground transition-all duration-200"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5" />
              <span className="font-medium">Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};
