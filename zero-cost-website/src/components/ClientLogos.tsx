
import React from 'react';
import { InfiniteCarousel } from '@/components/ui/infinite-carousel';

interface LogoProps {
  src: string;
  alt: string;
  id: number;
}

const Logo: React.FC<LogoProps> = ({ src, alt, id }) => (
  <div className="flex items-center justify-center h-32 md:h-40 w-52 md:w-64 mx-8">
    <img 
      src={src} 
      alt={alt} 
      className={`${id === 2 ? 'h-36 md:h-44' : 'h-28 md:h-40'} w-auto object-contain`} 
    />
  </div>
);

const ClientLogos: React.FC = () => {
  const logos = [
    { id: 1, src: "/lovable-uploads/6a9ef99f-ea95-4371-a9e5-0288fb5d3b2a.png", alt: "Logo Cliente 1" },
    { id: 2, src: "/lovable-uploads/7fbb893e-60d9-40f4-b77a-144c4a740342.png", alt: "Logo Cliente 2" },
    { id: 3, src: "/lovable-uploads/3450309f-01b0-4a03-b922-ed452e990cb7.png", alt: "Logo Cliente 3" },
    { id: 4, src: "/lovable-uploads/780eae29-5c92-4e3e-bbb7-4f44ef16e9fe.png", alt: "Logo Cliente 4" },
    { id: 5, src: "/lovable-uploads/fdc51eb3-d8ab-4274-a3fe-e638c85a0608.png", alt: "Logo Cliente 5" },
    { id: 6, src: "/lovable-uploads/ba5c6f3c-a546-4154-b9d8-095b7c53637f.png", alt: "Logo Cliente 6" },
    { id: 7, src: "/lovable-uploads/fe3b7b48-fdea-45ae-ae0f-6d3bd045a3ae.png", alt: "Logo Cliente 7" },
    { id: 8, src: "/lovable-uploads/30a87c81-efd3-4af7-b526-79d33aea1b3c.png", alt: "Logo Cliente 8" },
  ];

  return (
    <div className="w-full py-6 rounded-xl">
      <div className="overflow-hidden">
        <InfiniteCarousel 
          duration={30}
          pauseOnHover={true}
          className="py-4"
        >
          {logos.map((logo) => (
            <Logo key={logo.id} id={logo.id} src={logo.src} alt={logo.alt} />
          ))}
        </InfiniteCarousel>
      </div>
    </div>
  );
};

export default ClientLogos;
