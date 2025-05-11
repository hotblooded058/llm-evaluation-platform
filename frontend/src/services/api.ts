import axios from 'axios';
import { ApiResponse, Dataset, Prompt, Evaluation } from '../types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Dataset APIs
export const uploadDataset = async (file: File, name?: string, description?: string): Promise<ApiResponse<Dataset>> => {
  const formData = new FormData();
  formData.append('file', file);
  if (name) formData.append('name', name);
  if (description) formData.append('description', description);

  const response = await api.post<ApiResponse<Dataset>>('/datasets', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getDatasets = async (): Promise<ApiResponse<Dataset[]>> => {
  const response = await api.get<ApiResponse<Dataset[]>>('/datasets');
  return response.data;
};

export const getDatasetById = async (id: string): Promise<ApiResponse<Dataset>> => {
  const response = await api.get<ApiResponse<Dataset>>(`/datasets/${id}`);
  return response.data;
};

export const deleteDataset = async (id: string): Promise<ApiResponse<void>> => {
  const response = await api.delete<ApiResponse<void>>(`/datasets/${id}`);
  return response.data;
};

// Get dataset content
export const getDatasetContent = async (id: string): Promise<ApiResponse<{ columns: string[]; rows: any[] }>> => {
  const response = await api.get<ApiResponse<{ columns: string[]; rows: any[] }>>(`/datasets/${id}/content`);
  return response.data;
};

// Prompt APIs
export const createPrompt = async (prompt: Omit<Prompt, '_id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Prompt>> => {
  const response = await api.post<ApiResponse<Prompt>>('/prompts', prompt);
  return response.data;
};

export const getPrompts = async (): Promise<ApiResponse<Prompt[]>> => {
  const response = await api.get<ApiResponse<Prompt[]>>('/prompts');
  return response.data;
};

export const getPromptById = async (id: string): Promise<ApiResponse<Prompt>> => {
  const response = await api.get<ApiResponse<Prompt>>(`/prompts/${id}`);
  return response.data;
};

export const updatePrompt = async (id: string, prompt: Partial<Prompt>): Promise<ApiResponse<Prompt>> => {
  const response = await api.put<ApiResponse<Prompt>>(`/prompts/${id}`, prompt);
  return response.data;
};

export const deletePrompt = async (id: string): Promise<ApiResponse<void>> => {
  const response = await api.delete<ApiResponse<void>>(`/prompts/${id}`);
  return response.data;
};

// Evaluation APIs
export const startEvaluation = async (datasetId: string, promptId: string): Promise<ApiResponse<Evaluation>> => {
  const response = await api.post<ApiResponse<Evaluation>>('/evaluations', {
    datasetId,
    promptId,
  });
  return response.data;
};

export const getEvaluations = async (): Promise<ApiResponse<Evaluation[]>> => {
  const response = await api.get<ApiResponse<Evaluation[]>>('/evaluations');
  return response.data;
};

export const getEvaluationById = async (id: string): Promise<ApiResponse<Evaluation>> => {
  const response = await api.get<ApiResponse<Evaluation>>(`/evaluations/${id}`);
  return response.data;
};

// Delete evaluation
export const deleteEvaluation = async (id: string): Promise<ApiResponse<null>> => {
  try {
    const response = await api.delete(`/evaluations/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting evaluation:', error);
    throw error;
  }
}; 