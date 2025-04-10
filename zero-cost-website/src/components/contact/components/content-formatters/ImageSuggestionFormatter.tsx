
import React from 'react';
import { Image } from 'lucide-react';

interface ImageSuggestionFormatterProps {
  line: string;
}

const ImageSuggestionFormatter: React.FC<ImageSuggestionFormatterProps> = ({ line }) => {
  const imageDesc = line.replace('SUGESTÃO DE IMAGEM:', '').trim();
  
  return (
    <div className="my-5 p-4 bg-gray-50 border border-dashed border-gray-300 rounded-lg flex items-center gap-3 shadow-sm hover:bg-gray-100 transition-all">
      <Image size={24} className="text-gray-400" />
      <p className="text-gray-600 italic flex-1">{imageDesc}</p>
    </div>
  );
};

export default ImageSuggestionFormatter;
