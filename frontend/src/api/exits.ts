import apiClient from './client';
import { Exit } from '../types';

export const exitsApi = {
  getAll: async (params?: {
    itemId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Exit[]> => {
    const response = await apiClient.get<Exit[]>('/exits', { params });
    return response.data;
  },

  getById: async (id: string): Promise<Exit> => {
    const response = await apiClient.get<Exit>(`/exits/${id}`);
    return response.data;
  },

  create: async (data: Partial<Exit>): Promise<Exit> => {
    const response = await apiClient.post<Exit>('/exits', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Exit>): Promise<Exit> => {
    const response = await apiClient.put<Exit>(`/exits/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/exits/${id}`);
  },
};
