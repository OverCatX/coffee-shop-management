import apiClient from './client';

export interface Ingredient {
  ingredient_id: number;
  name: string;
  unit: string;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}

export interface IngredientCreate {
  name: string;
  unit: string;
}

export interface IngredientUpdate {
  name?: string;
  unit?: string;
}

const ingredientsApi = {
  getAll: async (skip: number = 0, limit: number = 1000): Promise<Ingredient[]> => {
    const { data } = await apiClient.get<Ingredient[]>('/ingredients', {
      params: { skip, limit },
    });
    return data;
  },

  getById: async (id: number): Promise<Ingredient> => {
    const { data } = await apiClient.get<Ingredient>(`/ingredients/${id}`);
    return data;
  },

  create: async (ingredient: IngredientCreate): Promise<Ingredient> => {
    const { data } = await apiClient.post<Ingredient>('/ingredients', ingredient);
    return data;
  },

  update: async (id: number, ingredient: IngredientUpdate): Promise<Ingredient> => {
    const { data } = await apiClient.put<Ingredient>(`/ingredients/${id}`, ingredient);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/ingredients/${id}`);
  },
};

export { ingredientsApi };

