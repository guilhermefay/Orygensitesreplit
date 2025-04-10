
import React from 'react';
import { ThumbsUp } from 'lucide-react';

interface HighlightFormatterProps {
  line: string;
}

const HighlightFormatter: React.FC<HighlightFormatterProps> = ({ line }) => {
  const highlightText = line.substring(1).trim();
  
  return (
    <div className="flex items-start my-4 ml-2">
      <ThumbsUp size={18} className="text-green-500 mr-3 mt-1 flex-shrink-0" />
      <p className="text-gray-800 font-medium">{highlightText}</p>
    </div>
  );
};

export default HighlightFormatter;
