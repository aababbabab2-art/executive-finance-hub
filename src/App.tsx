import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Layout & Auth Components
import { MainLayout } from "./components/layout/MainLayout";
import { ProtectedRoute } from "./components/ProtectedRoute"; // Pastikan file ini ada

// Pages
import { LoginPage } from "./pages/LoginPage"; // Halaman Login
import { UserSettingPage } from "./pages/UserSettingPage"; // Halaman Setting User
import { DashboardPage } from "./pages/DashboardPage";
import { JobOrderPage } from "@/pages/JobOrderPage";
import KasbonPage from "./pages/KasbonPage";
import InvoicePage from "./pages/InvoicePage";
import PelunasanPage from "./pages/PelunasanPage";
import PenerimaanPage from "./pages/PenerimaanPage";
import TransferPage from "./pages/TransferPage";
import LaporanPage from "./pages/LaporanPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* PUBLIC ROUTE: LOGIN (Tidak perlu Layout/Sidebar) */}
          <Route path="/login" element={<LoginPage />} />

          {/* PROTECTED ROUTES: Semua halaman yang butuh Login & Sidebar */}
          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<DashboardPage />} />
            <Route path="/job-order" element={<JobOrderPage />} />
            <Route path="/kasbon" element={<KasbonPage />} />
            <Route path="/invoice" element={<InvoicePage />} />
            <Route path="/pelunasan" element={<PelunasanPage />} />
            <Route path="/penerimaan" element={<PenerimaanPage />} />
            <Route path="/transfer" element={<TransferPage />} />
            <Route path="/laporan" element={<LaporanPage />} />
            
            {/* Menu Setting User (Baru) */}
            <Route path="/users" element={<UserSettingPage />} />
          </Route>

          {/* 404 Not Found */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;