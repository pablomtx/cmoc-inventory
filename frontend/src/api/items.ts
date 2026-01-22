import apiClient from './client';
import { Item } from '../types';

export const itemsApi = {
  getAll: async (params?: {
    categoriaId?: string;
    search?: string;
    status?: string;
  }): Promise<Item[]> => {
    const response = await apiClient.get<Item[]>('/items', { params });
    return response.data;
  },

  getById: async (id: string): Promise<Item> => {
    const response = await apiClient.get<Item>(`/items/${id}`);
    return response.data;
  },

  getByQRCode: async (qrCode: string): Promise<Item> => {
    const response = await apiClient.get<Item>(`/items/qrcode/${qrCode}`);
    return response.data;
  },

  create: async (formData: FormData): Promise<Item> => {
    const response = await apiClient.post<Item>('/items', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  update: async (id: string, formData: FormData): Promise<Item> => {
    const response = await apiClient.put<Item>(`/items/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/items/${id}`);
  },
};
