
import React from 'react';

interface TitleFormatterProps {
  line: string;
}

const TitleFormatter: React.FC<TitleFormatterProps> = ({ line }) => {
  const heading = line.replace('TÍTULO:', '').trim();
  
  return (
    <h1 className="text-3xl md:text-4xl font-bold my-5 text-gray-900 leading-tight">
      {heading}
    </h1>
  );
};

export default TitleFormatter;
