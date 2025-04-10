
import React from 'react';

interface PageFormatterProps {
  line: string;
  currentPageIndex: number;
}

const PageFormatter: React.FC<PageFormatterProps> = ({ line, currentPageIndex }) => {
  const pageName = line.replace('==== PÁGINA:', '').replace('====', '').trim();
  
  return (
    <div className="mb-10 mt-14">
      <div className="bg-gradient-to-r from-gray-100 to-transparent rounded-lg p-4 border-l-4 border-highlight shadow-sm">
        <h2 className="text-2xl font-bold text-black">
          {pageName}
        </h2>
        <div className="text-gray-500 text-sm mt-1">Visualização da página</div>
      </div>
      <div className="w-16 h-1 bg-highlight mt-2"></div>
    </div>
  );
};

export default PageFormatter;
