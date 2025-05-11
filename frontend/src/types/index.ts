export interface Dataset {
  _id: string;
  name: string;
  description?: string;
  columns: string[];
  rowCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Prompt {
  _id: string;
  name: string;
  description?: string;
  template: string;
  variables: {
    name: string;
    description?: string;
    required: boolean;
  }[];
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface Evaluation {
  _id: string;
  dataset: Dataset;
  prompt: Prompt;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  results: {
    rowIndex: number;
    generatedPrompt: string;
    responses: {
      model: 'groq' | 'gemini';
      response: string;
      scores: {
        correctness: number;
        faithfulness: number;
      };
    }[];
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
} 