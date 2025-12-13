import apiClient from './client';

export interface RecipeItem {
  item_id: number;
  ingredient_id: number;
  amount_required: number;
  unit: string;
  ingredient: {
    ingredient_id: number;
    name: string;
    unit: string;
  };
  menu_item?: {
    item_id: number;
    name: string;
    category: string;
  };
}

export interface RecipeItemCreate {
  ingredient_id: number;
  amount_required: number;
  unit: string;
}

export interface RecipeItemUpdate {
  amount_required?: number;
  unit?: string;
}

const recipesApi = {
  getByMenuItem: async (itemId: number): Promise<RecipeItem[]> => {
    const { data } = await apiClient.get<RecipeItem[]>(`/recipes/menu-item/${itemId}`);
    return data;
  },

  getByIngredient: async (ingredientId: number): Promise<RecipeItem[]> => {
    const { data } = await apiClient.get<RecipeItem[]>(`/recipes/ingredient/${ingredientId}`);
    return data;
  },

  addIngredient: async (itemId: number, recipeItem: RecipeItemCreate): Promise<RecipeItem> => {
    const { data } = await apiClient.post<RecipeItem>(`/recipes/menu-item/${itemId}`, recipeItem);
    return data;
  },

  updateIngredient: async (
    itemId: number,
    ingredientId: number,
    recipeItem: RecipeItemUpdate
  ): Promise<RecipeItem> => {
    const { data } = await apiClient.put<RecipeItem>(
      `/recipes/menu-item/${itemId}/ingredient/${ingredientId}`,
      recipeItem
    );
    return data;
  },

  removeIngredient: async (itemId: number, ingredientId: number): Promise<void> => {
    await apiClient.delete(`/recipes/menu-item/${itemId}/ingredient/${ingredientId}`);
  },
};

export { recipesApi };

