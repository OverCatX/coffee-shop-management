import apiClient from './client';

export interface StockAvailability {
  item_id: number;
  item_name: string;
  can_make: boolean;
  missing_ingredients: Array<{
    ingredient_id: number;
    ingredient_name: string;
    required: number;
    available: number;
    unit: string;
  }>;
  low_stock_ingredients: Array<{
    ingredient_id: number;
    ingredient_name: string;
    required: number;
    available: number;
    unit: string;
    min_threshold: number;
  }>;
  ingredients_status: Array<{
    ingredient_id: number;
    ingredient_name: string;
    required: number;
    available: number;
    unit: string;
    status: 'available' | 'low_stock' | 'insufficient' | 'missing';
  }>;
}

export interface OrderAvailability {
  order_id: number;
  can_fulfill: boolean;
  items: Array<{
    item_id: number;
    item_name: string;
    quantity: number;
    can_make: boolean;
    missing_ingredients: Array<{
      ingredient_name: string;
      required: number;
      available: number;
      unit: string;
    }>;
  }>;
}

const stockApi = {
  restockIngredient: async (
    ingredientId: number,
    quantity: number,
    employeeId?: number
  ) => {
    const { data } = await apiClient.post(
      `/stock/ingredient/${ingredientId}/restock`,
      null,
      {
        params: {
          quantity: quantity.toString(),
          ...(employeeId && { employee_id: employeeId.toString() }),
        },
      }
    );
    return data;
  },

  checkMenuItemAvailability: async (
    itemId: number,
    quantity: number = 1
  ): Promise<StockAvailability> => {
    const { data } = await apiClient.get<StockAvailability>(
      `/stock/menu-item/${itemId}/availability`,
      {
        params: { quantity },
      }
    );
    return data;
  },

  checkOrderAvailability: async (
    orderId: number
  ): Promise<OrderAvailability> => {
    const { data } = await apiClient.get<OrderAvailability>(
      `/stock/order/${orderId}/availability`
    );
    return data;
  },
};

export { stockApi };

