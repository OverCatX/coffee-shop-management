import apiClient from './client';

export interface IngredientInfo {
  ingredient_id: number;
  name: string;
  unit: string;
}

export interface Inventory {
  inventory_id: number;
  ingredient_id: number;
  quantity: number;
  min_threshold: number;
  employee_id?: number;
  last_updated: string;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  ingredient?: IngredientInfo; // Ingredient details
}

export interface InventoryCreate {
  ingredient_id: number;
  quantity: number;
  min_threshold: number;
  employee_id?: number;
}

export interface InventoryUpdate {
  quantity?: number;
  min_threshold?: number;
  employee_id?: number;
}

const inventoryApi = {
  getAll: async (skip: number = 0, limit: number = 1000): Promise<Inventory[]> => {
    const { data } = await apiClient.get<Inventory[]>('/inventory', {
      params: { skip, limit },
    });
    return data;
  },

  getLowStock: async (skip: number = 0, limit: number = 1000): Promise<Inventory[]> => {
    const { data } = await apiClient.get<Inventory[]>('/inventory/low-stock', {
      params: { skip, limit },
    });
    return data;
  },

  getById: async (id: number): Promise<Inventory> => {
    const { data } = await apiClient.get<Inventory>(`/inventory/${id}`);
    return data;
  },

  getByIngredient: async (ingredientId: number): Promise<Inventory> => {
    const { data } = await apiClient.get<Inventory>(`/inventory/ingredient/${ingredientId}`);
    return data;
  },

  create: async (inventory: InventoryCreate): Promise<Inventory> => {
    const { data } = await apiClient.post<Inventory>('/inventory', inventory);
    return data;
  },

  update: async (id: number, inventory: InventoryUpdate): Promise<Inventory> => {
    const { data } = await apiClient.put<Inventory>(`/inventory/${id}`, inventory);
    return data;
  },

  updateQuantity: async (
    ingredientId: number,
    quantityChange: number,
    employeeId?: number
  ): Promise<Inventory> => {
    const { data } = await apiClient.patch<Inventory>(
      `/inventory/ingredient/${ingredientId}/quantity`,
      null,
      {
        params: { quantity_change: quantityChange, employee_id: employeeId },
      }
    );
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/inventory/${id}`);
  },
};

export { inventoryApi };

