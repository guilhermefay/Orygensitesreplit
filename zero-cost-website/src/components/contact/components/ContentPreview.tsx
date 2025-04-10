
import React, { useEffect } from 'react';
import ContentFormatter from './ContentFormatter';
import { useIsMobile } from '@/hooks/use-mobile';

interface ContentPreviewProps {
  content: string;
  onContentRendered?: (renderedContent: string) => void;
}

const ContentPreview: React.FC<ContentPreviewProps> = ({ content, onContentRendered }) => {
  const isMobile = useIsMobile();
  
  // When the content is rendered, notify the parent component and save to localStorage as backup
  useEffect(() => {
    if (content) {
      console.log("ContentPreview - Content received, length:", content.length);
      
      // Save to localStorage as a backup mechanism
      if (content.length > 0) {
        console.log("ContentPreview - Saving to localStorage as backup");
        localStorage.setItem('generated_content', content);
      }
      
      if (onContentRendered) {
        console.log("ContentPreview - Notifying parent about rendered content");
        onContentRendered(content);
      }
    }
  }, [content, onContentRendered]);

  // Also call onContentRendered on mount to ensure content is captured immediately
  useEffect(() => {
    if (onContentRendered && content) {
      console.log("ContentPreview - Initial content render notification, length:", content.length);
      onContentRendered(content);
    }
  }, []);

  return (
    <div className={`prose ${isMobile ? 'prose-xs max-w-full px-1' : 'prose-sm max-w-none p-6'} bg-white rounded-xl shadow-sm`}>
      <ContentFormatter content={content || ""} />
    </div>
  );
};

export default ContentPreview;
