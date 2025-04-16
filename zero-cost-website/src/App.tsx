import React, { Suspense, lazy, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import NotFound from "./pages/NotFound";
import PlanPage from "./components/PlanPage";
import TestePayment from "./pages/TestePayment";
import PaymentTest from "./pages/PaymentTest";
import { LanguageProvider } from "./contexts/LanguageContext";
import PaymentSuccessPage from "./pages/PaymentSuccessPage";
import ApiInterceptor from "./lib/api-interceptor";

// Lazy load Index (antigo HomePage)
const IndexPage = lazy(() => import("./pages/Index"));

const queryClient = new QueryClient();

// Componente interno para usar hooks e Suspense
function AppRoutes() {
  const location = useLocation();
  console.log(`App inicializando na rota: ${location.pathname}`);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/" element={<IndexPage />} />
        <Route path="/lp" element={<IndexPage />} />
        <Route path="/payment-success" element={<PaymentSuccessPage />} />
        
        <Route path="/planos/variant1" element={<PlanPage variant="variant1" />} />
        <Route path="/planos/variant2" element={<PlanPage variant="variant2" />} />
        <Route path="/planos/promotion" element={<PlanPage variant="promotion" />} />
        <Route path="/planos/promotion_usd" element={<PlanPage variant="promotion_usd" />} />
        <Route path="/planos/a" element={<PlanPage variant="a" />} />
        <Route path="/teste" element={<TestePayment />} />
        <Route path="/payment-test" element={<PaymentTest />} />
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter basename="/">
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
