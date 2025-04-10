
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";

const Portfolio = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
        }
      });
    }, {
      root: null,
      rootMargin: "0px",
      threshold: 0.1
    });
    
    const elements = document.querySelectorAll(".reveal");
    elements.forEach(element => observer.observe(element));
    
    return () => observer.disconnect();
  }, []);

  const projects = [
    {
      title: "Clínica Saúde Total",
      category: "Site institucional para clínica médica",
      imageBg: "bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwYTc1YWQiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMCAwaDQwdjQwSDB6Ii8+PC9nPjwvZz48L3N2Zz4=')]"
    }, 
    {
      title: "Restaurante Sabor Único",
      category: "Cardápio online e reservas",
      imageBg: "bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNhZDM0MGEiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMCAwaDQwdjQwSDB6Ii8+PC9nPjwvZz48L3N2Zz4=')]"
    },
    {
      title: "Estúdio Fotográfico Momento",
      category: "Galeria de trabalhos e contato",
      imageBg: "bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMzYjBhYWQiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMCAwaDQwdjQwSDB6Ii8+PC9nPjwvZz48L3N2Zz4=')]"
    },
    {
      title: "Consultoria Empresarial Êxito",
      category: "Site de serviços profissionais",
      imageBg: "bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwYWFkMzQiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMCAwaDQwdjQwSDB6Ii8+PC9nPjwvZz48L3N2Zz4=')]"
    },
    {
      title: "Imobiliária Nova Casa",
      category: "Catálogo de imóveis e contato",
      imageBg: "bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNhZDBhODUiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMCAwaDQwdjQwSDB6Ii8+PC9nPjwvZz48L3N2Zz4=')]"
    }
  ];

  const nextSlide = () => {
    setCurrentIndex(prevIndex => prevIndex === projects.length - 3 ? 0 : prevIndex + 1);
  };

  const prevSlide = () => {
    setCurrentIndex(prevIndex => prevIndex === 0 ? projects.length - 3 : prevIndex - 1);
  };

  return (
    <section id="portfolio" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
          Nossos <span className="text-highlight">Projetos</span>
        </h2>
        
        <div className="relative max-w-6xl mx-auto">
          <div 
            ref={carouselRef}
            className="overflow-hidden"
          >
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 33.33}%)` }}
            >
              {projects.map((project, index) => (
                <div key={index} className="min-w-[33.33%] px-4">
                  <div className={`${project.imageBg} h-80 rounded-xl p-6 flex flex-col justify-between hover:shadow-xl transition-all duration-300`}>
                    <div>
                      <span className="inline-block bg-white/10 backdrop-blur-sm text-sm px-3 py-1 rounded-full text-white">
                        {project.category}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">{project.title}</h3>
                      <button className="flex items-center gap-2 text-white/80 hover:text-white transition-colors">
                        <span>Ver projeto</span>
                        <ExternalLink size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <button 
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 bg-white rounded-full p-2 shadow-md hover:bg-gray-100"
          >
            <ArrowLeft size={20} />
          </button>
          
          <button 
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 bg-white rounded-full p-2 shadow-md hover:bg-gray-100"
          >
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Portfolio;
