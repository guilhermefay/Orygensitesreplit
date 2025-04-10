
import React from 'react';
import { MessageCircle } from 'lucide-react';

interface QuestionFormatterProps {
  line: string;
}

const QuestionFormatter: React.FC<QuestionFormatterProps> = ({ line }) => {
  return (
    <p className="text-lg font-medium mt-6 mb-2 text-gray-800 flex items-start">
      <MessageCircle size={18} className="text-blue-500 mr-3 mt-1 flex-shrink-0" />
      {line}
    </p>
  );
};

export default QuestionFormatter;
