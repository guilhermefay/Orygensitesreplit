import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "sonner";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import PlanPage from "./components/PlanPage";
import TestePayment from "./pages/TestePayment";
import PaymentTest from "./pages/PaymentTest";
import { LanguageProvider } from "./contexts/LanguageContext";
import { supabase } from "./lib/supabase/client";
import PaymentSuccessPage from "./pages/PaymentSuccessPage";

// Configuração de debug para React Router
console.log('Inicializando React Router - App.tsx');

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter basename="/">
          <Routes>
            <Route path="/payment-success" element={<PaymentSuccessPage />} />
            
            <Route path="/" element={<Index />} />
            <Route path="/lp" element={<Index />} />
            <Route path="/premium" element={<Index />} />
            <Route path="/planos/variant1" element={<PlanPage variant="variant1" />} />
            <Route path="/planos/variant2" element={<PlanPage variant="variant2" />} />
            <Route path="/planos/promotion" element={<PlanPage variant="promotion" />} />
            <Route path="/planos/promotion_usd" element={<PlanPage variant="promotion_usd" />} />
            <Route path="/planos/a" element={<PlanPage variant="a" />} />
            <Route path="/teste" element={<TestePayment />} />
            <Route path="/payment-test" element={<PaymentTest />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
