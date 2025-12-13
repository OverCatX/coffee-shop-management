import apiClient from './client';
import { MenuItem } from '@/types';
import { mockMenuItemsApi } from '../mocks';
import { USE_MOCK_DATA } from '../mocks';

export interface MenuItemCreate {
  name: string;
  price: number;
  category: string;
  description?: string;
  is_available?: boolean;
}

export interface MenuItemUpdate {
  name?: string;
  price?: number;
  category?: string;
  description?: string;
  is_available?: boolean;
}

const realMenuItemsApi = {
  getAll: async (availableOnly: boolean = false): Promise<MenuItem[]> => {
    const { data } = await apiClient.get<MenuItem[]>('/menu-items', {
      params: { available_only: availableOnly, limit: 1000 },
    });
    return data;
  },

  getById: async (id: number): Promise<MenuItem> => {
    const { data } = await apiClient.get<MenuItem>(`/menu-items/${id}`);
    return data;
  },

  getByCategory: async (category: string): Promise<MenuItem[]> => {
    const { data } = await apiClient.get<MenuItem[]>(`/menu-items/category/${category}`, {
      params: { limit: 1000 },
    });
    return data;
  },

  create: async (menuItem: MenuItemCreate): Promise<MenuItem> => {
    const { data } = await apiClient.post<MenuItem>('/menu-items', menuItem);
    return data;
  },

  update: async (id: number, menuItem: MenuItemUpdate): Promise<MenuItem> => {
    const { data } = await apiClient.put<MenuItem>(`/menu-items/${id}`, menuItem);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/menu-items/${id}`);
  },

  toggleAvailability: async (id: number): Promise<MenuItem> => {
    const { data } = await apiClient.post<MenuItem>(`/menu-items/${id}/toggle-availability`);
    return data;
  },
};

export const menuItemsApi = USE_MOCK_DATA ? mockMenuItemsApi : realMenuItemsApi;

