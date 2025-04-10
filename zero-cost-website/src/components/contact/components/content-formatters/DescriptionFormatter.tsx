
import React from 'react';

interface DescriptionFormatterProps {
  line: string;
}

const DescriptionFormatter: React.FC<DescriptionFormatterProps> = ({ line }) => {
  const description = line.replace('DESCRIÇÃO:', '').trim();
  
  return (
    <p className="text-xl text-gray-700 my-4 leading-relaxed">
      {description}
    </p>
  );
};

export default DescriptionFormatter;
