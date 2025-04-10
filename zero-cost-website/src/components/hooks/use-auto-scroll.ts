
import { useCallback, useEffect, useRef, useState } from "react";

interface UseAutoScrollOptions {
  smooth?: boolean;
  content?: React.ReactNode;
  threshold?: number;
}

export function useAutoScroll({
  smooth = false,
  content,
  threshold = 100,
}: UseAutoScrollOptions = {}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);

  const checkIfAtBottom = useCallback(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return true;

    const scrollBottom = Math.floor(scrollElement.scrollHeight - scrollElement.scrollTop);
    const clientHeight = Math.floor(scrollElement.clientHeight);
    const isAtBottom = scrollBottom <= clientHeight + threshold;
    
    setIsAtBottom(isAtBottom);
    return isAtBottom;
  }, [threshold]);

  const scrollToBottom = useCallback(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;

    if (smooth) {
      scrollElement.scrollTo({
        top: scrollElement.scrollHeight,
        behavior: "smooth",
      });
    } else {
      scrollElement.scrollTop = scrollElement.scrollHeight;
    }
    
    setAutoScrollEnabled(true);
    setIsAtBottom(true);
  }, [smooth]);

  const disableAutoScroll = useCallback(() => {
    if (!checkIfAtBottom()) {
      setAutoScrollEnabled(false);
    }
  }, [checkIfAtBottom]);

  // Auto-scroll when content changes
  useEffect(() => {
    if (autoScrollEnabled) {
      scrollToBottom();
    }
  }, [content, autoScrollEnabled, scrollToBottom]);

  return {
    scrollRef,
    isAtBottom,
    autoScrollEnabled,
    scrollToBottom,
    disableAutoScroll,
    checkIfAtBottom,
  };
}
