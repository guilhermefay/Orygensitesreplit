
import { 
  Lightbulb, Globe, Gift, Shield, Ban, Infinity, 
  Heart, HelpCircle, RefreshCw, Check, Gauge, 
  Smartphone, Zap, MessageCircle
} from "lucide-react";
import React from "react";

export const featureIcons: Record<string, React.ReactNode> = {
  "Site totalmente personalizado": <Lightbulb className="h-5 w-5 flex-shrink-0 mt-0.5" />,
  "Domínio personalizado": <Globe className="h-5 w-5 flex-shrink-0 mt-0.5" />,
  "Domínio básico": <Globe className="h-5 w-5 flex-shrink-0 mt-0.5" />,
  "Domínio básico (suaempresa.orygensites.com)": <Globe className="h-5 w-5 flex-shrink-0 mt-0.5" />,
  "Domínio personalizado gratuito": <Gift className="h-5 w-5 flex-shrink-0 mt-0.5" />,
  "Domínio personalizado gratuito (por 1 ano)": <Gift className="h-5 w-5 flex-shrink-0 mt-0.5" />,
  "Certificado de segurança SSL incluso": <Shield className="h-5 w-5 flex-shrink-0 mt-0.5" />,
  "Certificado SSL incluso": <Shield className="h-5 w-5 flex-shrink-0 mt-0.5" />,
  "Sem anúncios": <Ban className="h-5 w-5 flex-shrink-0 mt-0.5" />,
  "Acessos ilimitados": <Infinity className="h-5 w-5 flex-shrink-0 mt-0.5" />,
  "Suporte VIP": <Heart className="h-5 w-5 flex-shrink-0 mt-0.5" />,
  "Suporte sempre que precisar": <HelpCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />,
  "1 alteração por mês": <RefreshCw className="h-5 w-5 flex-shrink-0 mt-0.5" />,
  "Até 3 alterações por mês": <RefreshCw className="h-5 w-5 flex-shrink-0 mt-0.5" />,
  "Carregamento ultra rápido": <Zap className="h-5 w-5 flex-shrink-0 mt-0.5" />,
  "Visualizado corretamente em qualquer dispositivo": <Smartphone className="h-5 w-5 flex-shrink-0 mt-0.5" />,
  "Botão flutuante do WhatsApp": <MessageCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />,
  "Sua identidade visual": <Lightbulb className="h-5 w-5 flex-shrink-0 mt-0.5" />,
  "Redação publicitária inclusa": <Check className="h-5 w-5 flex-shrink-0 mt-0.5" />,
  "Servidor rápido, estável e seguro": <Gauge className="h-5 w-5 flex-shrink-0 mt-0.5" />,
};

export const getFeatureIcon = (feature: string): React.ReactNode => {
  return featureIcons[feature] || <Check className="h-5 w-5 flex-shrink-0 mt-0.5" />;
};
