
import React from 'react';
import { ArrowRight } from 'lucide-react';

interface CTAFormatterProps {
  line: string;
}

const CTAFormatter: React.FC<CTAFormatterProps> = ({ line }) => {
  const ctaText = line.replace('CTA:', '').trim();
  
  return (
    <div className="my-6">
      <button className="bg-highlight text-black px-6 py-3 rounded-md font-medium hover:bg-yellow-300 transition-colors shadow-md flex items-center gap-2">
        {ctaText}
        <ArrowRight size={16} />
      </button>
    </div>
  );
};

export default CTAFormatter;
