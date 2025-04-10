
import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface InfiniteCarouselProps {
  className?: string;
  children: React.ReactNode;
  duration?: number; // Duration in seconds
  direction?: 'left' | 'right';
  pauseOnHover?: boolean;
}

export const InfiniteCarousel = ({
  className,
  children,
  duration = 25,
  direction = 'left',
  pauseOnHover = true,
}: InfiniteCarouselProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    // Make a clone of the content for seamless looping
    const content = container.firstElementChild as HTMLElement;
    if (!content) return;
    
    const clone = content.cloneNode(true) as HTMLElement;
    container.appendChild(clone);
    
    const directionMultiplier = direction === 'left' ? -1 : 1;
    const animation = container.animate(
      [
        { transform: 'translateX(0%)' },
        { transform: `translateX(${directionMultiplier * 50}%)` }, // Only move by 50% since we duplicated the content
      ],
      {
        duration: duration * 1000,
        iterations: Infinity,
        easing: 'linear',
      }
    );
    
    if (pauseOnHover) {
      container.addEventListener('mouseenter', () => {
        animation.pause();
      });
      
      container.addEventListener('mouseleave', () => {
        animation.play();
      });
    }
    
    return () => {
      animation.cancel();
    };
  }, [duration, direction, pauseOnHover]);
  
  return (
    <div className={cn("overflow-hidden", className)}>
      <div ref={containerRef} className="flex whitespace-nowrap">
        <div className="flex">{children}</div>
      </div>
    </div>
  );
};
