
import React from 'react';

interface CalloutFormatterProps {
  line: string;
  prevContent?: React.ReactNode;
}

const CalloutFormatter: React.FC<CalloutFormatterProps> = ({ line, prevContent }) => {
  return (
    <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 my-6 shadow-sm">
      {prevContent && prevContent}
      <p className="text-gray-800 leading-relaxed">{line}</p>
    </div>
  );
};

export default CalloutFormatter;
