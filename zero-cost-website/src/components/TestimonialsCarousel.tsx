
import React, { useEffect, useState } from 'react';
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from '@/components/ui/carousel';
import { Avatar } from '@/components/ui/avatar';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  comment: {
    pt: string;
    en: string;
  };
  avatar: string;
}

const TestimonialsCarousel = () => {
  const { language } = useLanguage();
  
  // Reordering testimonials to put "A Gringa" (Johana) first
  const testimonials: Testimonial[] = [
    {
      id: 3,
      name: "Johana",
      role: language === 'en' ? '"The Foreign"' : '"A Gringa"',
      comment: {
        pt: "Após mais de 10 anos de carreira em Hollywood, trabalhando com as maiores agencias globais posso asegurar que quem contratar Studio Orygen, não vai se decepcionar. Apos testar muitas agencias no Brasil, finalmente encontrei o Studio Orygen. Não só fizeram um trabalho impecável, rápido e assertivo mas tambem me encontrei com um grupo de profissionais que cuidaram do meu projeto com tanto carinho como se fosse deles.",
        en: "After more than 10 years of career in Hollywood, working with the largest global agencies, I can assure that whoever hires Studio Orygen will not be disappointed. After testing many agencies in Brazil, I finally found Studio Orygen. Not only did they do an impeccable, fast, and assertive job, but I also met a group of professionals who cared for my project with as much love as if it were their own."
      },
      avatar: "/lovable-uploads/fa601ae3-6ca8-4df3-b0fd-591b380b7bf1.png"
    },
    {
      id: 1,
      name: "Carolina Righetto",
      role: "CEO Sono com Sono",
      comment: {
        pt: "O grande diferencial de vocês foi a qualidade na entrega e o alinhamento de pensamento. Já passei por varios designers na minha carreira e vocês tem algo que é muito difícil de encontrar que é o bom gosto. Estou muito feliz e satisfeita com a nossa parceria.",
        en: "Your great differential was the quality of delivery and alignment of thinking. I've been through many designers in my career, and you have something that is very hard to find, which is good taste. I am very happy and satisfied with our partnership."
      },
      avatar: "/lovable-uploads/d45195d5-4135-457d-985b-f522f6d09e07.png"
    },
    {
      id: 2,
      name: "Pedro",
      role: "PDC Strategist",
      comment: {
        pt: "Além das técnicas, o COMPROMETIMENTO do studio com o resultado, nos ajudou a escalar até os mais de 7 dígitos no ano. Valorizo demais a excelência que vocês fazem em cada página, identidade visual e artes que nós pedimos, porque tudo sai do jeito que nós pedimos e ATÉ MELHOR! O olhar para as métricas das páginas, a dedicação pra entregar as metas e tudo o que se relaciona diretamente com o design é incrível.",
        en: "Beyond techniques, the studio's COMMITMENT to results helped us scale to over 7 digits in one year. I greatly value the excellence you bring to each page, visual identity, and designs we request, because everything comes out exactly as we ask and EVEN BETTER! The attention to page metrics, dedication to delivering goals, and everything directly related to design is incredible."
      },
      avatar: "/lovable-uploads/5f0aa2e2-0e0f-4a4c-b2ba-930f54065727.png"
    },
    {
      id: 4,
      name: "Victor Miranda",
      role: "Afya/Meu consultorio Particular",
      comment: {
        pt: "O Studio Orygen cuida das páginas do Além da Medicina há anos. Quando eles chegaram tivemos um salto na qualidade e agilidade nas entregas. Sempre muito responsáveis e comprometidos com os resultados da empresa.",
        en: "Studio Orygen has been taking care of Beyond Medicine's pages for years. When they arrived, we had a jump in quality and agility in deliveries. Always very responsible and committed to the company's results."
      },
      avatar: "/lovable-uploads/1eb16b15-7806-4489-8495-e0cc1d291e49.png"
    }
  ];

  const [activeIndex, setActiveIndex] = useState(0);

  // Create an autoplay plugin instance with 5 second delay
  // Set stopOnInteraction to false so it continues playing after user interaction
  const autoplayPlugin = React.useMemo(() => 
    Autoplay({ 
      delay: 5000, 
      stopOnInteraction: false,
      rootNode: (emblaRoot) => emblaRoot.parentElement,
    }),
    []
  );

  // Initialize carousel with autoplay plugin
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: 'center' },
    [autoplayPlugin]
  );

  // Update active index when slide changes
  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setActiveIndex(emblaApi.selectedScrollSnap());
    };

    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);

    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi]);

  return (
    <div className="py-12 relative">
      <div className="max-w-5xl mx-auto px-4">
        <Carousel className="w-full">
          <CarouselContent ref={emblaRef}>
            {testimonials.map((testimonial) => (
              <CarouselItem key={testimonial.id} className="md:basis-full">
                <div className="flex flex-col items-center p-6 rounded-3xl border border-gray-800 bg-black/40">
                  <Avatar className={`mb-4 border-2 border-highlight ${testimonial.id === 2 ? 'h-36 w-36' : 'h-28 w-28'}`}>
                    <img 
                      src={testimonial.avatar} 
                      alt={testimonial.name}
                      className="h-full w-full object-cover"
                    />
                  </Avatar>
                  
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-semibold text-white">{testimonial.name}</h3>
                    <p className="text-gray-400 text-lg">{testimonial.role}</p>
                  </div>
                  
                  <p className="text-gray-300 text-center leading-relaxed italic text-xl">
                    {testimonial.id === 3 ? (
                      <>
                        "{language === 'en' ? (
                          <><strong>After over a decade working in Hollywood with top global agencies, I can confidently say Studio Orygen exceeded expectations.</strong> After testing many agencies in Brazil, I finally found Studio Orygen. Not only did they do an impeccable, fast, and assertive job, but I also met a group of professionals who cared for my project with as much love as if it were their own.</>
                        ) : (
                          <><strong>Após mais de 10 anos de carreira em Hollywood, trabalhando com as maiores agencias globais posso asegurar que quem contratar Studio Orygen, não vai se decepcionar.</strong> Apos testar muitas agencias no Brasil, finalmente encontrei o Studio Orygen. Não só fizeram um trabalho impecável, rápido e assertivo mas tambem me enconetrei com um grupo de profissionais que cuidaram do meu projeto com tanto carinho como se fosse deles.</>
                        )}"
                      </>
                    ) : (
                      `"${language === 'en' ? testimonial.comment.en : testimonial.comment.pt}"`
                    )}
                  </p>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          
          <div className="absolute -left-6 top-1/2 -translate-y-1/2 md:-left-12">
            <CarouselPrevious 
              className="h-12 w-12 rounded-full border-2 border-gray-700 bg-black/60 hover:bg-black/80"
            />
          </div>
          
          <div className="absolute -right-6 top-1/2 -translate-y-1/2 md:-right-12">
            <CarouselNext 
              className="h-12 w-12 rounded-full border-2 border-gray-700 bg-black/60 hover:bg-black/80"
            />
          </div>
        </Carousel>
        
        {/* Pagination dots */}
        <div className="flex justify-center gap-2 mt-6">
          {testimonials.map((_, index) => (
            <button
              key={index}
              className={`h-3 w-3 rounded-full transition-all ${
                activeIndex === index ? 'bg-[#e7ff36] w-6' : 'bg-gray-600'
              }`}
              onClick={() => emblaApi?.scrollTo(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TestimonialsCarousel;
