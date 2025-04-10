
import React from "react";
import { Ban, Globe, Gauge, Check, Info } from "lucide-react";

const FreePlan: React.FC = () => {
  return (
    <>
      <div id="plano-gratuito" className="flex justify-center mt-12 mb-8 reveal">
        <div className="inline-block px-4 py-1 bg-black rounded-full">
          <p className="text-green-500 text-sm font-medium tracking-wider uppercase">
            Plano Gratuito
          </p>
        </div>
      </div>
      
      <div className="max-w-full w-full mx-auto text-center reveal">
        <h3 className="text-2xl font-bold mb-4">
          Plano com Hospedagem <span className="bg-green-500 text-white px-2 py-1 rounded">100% Gratuita</span>
        </h3>
        <p className="text-gray-700 mb-6">
          Não quer pagar pela hospedagem? Sem problemas! Oferecemos uma opção totalmente gratuita, 
          com alguns pequenos detalhes:
        </p>
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <div className="space-y-3">
            <p className="font-medium text-lg mb-4">
              O que está incluso no plano gratuito:
            </p>
            <ul className="space-y-4 text-left max-w-md mx-auto">
              <li className="flex items-start">
                <Ban className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                <span>Anúncios discretos da Orygen aparecendo no seu site</span>
              </li>
              <li className="flex items-start">
                <Globe className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                <span>Domínio no formato: <strong>suaempresa.orygensites.com</strong></span>
              </li>
              <li className="flex items-start">
                <Gauge className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                <span>Limite de <strong>100 acessos por mês</strong></span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                <span>Site completo com todas as funcionalidades básicas</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 bg-black p-6 rounded-lg border border-green-500/30">
          <div className="flex items-start">
            <div className="bg-green-500 p-2 rounded-full mr-3 flex-shrink-0">
              <Info className="text-black" size={20} />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-lg mb-2 text-white">O que você ganha ao assinar o plano premium:</h3>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  <span>Site <strong>sem anúncios</strong> - maior profissionalismo</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  <span>Domínio personalizado gratuito por 1 ano (ex: suaempresa.com.br)</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  <span>Possibilidade de solicitar alterações de design e conteúdo</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  <span>Suporte VIP com atendimento prioritário</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  <span>Acessos ilimitados sem restrições</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      <p className="text-center text-gray-600 max-w-3xl mx-auto mt-12 reveal">
        <strong>Importante:</strong> O desenvolvimento do site é totalmente gratuito em ambos os planos. 
        Você escolhe entre a hospedagem gratuita com limitações ou nosso plano premium com todas as vantagens.
      </p>
    </>
  );
};

export default FreePlan;
