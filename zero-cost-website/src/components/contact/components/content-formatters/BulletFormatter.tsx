
import React from 'react';
import { Check, Star, Zap, Award, Target } from 'lucide-react';

interface BulletFormatterProps {
  line: string;
  index: number;
}

const BulletFormatter: React.FC<BulletFormatterProps> = ({ line, index }) => {
  const bulletText = line.replace(/^[•\-*]\s*/, '').replace(/^\d+\.\s*/, '').trim();
  
  // Detectar bullet points com título e descrição (formato "Título: Descrição")
  if (bulletText.includes(':') && bulletText.split(':')[0].length < 30) {
    const [title, description] = bulletText.split(':');
    
    // Use ícones diferentes para dar mais dinamismo visual
    const icons = [
      <Star key="star" size={18} className="text-yellow-500 mr-3 mt-0.5 flex-shrink-0" />,
      <Zap key="zap" size={18} className="text-blue-500 mr-3 mt-0.5 flex-shrink-0" />,
      <Award key="award" size={18} className="text-purple-500 mr-3 mt-0.5 flex-shrink-0" />,
      <Target key="target" size={18} className="text-red-500 mr-3 mt-0.5 flex-shrink-0" />
    ];
    
    return (
      <div className="mb-4 ml-4 flex items-start bg-gray-50 p-3 rounded-lg border-l-2 border-highlight">
        {icons[index % icons.length]}
        <div>
          <p className="font-semibold text-gray-800">{title.trim()}:</p>
          <p className="text-gray-700">{description.trim()}</p>
        </div>
      </div>
    );
  } 
  
  // Bullet point padrão
  return (
    <div className="flex items-start mb-4 ml-4 hover:translate-x-1 transition-transform">
      <Check size={18} className="text-highlight mr-3 mt-0.5 flex-shrink-0" />
      <p className="text-gray-700">{bulletText}</p>
    </div>
  );
};

export default BulletFormatter;
