import { useEffect, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

const Hero = () => {
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subheadlineRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const backgroundRef = useRef<HTMLDivElement>(null);
  const glowEffect1Ref = useRef<HTMLDivElement>(null);
  const glowEffect2Ref = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const cursorHighlightRef = useRef<HTMLDivElement>(null);
  const { translate, language } = useLanguage();
  
  useEffect(() => {
    // Animação sequencial para os elementos do hero
    setTimeout(() => {
      if (headlineRef.current) headlineRef.current.classList.add("active");
    }, 300);
    setTimeout(() => {
      if (subheadlineRef.current) subheadlineRef.current.classList.add("active");
    }, 600);
    setTimeout(() => {
      if (ctaRef.current) ctaRef.current.classList.add("active");
    }, 900);

    // Animação de fundo avançada com efeito parallax mais intenso
    const handleMouseMove = (event: MouseEvent) => {
      if (!backgroundRef.current || !glowEffect1Ref.current || !glowEffect2Ref.current || !gridRef.current || !cursorHighlightRef.current) return;
      const {
        clientX,
        clientY
      } = event;
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      // Calculate position as percentage
      const moveX = clientX / windowWidth * 100 - 50;
      const moveY = clientY / windowHeight * 100 - 50;

      // Posiciona o efeito de destaque diretamente sob o cursor, mas com intensidade reduzida
      cursorHighlightRef.current.style.left = `${clientX}px`;
      cursorHighlightRef.current.style.top = `${clientY}px`;
      cursorHighlightRef.current.style.opacity = '0.35';

      // Apply enhanced parallax effects to various elements with more dramatic movement
      backgroundRef.current.style.transform = `translate(${-moveX * 1.2}px, ${-moveY * 1.2}px)`;
      glowEffect1Ref.current.style.transform = `translate(${moveX * 2.5}px, ${moveY * 2.5}px)`;
      glowEffect2Ref.current.style.transform = `translate(${-moveX * 2}px, ${-moveY * 2}px)`;
      gridRef.current.style.transform = `translate(${-moveX * 0.8}px, ${-moveY * 0.8}px)`;
    };

    // Resetar o destaque do cursor quando o mouse sai da seção
    const handleMouseLeave = () => {
      if (cursorHighlightRef.current) {
        cursorHighlightRef.current.style.opacity = '0';
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    document.getElementById('início')?.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.getElementById('início')?.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);
  
  return <section id="início" className="relative min-h-screen flex items-center justify-center bg-black pt-16 overflow-hidden">
      {/* Background patterns and gradients */}
      <div ref={backgroundRef} className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMjIiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0aDR2MWgtNHYtMXptMC0yaDF2NWgtMXYtNXptLTIgMmg0djFoLTR2LTF6TTQwIDI0aDR2MWgtNHYtMXptMC0yaDF2NWgtMXYtNXptLTIgMmg0djFoLTR2LTF6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30 transition-transform duration-200 ease-out"></div>
      
      {/* Grid patterns with parallax */}
      <div ref={gridRef} className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] transition-transform duration-200 ease-out"></div>
      
      {/* Glow effects with parallax */}
      <div ref={glowEffect1Ref} className="absolute left-1/4 top-1/3 -translate-y-1/2 h-60 w-60 rounded-full bg-highlight/30 blur-[120px] opacity-50 transition-transform duration-200 ease-out"></div>
      <div ref={glowEffect2Ref} className="absolute right-1/4 bottom-1/3 h-40 w-40 rounded-full bg-highlight/30 blur-[100px] opacity-50 transition-transform duration-200 ease-out"></div>
      
      {/* Cursor highlight effect - follows the mouse with reduced intensity */}
      <div ref={cursorHighlightRef} className="absolute w-80 h-80 rounded-full bg-highlight pointer-events-none blur-[120px] opacity-0 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-300 ease-out" style={{
      zIndex: 5
    }}></div>
      
      <div className="container mx-auto px-6 z-10">
        <div className="flex flex-col items-center justify-center text-center mx-auto">
          <div className="space-y-8 w-full max-w-3xl mx-auto">
            <div>
              <div className="inline-flex items-center rounded-full border border-gray-800 bg-black/50 backdrop-blur-sm px-3 py-1 text-sm text-gray-300 mb-6">
                <span className="flex h-2 w-2 rounded-full bg-highlight mr-2"></span>
                <span className="animate-pulse">{translate('hero.limitedTime')}</span>
              </div>
              
              <h1 ref={headlineRef} className="text-4xl md:text-5xl lg:text-6xl font-bold text-white reveal leading-tight tracking-tight">
                {translate('hero.mainHeading')} <br className="hidden sm:block" />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-highlight to-[#A2FF85] inline-block mt-2">
                  {translate('hero.subHeading')}
                </span>
              </h1>
            </div>
            
            <p ref={subheadlineRef} className="text-xl md:text-2xl text-gray-300 reveal mx-auto leading-relaxed">
              {translate('hero.description.full')}
            </p>
            
            <div ref={ctaRef} className="flex flex-col sm:flex-row gap-4 reveal justify-center pt-2">
              <a href="#oferta" className="inline-flex items-center justify-center px-8 py-4 bg-transparent border border-gray-700 text-white font-medium rounded-md hover:bg-white/5 transition-colors duration-300">
                {translate('hero.button.secondary')}
                <svg className="ml-2 w-5 h-5 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </div>
            
            <div className="pt-6 md:pt-6 border-t border-gray-800/50 mt-4">
              <p className="text-gray-400 text-sm pt-4 md:pt-0 pb-5 tracking-wide hidden md:block">
                {translate('hero.benefits')}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-8 left-0 right-0 animate-pulse hidden md:block">
        <div className="container mx-auto px-6">
          <div className="flex justify-center py-4 border-t border-gray-800/30">
            <div className="flex items-center">
              <span className="inline-block w-3 h-3 rounded-full bg-highlight mr-2"></span>
              <span className="text-gray-400 text-sm">{translate('hero.limitedSpots')}</span>
            </div>
          </div>
        </div>
      </div>
    </section>;
};
export default Hero;
