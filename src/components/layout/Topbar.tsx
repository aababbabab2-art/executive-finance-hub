import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Bell, ChevronDown, Menu, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const routeNames: Record<string, string> = {
  "/": "Dashboard",
  "/job-order": "Job Order",
  "/kasbon": "Kasbon/Biaya",
  "/invoice": "Sales Invoice",
  "/pelunasan": "Pelunasan Piutang",
  "/penerimaan": "Penerimaan Lain",
  "/transfer": "Transfer Bank",
  "/laporan": "Laporan",
};

interface TopbarProps {
  onMenuClick: () => void;
}

export const Topbar = ({ onMenuClick }: TopbarProps) => {
  const location = useLocation();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const currentRoute = routeNames[location.pathname] || "Page";
  const breadcrumbs = location.pathname === "/" 
    ? ["Home", "Dashboard"] 
    : ["Home", currentRoute];

  return (
    <header className="sticky top-0 z-30 h-16 bg-card border-b border-border shadow-sm">
      <div className="flex h-full items-center justify-between px-4 lg:px-6">
        {/* Left: Menu & Breadcrumbs */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <Menu className="w-5 h-5 text-foreground" />
          </button>

          <nav className="hidden sm:flex items-center gap-2 text-sm">
            {breadcrumbs.map((crumb, index) => (
              <span key={index} className="flex items-center gap-2">
                {index > 0 && <span className="text-muted-foreground">/</span>}
                <span
                  className={
                    index === breadcrumbs.length - 1
                      ? "text-foreground font-medium"
                      : "text-muted-foreground"
                  }
                >
                  {crumb}
                </span>
              </span>
            ))}
          </nav>
        </div>

        {/* Right: Status, Time, Profile */}
        <div className="flex items-center gap-4 lg:gap-6">
          {/* System Status */}
          <div className="hidden md:flex status-online">
            <span className="status-dot" />
            <span>API Connected</span>
          </div>

          {/* Date & Time */}
          <div className="hidden sm:flex flex-col items-end text-sm">
            <span className="font-medium text-foreground">
              {currentTime.toLocaleDateString("id-ID", {
                weekday: "short",
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
            <span className="text-muted-foreground">
              {currentTime.toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </span>
          </div>

          {/* Notifications */}
          <button className="relative p-2 rounded-lg hover:bg-muted transition-colors">
            <Bell className="w-5 h-5 text-muted-foreground" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
          </button>

          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <User className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="hidden md:block font-medium text-foreground">Admin</span>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
