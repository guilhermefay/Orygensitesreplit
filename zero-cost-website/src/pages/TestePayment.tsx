import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

/**
 * Página especial para testar o pagamento com valor real de R$ 1,00
 */
const TestePayment: React.FC = () => {
  const { language } = useLanguage();
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    plano: 'mensal' // mensal ou anual
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Gerar um ID único para este formulário
      const formId = `teste_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      
      // Armazenar os dados temporariamente (compatível com Vercel)
      // Adaptamos para usar tanto a API do Express quanto da Vercel
      const storeUrl = process.env.NODE_ENV === 'production' 
        ? '/api/checkout/store-form-data' 
        : '/api/store-form-data';
      
      const response = await fetch(storeUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formId,
          formData: {
            name: formData.nome,
            email: formData.email,
            selectedPlan: formData.plano,
            business: 'Teste de Pagamento',
            business_details: 'Teste de integração',
            phone: '11999999999',
            description: 'Teste de pagamento R$ 1,00',
            testPayment: true
          },
          plan: formData.plano,
          finalContent: 'Conteúdo de teste para pagamento de R$ 1,00'
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao armazenar dados temporariamente');
      }

      // Redirecionar para a sessão de pagamento com R$ 1,00 (compatível com Vercel)
      const redirectUrl = process.env.NODE_ENV === 'production'
        ? `/api/checkout/redirect?amount=100&currency=brl&plan=${formData.plano}&formId=${formId}&test=true`
        : `/api/checkout-redirect?amount=100&currency=brl&plan=${formData.plano}&formId=${formId}&test=true`;
      console.log('Redirecionando para:', redirectUrl);
      window.location.href = redirectUrl;
    } catch (err: any) {
      console.error('Erro:', err);
      setError(err.message || 'Ocorreu um erro ao processar o pagamento');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Teste de Pagamento
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Pague R$ 1,00 para testar a integração com o Stripe e Supabase
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div className="mb-4">
              <label htmlFor="nome" className="sr-only">Nome</label>
              <input
                id="nome"
                name="nome"
                type="text"
                required
                value={formData.nome}
                onChange={handleChange}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Nome completo"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="email" className="sr-only">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email"
              />
            </div>
            <div>
              <label htmlFor="plano" className="sr-only">Plano</label>
              <select
                id="plano"
                name="plano"
                required
                value={formData.plano}
                onChange={handleChange}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              >
                <option value="mensal">Plano Mensal (teste)</option>
                <option value="annual">Plano Anual (teste)</option>
              </select>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isLoading ? (
                <>
                  <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                    <svg className="h-5 w-5 text-blue-400 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </span>
                  Processando...
                </>
              ) : (
                'Pagar R$ 1,00'
              )}
            </button>
          </div>
          
          <div className="text-xs text-gray-500 text-center">
            <p>Esse pagamento é real. Você será cobrado R$ 1,00 para testar o fluxo.</p>
            <p className="mt-1">Após o pagamento, seus dados serão enviados para o Supabase.</p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TestePayment;