
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-4">404</h1>
        <div className="w-20 h-1 bg-highlight mx-auto mb-8"></div>
        <p className="text-2xl text-gray-300 mb-8">Página não encontrada</p>
        <a 
          href="/" 
          className="inline-block px-8 py-3 bg-highlight text-black font-medium transition-all duration-300 transform hover:translate-y-[-3px] hover:shadow-lg focus:outline-none"
        >
          Voltar para o início
        </a>
      </div>
    </div>
  );
};

export default NotFound;
