import apiClient from './client';
import { Entry } from '../types';

export const entriesApi = {
  getAll: async (params?: {
    itemId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Entry[]> => {
    const response = await apiClient.get<Entry[]>('/entries', { params });
    return response.data;
  },

  getById: async (id: string): Promise<Entry> => {
    const response = await apiClient.get<Entry>(`/entries/${id}`);
    return response.data;
  },

  create: async (data: Partial<Entry>): Promise<Entry> => {
    const response = await apiClient.post<Entry>('/entries', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Entry>): Promise<Entry> => {
    const response = await apiClient.put<Entry>(`/entries/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/entries/${id}`);
  },
};
