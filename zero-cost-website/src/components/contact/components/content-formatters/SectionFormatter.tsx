
import React from 'react';
import { Bookmark } from 'lucide-react';

interface SectionFormatterProps {
  line: string;
}

const SectionFormatter: React.FC<SectionFormatterProps> = ({ line }) => {
  const sectionTitle = line.replace('SEÇÃO:', '').replace('- SEÇÃO:', '').trim();
  
  return (
    <div className="mt-10 mb-6">
      <div className="flex items-center gap-2 text-xl font-semibold text-gray-800">
        <Bookmark size={18} className="text-highlight" />
        <h3 className="border-b border-gray-200 pb-2 w-full">
          {sectionTitle}
        </h3>
      </div>
    </div>
  );
};

export default SectionFormatter;
