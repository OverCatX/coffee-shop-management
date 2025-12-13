import apiClient from './client';
import { Order, OrderCreate } from '@/types';
import { mockOrdersApi } from '../mocks';
import { USE_MOCK_DATA } from '../mocks';

const realOrdersApi = {
  create: async (order: OrderCreate): Promise<Order> => {
    const { data } = await apiClient.post<Order>('/orders', order);
    return data;
  },

  getAll: async (): Promise<Order[]> => {
    const { data } = await apiClient.get<Order[]>('/orders', {
      params: { limit: 1000 },
    });
    return data;
  },

  getById: async (id: number): Promise<Order> => {
    const { data } = await apiClient.get<Order>(`/orders/${id}`);
    return data;
  },

  getByStatus: async (status: 'pending' | 'completed' | 'cancelled'): Promise<Order[]> => {
    const { data } = await apiClient.get<Order[]>(`/orders/status/${status}`, {
      params: { limit: 1000 },
    });
    return data;
  },

  updateStatus: async (id: number, status: 'pending' | 'completed' | 'cancelled'): Promise<Order> => {
    const { data } = await apiClient.patch<Order>(`/orders/${id}/status`, null, {
      params: { status },
    });
    return data;
  },
};

export const ordersApi = USE_MOCK_DATA ? mockOrdersApi : realOrdersApi;

