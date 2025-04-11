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
import SuccessPage from "./pages/SuccessPage"; 
import TestePayment from "./pages/TestePayment";
import { LanguageProvider } from "./contexts/LanguageContext";
import { supabase } from "./lib/supabase/client";

// Configuração de debug para React Router
console.log('Inicializando React Router - App.tsx');

const queryClient = new QueryClient();

// Component to check for payment returns
const PaymentSuccessHandler = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if this is a return from payment (could be detected by query param or referrer)
    const isReturnFromStripe = document.referrer.includes('stripe.com') || 
                               location.search.includes('payment=success') ||
                               location.search.includes('sessionId=') ||
                               location.pathname === '/payment-success' ||
                               location.pathname === '/success';
                               
    if (isReturnFromStripe) {
      console.log("Detected return from Stripe payment");
      const formId = localStorage.getItem('form_id');
      const paymentId = localStorage.getItem('current_payment_id');
      
      console.log("Form ID from localStorage:", formId);
      console.log("Payment ID from localStorage:", paymentId);
      
      if (formId && paymentId) {
        // Update payment status in Supabase
        const updatePaymentStatus = async () => {
          try {
            console.log("Updating payment status in Supabase...");
            const { error } = await supabase
              .from('form_submissions')
              .update({ 
                payment_status: 'completed',
                payment_id: paymentId,
                payment_date: new Date().toISOString()
              })
              .eq('id', formId);
              
            if (error) {
              console.error('Error updating payment status:', error);
              toast.error('Erro ao confirmar o pagamento. Por favor, entre em contato com o suporte.');
            } else {
              console.log("Payment status updated successfully!");
              toast.success('Pagamento confirmado com sucesso! Nossa equipe entrará em contato em breve.');
              
              // Clear storage after successful update
              localStorage.removeItem('form_id');
              localStorage.removeItem('current_payment_id');
              
              // Navigate to success page if not already there
              if (location.pathname !== '/payment-success' && location.pathname !== '/success') {
                navigate('/success');
              }
            }
          } catch (error) {
            console.error('Error in payment confirmation:', error);
          }
        };
        
        updatePaymentStatus();
      }
    }
  }, [location, navigate]);
  
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter basename="/">
          <PaymentSuccessHandler />
          <Routes>
            {/* Rota de sucesso com maior prioridade */}
            <Route path="/success" element={<SuccessPage />} />
            <Route path="/payment-success" element={<SuccessPage />} />
            
            {/* Outras rotas */}
            <Route path="/" element={<Index />} />
            <Route path="/planos/variant1" element={<PlanPage variant="variant1" />} />
            <Route path="/planos/variant2" element={<PlanPage variant="variant2" />} />
            <Route path="/planos/promotion" element={<PlanPage variant="promotion" />} />
            <Route path="/planos/promotion_usd" element={<PlanPage variant="promotion_usd" />} />
            <Route path="/planos/a" element={<PlanPage variant="a" />} />
            <Route path="/teste" element={<TestePayment />} />
            
            {/* Rota catch-all para páginas não encontradas */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
