
import { ArrowUp, Phone, Mail } from "lucide-react";
import { Button } from "./ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

const Footer = () => {
  const { language } = useLanguage();
  
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const navigationItems = language === 'en' 
    ? ["Home", "Offer", "Benefits", "Plans", "Contact"]
    : ["Início", "Oferta", "Benefícios", "Planos", "Contato"];
    
  return (
    <footer className="bg-black text-white py-12">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-8 md:mb-0">
            <img 
              src="/lovable-uploads/d171a0a8-818a-4c1f-9d6c-db6f611b7da9.png" 
              alt="Zero Cost Website Logo" 
              className="h-4 mb-4" 
            />
            <p className="text-gray-400 text-sm">
              {language === 'en' 
                ? 'Professional websites for zero cost.\nTransform your business now.'
                : 'Sites profissionais por zero reais.\nTransforme seu negócio agora.'}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-16">
            <div>
              <h3 className="text-highlight font-semibold mb-4">{language === 'en' ? 'Navigation' : 'Navegação'}</h3>
              <ul className="space-y-2">
                {navigationItems.map((item) => (
                  <li key={item}>
                    <a
                      href={`#${item.toLowerCase()}`}
                      className="text-gray-400 hover:text-white transition-colors duration-300 text-sm"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-highlight font-semibold mb-4">{language === 'en' ? 'Contact' : 'Contato'}</h3>
              <div className="space-y-3">
                <Button asChild variant="outline" size="sm" className="w-full justify-start gap-2 bg-transparent text-gray-400 hover:text-white border-gray-800">
                  <a href="https://wa.me/34991533667" target="_blank" rel="noopener noreferrer">
                    <Phone className="h-4 w-4" />
                    <span className="text-sm">(34) 99153-3667</span>
                  </a>
                </Button>
                
                <Button asChild variant="outline" size="sm" className="w-full justify-start gap-2 bg-transparent text-gray-400 hover:text-white border-gray-800">
                  <a href="mailto:guilhermeefay@gmail.com" target="_blank" rel="noopener noreferrer">
                    <Mail className="h-4 w-4" />
                    <span className="text-sm">guilhermeefay@gmail.com</span>
                  </a>
                </Button>
              </div>
            </div>
            
            <div>
              <h3 className="text-highlight font-semibold mb-4">{language === 'en' ? 'Follow us' : 'Siga-nos'}</h3>
              <div className="flex space-x-4">
                <a
                  href="https://www.instagram.com/guilhermefay"
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors duration-300 text-sm"
                >
                  Instagram
                </a>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
          <div className="flex flex-col space-y-2">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} Zero Cost Website. {language === 'en' ? 'All rights reserved.' : 'Todos os direitos reservados.'}
            </p>
            <p className="text-gray-600 text-xs">
              GUILHERME FAY DESIGN GRAFICO LTDA - CNPJ: 44.200.381/0001-28
            </p>
          </div>
          
          <button
            onClick={scrollToTop}
            className="flex items-center justify-center w-10 h-10 bg-highlight text-black rounded-full hover:bg-opacity-90 transition-all duration-300 focus:outline-none"
            aria-label={language === 'en' ? 'Back to top' : 'Voltar ao topo'}
          >
            <ArrowUp size={20} />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
