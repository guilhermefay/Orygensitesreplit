
import React from 'react';

interface ImpactFormatterProps {
  line: string;
  currentPageIndex: number;
}

const ImpactFormatter: React.FC<ImpactFormatterProps> = ({ line, currentPageIndex }) => {
  // Alternar entre estilos diferentes para frases de impacto
  const styles = [
    "text-xl font-medium my-5 text-gray-800 border-l-3 border-highlight pl-4 py-2 bg-gray-50 rounded-r-lg",
    "text-xl font-medium my-5 text-black px-4 py-3 bg-highlight rounded-lg shadow-sm",
    "text-xl font-medium my-5 italic text-gray-800 border-b border-gray-200 pb-2"
  ];
  
  return (
    <p className={styles[currentPageIndex % styles.length]}>
      {line}
    </p>
  );
};

export default ImpactFormatter;
