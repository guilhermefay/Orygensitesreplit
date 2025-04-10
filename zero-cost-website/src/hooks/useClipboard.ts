
import { useState } from 'react';

export const useClipboard = (timeout: number = 2000) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), timeout);
      return true;
    } catch (error) {
      console.error('Failed to copy text: ', error);
      return false;
    }
  };

  return { copied, copyToClipboard };
};
