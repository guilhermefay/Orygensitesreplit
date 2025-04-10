
import React from 'react';

interface ParagraphFormatterProps {
  line: string;
}

const ParagraphFormatter: React.FC<ParagraphFormatterProps> = ({ line }) => {
  // Detectar parágrafos importantes (contendo palavras-chave)
  const baseClass = "mb-4 text-gray-700 leading-relaxed";
  const importantKeywords = ['importante', 'essencial', 'fundamental', 'crucial', 'principal', 'melhor', 'único'];
  const hasImportantKeyword = importantKeywords.some(keyword => 
    line.toLowerCase().includes(keyword)
  );
  
  if (hasImportantKeyword) {
    return (
      <p className={`${baseClass} font-medium border-l-2 border-highlight pl-3`}>{line}</p>
    );
  }
  
  return (
    <p className={baseClass}>{line}</p>
  );
};

export default ParagraphFormatter;
