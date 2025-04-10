import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';

type Language = 'pt' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  translate: (key: string) => string;
}

const translations = {
  // Hero Section
  'hero.subheading': {
    pt: 'Tenha um Site Profissional',
    en: 'Get a Professional Website'
  },
  'hero.heading': {
    pt: 'Desenvolvimento Grátis',
    en: 'Free Development'
  },
  'hero.description': {
    pt: 'Garanta seu site personalizado por apenas uma pequena taxa de manutenção. Design profissional e otimizado para conversão.',
    en: 'Secure your customized website for just a small maintenance fee. Professional design optimized for conversion.'
  },
  'hero.cta': {
    pt: 'QUERO MEU SITE GRÁTIS',
    en: 'GET MY FREE WEBSITE'
  },
  'hero.clients': {
    pt: 'Empresas que estão crescendo com nossos sites:',
    en: 'Companies growing with our websites:'
  },
  'hero.limitedTime': {
    pt: 'Oferta por tempo limitado',
    en: 'Limited-Time Offer'
  },
  'hero.mainHeading': {
    pt: 'Seu Novo Site Profissional:',
    en: 'Get a Custom Professional Website —'
  },
  'hero.subHeading': {
    pt: 'Desenvolvimento 100% Gratuito',
    en: '100% Free'
  },
  'hero.description.full': {
    pt: 'Junte-se a centenas de empresas que já desenvolveram seus sites e Landing Pages conosco. Clique no botão abaixo e garanta seu site personalizado por apenas uma taxa simbólica de manutenção.',
    en: 'Join hundreds of businesses already growing with high-converting websites and landing pages built by us. Get yours today for only a symbolic monthly maintenance fee — no setup costs, no risk.'
  },
  'hero.button.primary': {
    pt: 'SOLICITAR MEU SITE GRÁTIS',
    en: 'GET YOUR 100% FREE WEBSITE TODAY'
  },
  'hero.button.secondary': {
    pt: 'Saiba mais',
    en: 'Learn more'
  },
  'hero.benefits': {
    pt: '✓ Design moderno ✓ Totalmente responsivo ✓ Otimizado para SEO',
    en: '✓ Modern Design ✓ Fully Responsive ✓ SEO Optimized'
  },
  'hero.limitedSpots': {
    pt: 'Vagas limitadas',
    en: 'Limited spots'
  },

  // Pricing Section
  'pricing.tag': {
    pt: 'Planos de Manutenção',
    en: 'Maintenance Plans'
  },
  'pricing.heading': {
    pt: 'Planos de Manutenção',
    en: 'Maintenance Plans'
  },
  'pricing.highlight': {
    pt: 'Acessíveis',
    en: 'Affordable'
  },
  'pricing.description': {
    pt: 'Aqui você não paga pelo desenvolvimento, cobramos apenas uma pequena taxa para manter o seu site no ar, funcional, seguro e otimizado. Conheça nossos planos e escolha o melhor para você:',
    en: 'You don\'t pay for development — only a small monthly fee to keep your website live, secure, and optimized. Check out our plans and choose the best one for you:'
  },

  // Plans - Monthly
  'plan.monthly.name': {
    pt: 'Plano Mensal',
    en: 'Monthly Plan'
  },
  'plan.monthly.value': {
    pt: 'valor',
    en: 'price'
  },
  'plan.monthly.cta': {
    pt: 'ESCOLHER PLANO',
    en: 'CHOOSE PLAN'
  },
  'plan.monthly.bottomMessage': {
    pt: 'Sim, você poderá mudar para o plano anual quando quiser e receber todos os benefícios dele.',
    en: 'Yes, you can switch to the annual plan anytime and receive all its benefits.'
  },

  // Plans - Annual
  'plan.annual.name': {
    pt: 'Plano Anual',
    en: 'Annual Plan'
  },
  'plan.annual.value': {
    pt: 'apenas',
    en: 'only'
  },
  'plan.annual.cta': {
    pt: 'APROVEITAR AGORA',
    en: 'GET STARTED NOW'
  },
  'plan.annual.badge': {
    pt: 'MELHOR OPÇÃO',
    en: 'BEST CHOICE'
  },

  // Features
  'feature.customSite': {
    pt: 'Site totalmente personalizado',
    en: 'Fully customized website'
  },
  'feature.sslCertificate': {
    pt: 'Certificado de segurança SSL incluso',
    en: 'SSL security certificate included'
  },
  'feature.visualIdentity': {
    pt: 'Sua identidade visual',
    en: 'Your visual identity'
  },
  'feature.unlimitedAccess': {
    pt: 'Acessos ilimitados',
    en: 'Unlimited access'
  },
  'feature.copywriting': {
    pt: 'Redação publicitária inclusa',
    en: 'Advertising copywriting included'
  },
  'feature.fastLoading': {
    pt: 'Carregamento ultra rápido',
    en: 'Ultra-fast loading'
  },
  'feature.responsive': {
    pt: 'Visualizado corretamente em qualquer dispositivo',
    en: 'Properly displayed on any device'
  },
  'feature.whatsappButton': {
    pt: 'Botão flutuante do WhatsApp',
    en: 'Floating WhatsApp button'
  },
  'feature.server': {
    pt: 'Servidor rápido, estável e seguro',
    en: 'Fast, stable, and secure server'
  },
  'feature.basicDomain': {
    pt: 'Domínio básico',
    en: 'Basic domain'
  },
  'feature.freeCustomDomain': {
    pt: 'Domínio personalizado gratuito (por 1 ano)',
    en: 'Free custom domain (for 1 year). Example: yourbusiness.com'
  },
  'feature.oneChange': {
    pt: '1 alteração por mês',
    en: '1 change per month'
  },
  'feature.threeChanges': {
    pt: 'Até 3 alterações por mês',
    en: 'Up to 3 changes per month'
  },
  'feature.basicSupport': {
    pt: 'Suporte sempre que precisar',
    en: 'Support whenever you need'
  },
  'feature.vipSupport': {
    pt: 'Suporte VIP',
    en: 'VIP Support'
  },

  // Benefits Section
  'benefits.tag': {
    pt: 'Benefícios Exclusivos',
    en: 'Exclusive Benefits'
  },
  'benefits.heading': {
    pt: 'Tudo o que você precisa em um site',
    en: 'Everything you need in a website'
  },
  'benefit.modernDesign.title': {
    pt: 'Design Moderno',
    en: 'Modern Design'
  },
  'benefit.modernDesign.description': {
    pt: 'Site elegante com visual profissional que transmite confiança.',
    en: 'Elegant, professional-looking website that builds trust.'
  },
  'benefit.responsive.title': {
    pt: 'Responsivo',
    en: 'Responsive'
  },
  'benefit.responsive.description': {
    pt: 'Funciona perfeitamente em celulares, tablets e desktops.',
    en: 'Works perfectly on mobile, tablets, and desktops.'
  },
  'benefit.fast.title': {
    pt: 'Ultra Rápido',
    en: 'Ultra Fast'
  },
  'benefit.fast.description': {
    pt: 'Carregamento instantâneo para não perder clientes impacientes.',
    en: 'Blazing-fast loading speeds so you don\'t lose impatient visitors.'
  },
  'benefit.conversion.title': {
    pt: 'Alta Conversão',
    en: 'High Conversion'
  },
  'benefit.conversion.description': {
    pt: 'Estrutura pensada para transformar visitantes em clientes.',
    en: 'Conversion-optimized layout built to turn visitors into paying clients.'
  },
  'benefit.seo.title': {
    pt: 'Otimizado (SEO)',
    en: 'Optimized (SEO)'
  },
  'benefit.seo.description': {
    pt: 'Preparado para aparecer nas primeiras posições do Google.',
    en: 'Ready to appear in the top positions on Google.'
  },
  'benefit.quick.title': {
    pt: 'Pronto em 3 Dias',
    en: 'Delivered Within 3 Days'
  },
  'benefit.quick.description': {
    pt: 'Sem meses de espera ou desenvolvimento arrastado.',
    en: 'No months of waiting or dragged-out development.'
  },
  
  // Testimonials
  'testimonials.tag': {
    pt: 'Depoimentos de Clientes',
    en: 'Client Testimonials'
  },
  'testimonials.heading': {
    pt: 'Quem usa, aprova',
    en: 'Client Testimonials'
  },
  'testimonials.clientsIntro': {
    pt: 'Empresas que já estão vendendo mais com nosso design:',
    en: 'Companies already selling more with our design:'
  },
  'stats.sitesDeveloped': {
    pt: '+300 Sites Desenvolvidos',
    en: '+300 Sites Developed'
  },
  'stats.experience': {
    pt: '+7 Anos de Experiência',
    en: '+7 Years of Experience'
  },
  'stats.countries': {
    pt: 'Clientes em +5 Países',
    en: 'Clients in +5 Countries'
  },

  // Contact Form
  'contact.requestSite': {
    pt: 'Solicitar seu site',
    en: 'Request your website'
  },
  'form.businessName': {
    pt: 'Nome da empresa',
    en: 'Business name'
  },
  'form.yourName': {
    pt: 'Seu nome',
    en: 'Your name'
  },
  'form.email': {
    pt: 'Email',
    en: 'Email'
  },
  'form.phone': {
    pt: 'Telefone',
    en: 'Phone'
  },
  'form.businessDetails': {
    pt: 'Detalhes do negócio',
    en: 'Business details'
  },
  'form.back': {
    pt: 'Voltar',
    en: 'Back'
  },
  'form.next': {
    pt: 'Próximo',
    en: 'Next'
  },
  'form.previous': {
    pt: 'Anterior',
    en: 'Previous'
  },
  'form.submit': {
    pt: 'Enviar',
    en: 'Submit'
  },
  'form.sending': {
    pt: 'Enviando...',
    en: 'Sending...'
  },
  'form.details.placeholder': {
    pt: 'Conte-nos um pouco sobre sua empresa, o que você faz e quais são seus diferenciais...',
    en: 'Tell us about your business, what you do, and what makes you unique...'
  },
  'form.success': {
    pt: 'Formulário enviado com sucesso!',
    en: 'Form submitted successfully!'
  },
  'form.errorSubmitting': {
    pt: 'Erro ao enviar formulário. Tente novamente.',
    en: 'Error submitting form. Please try again.'
  },
  'form.identityTitle': {
    pt: 'Identidade Visual',
    en: 'Visual Identity'
  },
  'form.colorPalette': {
    pt: 'Paleta de Cores',
    en: 'Color Palette'
  },
  'form.uploadLogo': {
    pt: 'Enviar Logo',
    en: 'Upload Logo'
  },
  'form.businessPhotos': {
    pt: 'Fotos do Negócio',
    en: 'Business Photos'
  },
  'form.addColor': {
    pt: 'Adicionar Cor',
    en: 'Add Color'
  },
  'form.dragDrop': {
    pt: 'Arraste e solte ou clique para selecionar',
    en: 'Drag and drop or click to select'
  },
  'form.payment': {
    pt: 'Pagamento',
    en: 'Payment'
  },
  'form.paymentProcessing': {
    pt: 'Processando pagamento...',
    en: 'Processing payment...'
  },
  'form.paymentSuccess': {
    pt: 'Pagamento concluído com sucesso!',
    en: 'Payment completed successfully!'
  },
  'form.backToPayment': {
    pt: 'Voltar para pagamento',
    en: 'Back to payment'
  },
  'form.paymentDetails': {
    pt: 'Detalhes do pagamento',
    en: 'Payment details'
  },
  'form.contactInfo': {
    pt: 'Seus Dados de Contato',
    en: 'Your Contact Information'
  },
  'form.fullName': {
    pt: 'Nome Completo',
    en: 'Full Name'
  },
  'form.whatsapp': {
    pt: 'WhatsApp (com DDD)',
    en: 'WhatsApp (with country code)'
  },
  'form.whatsappWarning': {
    pt: 'Importante: Entregaremos seu site pronto através deste número de WhatsApp. Certifique-se de informar um número válido.',
    en: 'Important: We will deliver your completed website through this WhatsApp number. Make sure to provide a valid number.'
  },
  'form.aboutBusiness': {
    pt: 'Sobre seu Negócio',
    en: 'About Your Business'
  },
  'form.businessDetailsHelp': {
    pt: 'Essas informações serão usadas para gerar o conteúdo do seu site. Quanto mais detalhes você fornecer, melhor será o resultado.',
    en: 'This information will be used to generate your website content. The more details you provide, the better the result will be.'
  },
  'form.businessDetailsDescription': {
    pt: 'Descreva com detalhes o que sua empresa faz, seus principais produtos ou serviços, diferenciais competitivos e público-alvo.',
    en: 'Describe in detail what your company does, your main products or services, competitive advantages, and target audience.'
  },
  'form.selectPlan': {
    pt: 'Escolha seu plano',
    en: 'Choose your plan'
  },

  // Visual Identity form
  'form.visualIdentity.title': {
    pt: 'Identidade Visual',
    en: 'Visual Identity'
  },
  'form.visualIdentity.selectColors': {
    pt: 'Selecione as cores do seu site',
    en: 'Select your website colors'
  },
  'form.visualIdentity.color': {
    pt: 'Cor',
    en: 'Color'
  },
  'form.visualIdentity.addColor': {
    pt: 'Adicionar outra cor',
    en: 'Add another color'
  },
  'form.visualIdentity.addLogo': {
    pt: 'Adicione seu logo',
    en: 'Add your logo'
  },
  'form.visualIdentity.selectLogos': {
    pt: 'Selecione seus logos',
    en: 'Select your logos'
  },
  'form.visualIdentity.addPhotos': {
    pt: 'Adicione fotos para usar no site',
    en: 'Add photos to use on your site'
  },
  'form.visualIdentity.selectPhotos': {
    pt: 'Selecione suas fotos',
    en: 'Select your photos'
  },
  'form.visualIdentity.imageFormats': {
    pt: 'PNG, JPG ou SVG (max. 10MB)',
    en: 'PNG, JPG or SVG (max. 10MB)'
  },
  'form.visualIdentity.photoFormats': {
    pt: 'PNG ou JPG (max. 10MB)',
    en: 'PNG or JPG (max. 10MB)'
  },
  
  // Form submission and payment
  'form.requestWebsite': {
    pt: 'SOLICITAR MEU SITE GRÁTIS',
    en: 'GET MY FREE WEBSITE'
  },

  // Form steps
  'form.step.contactInfo': {
    pt: 'Seus Dados',
    en: 'Your Info'
  },
  'form.step.business': {
    pt: 'Empresa',
    en: 'Business'
  },
  'form.step.visualIdentity': {
    pt: 'Identidade Visual',
    en: 'Visual Identity'
  },
  'form.step.payment': {
    pt: 'Pagamento',
    en: 'Payment'
  },

  // Offer section
  'offer.freeVsPaid': {
    pt: 'O que a concorrência cobra mais de',
    en: 'What others charge over'
  },
  'offer.weDo': {
    pt: 'nós fazemos',
    en: 'for, we deliver'
  },
  'offer.forFree': {
    pt: 'gratuitamente',
    en: 'for free'
  },
  'offer.how': {
    pt: 'Como? Simples!',
    en: 'How? Simple!'
  },
  'offer.technology': {
    pt: 'A tecnologia está à favor dos nossos designers. Utilizamos uma',
    en: 'Technology works to our designers\' advantage. We leverage '
  },
  'offer.ai': {
    pt: 'Inteligência Artificial',
    en: 'Artificial Intelligence'
  },
  'offer.aiHelps': {
    pt: 'que nos ajuda na criação, possibilitando oferecer algo que ninguém mais no mercado está disposto a fazer.',
    en: ' to streamline the creation process, allowing us to offer what no one else in the market dares to.'
  },
  'offer.howItWorks': {
    pt: 'Como Funciona em',
    en: 'How It Works in'
  },
  'offer.steps': {
    pt: '4 Passos Simples',
    en: '4 Simple Steps'
  },
  'offer.step1.title': {
    pt: '1. Escolha seu plano de manutenção',
    en: '1. Choose Your Maintenance Plan'
  },
  'offer.step1.description': {
    pt: 'Escolha entre nossos planos mensais ou anuais para manter seu site.',
    en: 'Select between our monthly or annual plans to keep your website active and updated.'
  },
  'offer.step2.title': {
    pt: '2. Preencha suas informações',
    en: '2. Fill Out the Form'
  },
  'offer.step2.description': {
    pt: 'Forneça detalhes sobre seu negócio e suas preferências de design no formulário.',
    en: 'Tell us about your business and design preferences.'
  },
  'offer.step3.title': {
    pt: '3. Desenvolvemos seu site gratuitamente',
    en: '3. We Develop Your Website for Free'
  },
  'offer.step3.description': {
    pt: 'Criamos seu site com design profissional e responsivo sem custo algum.',
    en: 'Your professional, responsive website—developed at zero cost.'
  },
  'offer.step4.title': {
    pt: '4. Aproveite!',
    en: '4. Enjoy!'
  },
  'offer.step4.description': {
    pt: 'Um site que custaria R$5.000 ou mais, agora é seu, por apenas uma pequena taxa de manutenção.',
    en: 'A website worth $5,000 or more, now yours for just a small monthly fee.'
  },
  'offer.cta': {
    pt: 'QUERO APROVEITAR ESSA OFERTA',
    en: 'I WANT TO TAKE ADVANTAGE OF THIS OFFER'
  },

  // Price Comparison
  'priceComparison.title': {
    pt: 'Comparativo de Preços',
    en: 'Price Comparison'
  },
  'priceComparison.description': {
    pt: 'Veja como nossa solução oferece muito mais valor por um preço muito menor',
    en: 'See how our solution offers much more value for a much lower price'
  },
  'priceComparison.market': {
    pt: 'Mercado',
    en: 'Market'
  },
  'priceComparison.perMonth': {
    pt: 'por mês',
    en: 'per month'
  },
  'priceComparison.development': {
    pt: 'Desenvolvimento do site',
    en: 'Website development'
  },
  'priceComparison.domain': {
    pt: 'Domínio por um ano',
    en: 'Domain for one year'
  },
  'priceComparison.hosting': {
    pt: 'Hospedagem mensal',
    en: 'Monthly hosting'
  },
  'priceComparison.maintenance': {
    pt: 'Manutenção mensal',
    en: 'Monthly maintenance'
  },
  'priceComparison.free': {
    pt: 'Grátis',
    en: 'Free'
  },
  'priceComparison.total': {
    pt: 'Total mensal:',
    en: 'Monthly total:'
  },
  'priceComparison.youSave': {
    pt: 'Você Economiza',
    en: 'You Save'
  },
  'priceComparison.marketValue': {
    pt: 'do valor de mercado',
    en: 'of the market value'
  },
  'priceComparison.savedPerMonth': {
    pt: 'economizados por mês',
    en: 'saved per month'
  },
  'priceComparison.guarantee': {
    pt: 'Garantia de qualidade superior',
    en: 'Superior quality guarantee'
  },
  'priceComparison.whyAffordable': {
    pt: 'Por que somos mais acessíveis?',
    en: 'Why are we more affordable?'
  },
  'priceComparison.explanation': {
    pt: 'Nosso modelo de negócio inovador elimina os custos iniciais de desenvolvimento, hospedagem e domínio. Com nossa plataforma otimizada, você paga apenas pela manutenção mensal a um preço muito mais justo que o mercado, economizando mais de 90% do custo tradicional no primeiro ano.',
    en: 'Our innovative business model eliminates the initial costs of development, hosting, and domain. With our optimized platform, you only pay for monthly maintenance at a much fairer price than the market, saving more than 90% of the traditional cost in the first year.'
  },

  // Footer
  'footer.tagline': {
    pt: 'Sites profissionais a custo zero. Transforme seu negócio agora.',
    en: 'Professional Websites at Zero Cost — Transform Your Business Today.'
  },

  // Common
  'month': {
    pt: 'mês',
    en: 'month'
  },
  'off': {
    pt: 'OFF',
    en: 'OFF'
  },
  'chat.help': {
    pt: 'Alguma dúvida? estamos online!',
    en: 'Questions? We\'re online and ready to help!'
  }
};

// Create context with default values
const LanguageContext = createContext<LanguageContextType>({
  language: 'pt',
  setLanguage: () => {},
  translate: () => ''
});

export const useLanguage = () => useContext(LanguageContext);

// Fix: Ensure LanguageProvider is properly defined as a React functional component
export const LanguageProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('pt');

  useEffect(() => {
    // Check URL parameters for variant-based language selection
    const params = new URLSearchParams(window.location.search);
    const variant = params.get('variant');
    
    // Set English for specified variants
    if (variant === 'variant1' || variant === 'variant2' || variant === 'promotion_usd') {
      setLanguage('en');
    } else {
      // For paths with /planos/ in the URL
      if (window.location.pathname.includes('/planos/')) {
        const pathSegments = window.location.pathname.split('/');
        const pathVariant = pathSegments[pathSegments.length - 1];
        
        if (pathVariant === 'variant1' || pathVariant === 'variant2' || pathVariant === 'promotion_usd') {
          setLanguage('en');
          return;
        }
      }
      
      setLanguage('pt');
    }
  }, []);

  const translate = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  // Provide context value to children
  return (
    <LanguageContext.Provider value={{ language, setLanguage, translate }}>
      {children}
    </LanguageContext.Provider>
  );
};
