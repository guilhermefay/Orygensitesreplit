
import React from 'react';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { HelpCircle } from 'lucide-react';

type FAQItem = {
  question: string;
  answer: string;
};

const faqItems: FAQItem[] = [
  {
    question: "Como funciona o site gratuito?",
    answer: "Oferecemos um site de uma página totalmente grátis para pequenos negócios. Você preenche um formulário com informações sobre seu negócio, e nossa equipe desenvolve um site profissional em até 72 horas."
  },
  {
    question: "Qual a diferença entre os planos mensal e anual?",
    answer: "O plano mensal permite pagamento mês a mês com todas as funcionalidades básicas. Já o plano anual oferece um desconto significativo no valor total e inclui recursos premium como suporte prioritário e atualizações ilimitadas."
  },
  {
    question: "Posso migrar de domínio mais tarde?",
    answer: "Sim, é possível migrar seu site para um domínio próprio posteriormente. Oferecemos assistência no processo de migração para garantir que tudo ocorra sem problemas. Consulte nossos planos para mais detalhes sobre esta opção."
  },
  {
    question: "Como recebo o suporte técnico?",
    answer: "Nosso suporte técnico está disponível por e-mail e chat em horário comercial. Clientes dos planos mensais e anuais têm acesso a canais de suporte exclusivos, com tempos de resposta garantidos de acordo com o plano escolhido."
  },
  {
    question: "O que acontece depois que eu enviar o formulário?",
    answer: "Após o envio do formulário, nossa equipe analisará as informações fornecidas e entrará em contato em até 24 horas para confirmar os detalhes. Em seguida, iniciaremos o desenvolvimento do seu site, que estará pronto em até 72 horas úteis."
  },
  {
    question: "Posso personalizar o design do meu site depois?",
    answer: "Sim, oferecemos opções de personalização após a entrega inicial. Nos planos pagos, você tem acesso a atualizações e modificações de design de acordo com as condições do seu plano específico."
  },
  {
    question: "Como funciona o pagamento dos planos?",
    answer: "Aceitamos pagamentos via cartão de crédito, boleto bancário e PIX. Para os planos mensais, a cobrança é feita a cada 30 dias. Para os planos anuais, oferecemos opções de pagamento único com desconto ou parcelamento em até 12x no cartão de crédito."
  }
];

const FAQ: React.FC = () => {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
          <HelpCircle className="h-8 w-8 text-highlight" />
          Perguntas Frequentes
        </h2>
        <p className="text-gray-300 max-w-2xl mx-auto">
          Encontre respostas para as dúvidas mais comuns sobre nossos serviços e como podemos ajudar seu negócio.
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
        <Accordion type="single" collapsible className="w-full">
          {faqItems.map((item, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="border-b border-gray-200 last:border-0">
              <AccordionTrigger className="py-4 text-left font-medium text-lg hover:text-highlight transition-colors">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 pb-4 pt-1">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
      
      <div className="text-center mt-10">
        <p className="text-gray-300 mb-4">Ainda tem dúvidas?</p>
        <a 
          href="#contato" 
          className="bg-highlight hover:bg-highlight/80 text-white px-6 py-3 rounded-full inline-flex items-center transition-colors"
        >
          Entre em contato
        </a>
      </div>
    </div>
  );
};

export default FAQ;
