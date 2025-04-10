
export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  selectedPlan: string;
  business: string;
  description: string;
  industry: string;
  competitors: string;
  goals: string;
  colors: string;
  style: string;
  logo: boolean;
  additional: string;
  businessDetails?: string;
}

export interface FileData {
  logo: File[] | null;
  photos: File[] | null;
}

export interface AiResponse {
  content: string;
}

// Add the missing types below
export interface GeneratedCopy {
  content: string;
  isLoading: boolean;
  error: string | null;
}

export interface ContentContainerProps {
  onBack?: (e?: React.MouseEvent) => void;
  onConfirm?: (e?: React.MouseEvent) => void;
}

export interface ContentPreviewProps {
  content: string;
  onContentRendered?: (renderedContent: string) => void;
}
