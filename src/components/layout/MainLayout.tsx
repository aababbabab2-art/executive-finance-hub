import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { cn } from "@/lib/utils";

export const MainLayout = () => {
  // 1. State Sidebar dengan Persistence (LocalStorage)
  // Agar saat direfresh, posisi sidebar (besar/kecil) tetap tersimpan
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem("sidebarCollapsed");
    return saved ? JSON.parse(saved) : false;
  });

  // 2. State Mobile Menu
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Effect: Simpan preferensi sidebar ke LocalStorage setiap kali berubah
  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", JSON.stringify(sidebarCollapsed));
  }, [sidebarCollapsed]);

  // Effect: Otomatis tutup menu mobile saat user pindah halaman
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100">
      
      {/* Mobile Overlay (Layar gelap saat menu mobile terbuka) */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden backdrop-blur-sm transition-opacity animate-in fade-in"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Wrapper */}
      <div
        className={cn(
          "transition-all duration-300",
          // Logika Tampilan:
          // Mobile: Default hidden, muncul (block) jika mobileMenuOpen = true
          // Desktop: Selalu muncul (lg:block)
          mobileMenuOpen ? "fixed inset-y-0 left-0 z-40 block" : "hidden lg:block"
        )}
      >
        <Sidebar 
            // Props ke Sidebar:
            // Di Mobile: Sebaiknya sidebar selalu terbuka penuh (false) agar menu terbaca
            // Di Desktop: Ikuti state sidebarCollapsed user
            collapsed={typeof window !== 'undefined' && window.innerWidth < 1024 ? false : sidebarCollapsed} 
            setCollapsed={setSidebarCollapsed} 
        />
      </div>

      {/* Main Content Wrapper */}
      <div
        className={cn(
          "transition-all duration-300 ease-in-out min-h-screen flex flex-col",
          // Menggeser konten utama ke kanan sesuai lebar sidebar di Desktop
          sidebarCollapsed ? "lg:pl-16" : "lg:pl-64"
        )}
      >
        {/* Topbar */}
        <Topbar onMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)} />
        
        {/* Page Content Area */}
        <main className="flex-1 p-4 lg:p-6 overflow-x-hidden">
          <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};