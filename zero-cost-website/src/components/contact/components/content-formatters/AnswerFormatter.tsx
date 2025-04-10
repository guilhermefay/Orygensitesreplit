
import React from 'react';

interface AnswerFormatterProps {
  line: string;
}

const AnswerFormatter: React.FC<AnswerFormatterProps> = ({ line }) => {
  return (
    <p className="mb-5 text-gray-700 leading-relaxed pl-6 border-l-2 border-gray-200 py-2">
      {line}
    </p>
  );
};

export default AnswerFormatter;
