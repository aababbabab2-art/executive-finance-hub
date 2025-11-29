import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom"; // Import useNavigate
import { Bell, ChevronDown, Menu, User, LogOut, Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

// Mapping nama route agar terlihat rapi di Breadcrumb
const routeNames: Record<string, string> = {
  "/": "Dashboard",
  "/job-order": "Job Order",
  "/kasbon": "Kasbon & Biaya",
  "/invoice": "Sales Invoice",
  "/pelunasan": "Pelunasan Piutang",
  "/penerimaan": "Penerimaan Lain",
  "/transfer": "Transfer Bank",
  "/laporan": "Laporan Keuangan",
  "/users": "Manajemen User",
};

interface TopbarProps {
  onMenuClick: () => void;
}

export const Topbar = ({ onMenuClick }: TopbarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Ambil data user dari LocalStorage (yang disimpan saat login)
  const user = JSON.parse(localStorage.getItem("acc_user") || "{}");

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Logika Logout
  const handleLogout = () => {
    localStorage.removeItem("acc_token");
    localStorage.removeItem("acc_user");
    
    toast({
        title: "Logout Berhasil",
        description: "Anda telah keluar dari sistem.",
    });
    
    navigate("/login");
  };

  // Logika Breadcrumbs
  const currentPath = location.pathname;
  const pageTitle = routeNames[currentPath] || "Halaman";
  
  return (
    <header className="sticky top-0 z-30 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex h-full items-center justify-between px-4 lg:px-6">
        
        {/* Left: Menu Toggle & Breadcrumbs */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>

          <nav className="hidden sm:flex items-center gap-2 text-sm">
            <span className="text-gray-500">App</span>
            <span className="text-gray-300">/</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {pageTitle}
            </span>
          </nav>
        </div>

        {/* Right: Status, Time, User Profile */}
        <div className="flex items-center gap-4 lg:gap-6">
          
          {/* System Status Indicator */}
          <div className="hidden md:flex items-center gap-2 bg-green-50 px-3 py-1 rounded-full border border-green-100">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-xs font-medium text-green-700">Online</span>
          </div>

          {/* Date & Time */}
          <div className="hidden sm:flex flex-col items-end text-sm">
            <span className="font-medium text-gray-800 dark:text-white">
              {currentTime.toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
            </span>
            <span className="text-xs text-gray-500">
              {currentTime.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>

          <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 hidden sm:block"></div>

          {/* User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 p-1 pr-2 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700 transition-all border border-transparent hover:border-gray-200">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-700 to-red-900 flex items-center justify-center shadow-sm text-white font-bold text-sm">
                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
                <div className="hidden md:flex flex-col items-start">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 leading-none">
                        {user.name || "User"}
                    </span>
                    <span className="text-[10px] text-gray-500 uppercase tracking-wide">
                        {user.role || "Staff"}
                    </span>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Akun Saya</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <User className="mr-2 h-4 w-4" /> Profil
              </DropdownMenuItem>
              {user.role === 'admin' && (
                  <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/users')}>
                    <Settings className="mr-2 h-4 w-4" /> Manajemen User
                  </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer hover:bg-red-50 focus:bg-red-50 focus:text-red-700">
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};