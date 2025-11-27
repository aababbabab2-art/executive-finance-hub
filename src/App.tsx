import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "./components/layout/MainLayout";
import DashboardPage from "./pages/DashboardPage";
import JobOrderPage from "./pages/JobOrderPage";
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
          <Route element={<MainLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/job-order" element={<JobOrderPage />} />
            <Route path="/kasbon" element={<KasbonPage />} />
            <Route path="/invoice" element={<InvoicePage />} />
            <Route path="/pelunasan" element={<PelunasanPage />} />
            <Route path="/penerimaan" element={<PenerimaanPage />} />
            <Route path="/transfer" element={<TransferPage />} />
            <Route path="/laporan" element={<LaporanPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
