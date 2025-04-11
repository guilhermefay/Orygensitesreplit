import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase/client';

/**
 * Página especial para diagnóstico de pagamentos e testes diretos
 */
const PaymentTest: React.FC = () => {
  const [sessionResult, setSessionResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [formId, setFormId] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  // Extrair parâmetros da URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('sessionId')) {
      setSessionId(params.get('sessionId') || '');
    }
    if (params.get('formId')) {
      setFormId(params.get('formId') || '');
    }
  }, [location]);

  // Função para verificar sessão no Stripe
  const checkStripeSession = async () => {
    if (!sessionId) {
      toast.error('Por favor, informe o ID da sessão');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/debug-session?sessionId=${sessionId}`);
      const data = await response.json();
      
      console.log('Resultado da verificação de sessão:', data);
      setSessionResult(data);
      toast.success('Sessão verificada com sucesso!');
    } catch (error) {
      console.error('Erro ao verificar sessão:', error);
      toast.error('Erro ao verificar sessão no Stripe');
    } finally {
      setIsLoading(false);
    }
  };

  // Função para salvar registro de teste no Supabase
  const saveTestRecord = async () => {
    if (!sessionId || !formId) {
      toast.error('Por favor, informe o ID da sessão e o ID do formulário');
      return;
    }

    setIsLoading(true);
    try {
      // Gerar um UUID para o registro
      const id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });

      // Dados de teste
      const testData = {
        id,
        name: 'Teste Manual',
        email: 'teste.manual@exemplo.com',
        phone: '11999999999',
        business: 'Empresa de Teste Manual',
        business_details: 'Detalhes da empresa de teste manual',
        original_form_id: formId,
        payment_id: sessionId,
        payment_status: 'paid',
        payment_date: new Date().toISOString(),
        selected_plan: 'monthly'
      };

      console.log('Salvando dados de teste:', testData);
      const { data, error } = await supabase
        .from('form_submissions')
        .insert(testData)
        .select();

      if (error) {
        console.error('Erro ao salvar registro de teste:', error);
        toast.error(`Erro ao salvar: ${error.message}`);
      } else {
        console.log('Registro de teste salvo com sucesso:', data);
        toast.success('Registro de teste salvo com sucesso!');
      }
    } catch (error: any) {
      console.error('Erro ao processar operação:', error);
      toast.error(`Erro ao processar: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Função para processar o pagamento manualmente
  const processPayment = async () => {
    if (!sessionId || !formId) {
      toast.error('Por favor, informe o ID da sessão e o ID do formulário');
      return;
    }

    setIsLoading(true);
    try {
      const url = `/api/process-payment-success?sessionId=${sessionId}&formId=${formId}&plan=monthly`;
      console.log('Processando pagamento manualmente:', url);
      
      const response = await fetch(url);
      
      if (response.ok) {
        console.log('Processamento manual bem-sucedido');
        toast.success('Pagamento processado com sucesso!');
      } else {
        const text = await response.text();
        console.error('Erro no processamento manual:', text);
        toast.error(`Erro no processamento: ${response.status}`);
      }
    } catch (error: any) {
      console.error('Erro ao processar pagamento:', error);
      toast.error(`Erro ao processar: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Função para verificar dados no Supabase
  const checkSupabaseData = async () => {
    setIsLoading(true);
    try {
      let query = supabase.from('form_submissions').select('*');
      
      if (sessionId) {
        console.log('Buscando por sessionId:', sessionId);
        query = query.eq('payment_id', sessionId);
      } else if (formId) {
        console.log('Buscando por formId:', formId);
        query = query.eq('original_form_id', formId);
      } else {
        // Se não temos ID específico, buscar os últimos 5 registros
        query = query.order('created_at', { ascending: false }).limit(5);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Erro ao buscar dados no Supabase:', error);
        toast.error(`Erro na busca: ${error.message}`);
      } else {
        console.log('Dados encontrados no Supabase:', data);
        setSessionResult({ supabaseData: data });
        
        if (data && data.length > 0) {
          toast.success(`Encontrados ${data.length} registros!`);
        } else {
          toast.info('Nenhum registro encontrado');
        }
      }
    } catch (error: any) {
      console.error('Erro ao verificar dados:', error);
      toast.error(`Erro: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Diagnóstico de Pagamento</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Verificar Sessão do Stripe</h2>
          
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
              placeholder="ID da Sessão (cs_live_...)"
              className="flex-1 border border-gray-300 rounded px-3 py-2"
            />
            <button
              onClick={checkStripeSession}
              disabled={isLoading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Verificando...' : 'Verificar Sessão'}
            </button>
          </div>
          
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              value={formId}
              onChange={(e) => setFormId(e.target.value)}
              placeholder="ID do Formulário"
              className="flex-1 border border-gray-300 rounded px-3 py-2"
            />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={checkSupabaseData}
              disabled={isLoading}
              className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700 disabled:opacity-50"
            >
              {isLoading ? 'Buscando...' : 'Verificar no Supabase'}
            </button>
            
            <button
              onClick={saveTestRecord}
              disabled={isLoading || !sessionId || !formId}
              className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 disabled:opacity-50"
            >
              {isLoading ? 'Salvando...' : 'Salvar Registro de Teste'}
            </button>
            
            <button
              onClick={processPayment}
              disabled={isLoading || !sessionId || !formId}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
            >
              {isLoading ? 'Processando...' : 'Processar Pagamento'}
            </button>
          </div>
        </div>
        
        {sessionResult && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Resultado:</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
              {JSON.stringify(sessionResult, null, 2)}
            </pre>
          </div>
        )}
        
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Voltar para a Página Inicial
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentTest;