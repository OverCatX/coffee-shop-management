import apiClient from './client';
import { mockCustomersApi } from '../mocks';
import { USE_MOCK_DATA } from '../mocks';

export interface Customer {
  customer_id: number;
  name: string;
  phone?: string;
  email?: string;
  loyalty_points: number;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}

export interface CustomerCreate {
  name: string;
  phone?: string;
  email?: string;
  loyalty_points?: number;
}

export interface CustomerUpdate {
  name?: string;
  phone?: string;
  email?: string;
  loyalty_points?: number;
}

const realCustomersApi = {
  getAll: async (skip: number = 0, limit: number = 1000): Promise<Customer[]> => {
    const { data } = await apiClient.get<Customer[]>('/customers', {
      params: { skip, limit },
    });
    return data;
  },

  getById: async (id: number): Promise<Customer> => {
    const { data } = await apiClient.get<Customer>(`/customers/${id}`);
    return data;
  },

  search: async (query: string): Promise<Customer[]> => {
    const { data } = await apiClient.get<Customer[]>('/customers/search/query', {
      params: { q: query, limit: 1000 },
    });
    return data;
  },

  create: async (customer: CustomerCreate): Promise<Customer> => {
    const { data } = await apiClient.post<Customer>('/customers', customer);
    return data;
  },

  update: async (id: number, customer: CustomerUpdate): Promise<Customer> => {
    const { data } = await apiClient.put<Customer>(`/customers/${id}`, customer);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/customers/${id}`);
  },

  updateLoyaltyPoints: async (id: number, points: number): Promise<Customer> => {
    const { data } = await apiClient.post<Customer>(`/customers/${id}/loyalty-points`, null, {
      params: { points },
    });
    return data;
  },
};

export const customersApi = USE_MOCK_DATA ? mockCustomersApi : realCustomersApi;

