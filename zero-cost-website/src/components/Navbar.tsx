
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { useFormContext } from "@/components/contact/FloatingContactForm";
import { useLanguage } from "@/contexts/LanguageContext";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isFormOpen, setIsFormOpen } = useFormContext();
  const { language } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // If form is open, don't render the navbar
  if (isFormOpen) {
    return null;
  }

  // Handle the CTA button click - scroll to pricing section
  const handleCTAClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Get the pricing section element
    const pricingSection = document.getElementById('pricing-section');
    
    if (pricingSection) {
      // Close mobile menu if open
      if (isMenuOpen) {
        setIsMenuOpen(false);
      }
      
      // Scroll to the pricing section
      pricingSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      console.error("Pricing section element not found");
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-black py-2 shadow-md" : "bg-transparent py-4"
      }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        <a href="#" className="flex items-center">
          <img 
            src="/lovable-uploads/d171a0a8-818a-4c1f-9d6c-db6f611b7da9.png" 
            alt="Zero Cost Website Logo" 
            className="h-4 mr-2" 
          />
        </a>

        {/* Desktop Menu - Only CTA Button */}
        <nav className="hidden md:flex items-center">
          <button
            onClick={handleCTAClick}
            className="px-5 py-2.5 bg-highlight text-black rounded-sm font-semibold text-sm tracking-wide transition-all duration-300 hover:bg-opacity-90 hover:translate-y-[-2px] focus:outline-none focus:ring-2 focus:ring-highlight focus:ring-opacity-50 shadow-md cta-glow"
          >
            {language === 'en' ? 'GET YOUR 100% FREE WEBSITE TODAY' : 'SOLICITAR SITE 100% GRATUITO'}
          </button>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden fixed inset-0 bg-black z-40 transform transition-transform duration-300 ease-in-out ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ top: "60px" }}
      >
        <nav className="flex flex-col items-center justify-center min-h-[calc(100vh-60px)] space-y-8 py-8">
          <button
            onClick={(e) => {
              setIsMenuOpen(false);
              handleCTAClick(e);
            }}
            className="px-6 py-3 bg-highlight text-black rounded-sm font-semibold tracking-wide transition-all duration-300 hover:bg-opacity-90 mt-4"
          >
            {language === 'en' ? 'GET YOUR 100% FREE WEBSITE TODAY' : 'SOLICITAR SITE 100% GRATUITO'}
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
