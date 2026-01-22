import apiClient from './client';
import { Return } from '../types';

export const returnsApi = {
  getAll: async (params?: {
    condicao?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Return[]> => {
    const response = await apiClient.get<Return[]>('/returns', { params });
    return response.data;
  },

  getById: async (id: string): Promise<Return> => {
    const response = await apiClient.get<Return>(`/returns/${id}`);
    return response.data;
  },

  create: async (formData: FormData): Promise<Return> => {
    const response = await apiClient.post<Return>('/returns', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  update: async (id: string, data: Partial<Return>): Promise<Return> => {
    const response = await apiClient.put<Return>(`/returns/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/returns/${id}`);
  },
};
