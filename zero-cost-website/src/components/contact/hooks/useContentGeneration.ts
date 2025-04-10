
import { useState } from "react";
import { GeneratedCopy } from "../types";
import { toast } from "sonner";

// This is an empty hook that no longer uses OpenAI
export const useContentGeneration = () => {
  const [generatedCopy, setGeneratedCopy] = useState<GeneratedCopy>({
    content: "",
    isLoading: false,
    error: null,
  });
  
  const [isAiEditing, setIsAiEditing] = useState(false);

  // This function doesn't do anything anymore
  const generateContent = async (): Promise<boolean> => {
    toast.error("Content generation is no longer available");
    return false;
  };

  // This function doesn't do anything anymore
  const editContent = async (): Promise<boolean> => {
    toast.error("Content editing is no longer available");
    return false;
  };

  const resetGeneratedContent = () => {
    setGeneratedCopy({
      content: "",
      isLoading: false,
      error: null,
    });
    setIsAiEditing(false);
    localStorage.removeItem('generated_content');
  };

  return {
    generatedCopy,
    isAiEditing,
    generateContent,
    editContent,
    resetGeneratedContent
  };
};
