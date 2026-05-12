export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: string;
}

export interface GeneratedIdea {
  name: string;
  prompt: string;
  negativePrompt: string;
  etsyTitle: string;
  tags: string[];
  description: string;
  canvaSpecs: {
    dimensions: string;
    layout: string;
    fonts: string[];
  };
  mockupSuggestion: string;
}

export interface ProductPackage {
  id?: string;
  userId: string;
  title: string;
  category: string;
  style: string;
  theme: string;
  audience: string;
  colorPalette?: string[];
  ideas: GeneratedIdea[];
  status: 'draft' | 'completed';
  createdAt: any;
  updatedAt: any;
}
