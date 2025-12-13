import useSWR from 'swr';
import { useCallback } from 'react';
import { recipesApi, RecipeItem, RecipeItemCreate, RecipeItemUpdate } from '@/lib/api/recipes';
import { mutate } from 'swr';
import { showToast } from '@/utils/toast';

export const useRecipeByMenuItem = (itemId: number | null) => {
  const { data, error, isLoading } = useSWR<RecipeItem[]>(
    itemId ? ['recipes', 'menu-item', itemId] : null,
    () => recipesApi.getByMenuItem(itemId!),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    recipeItems: data || [],
    isLoading,
    isError: error,
  };
};

export const useRecipeByIngredient = (ingredientId: number | null) => {
  const { data, error, isLoading } = useSWR<RecipeItem[]>(
    ingredientId ? ['recipes', 'ingredient', ingredientId] : null,
    () => recipesApi.getByIngredient(ingredientId!),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    recipeItems: data || [],
    isLoading,
    isError: error,
  };
};

export const useAddRecipeIngredient = () => {
  const addIngredient = useCallback(
    async (itemId: number, recipeItem: RecipeItemCreate): Promise<RecipeItem> => {
      try {
        const newRecipeItem = await showToast.promise(
          recipesApi.addIngredient(itemId, recipeItem),
          {
            loading: 'Adding ingredient to recipe...',
            success: 'Ingredient added to recipe!',
            error: 'Failed to add ingredient',
          }
        );
        mutate(['recipes', 'menu-item', itemId]);
        return newRecipeItem;
      } catch (error) {
        throw error;
      }
    },
    []
  );

  return { addIngredient };
};

export const useUpdateRecipeIngredient = () => {
  const updateIngredient = useCallback(
    async (
      itemId: number,
      ingredientId: number,
      recipeItem: RecipeItemUpdate
    ): Promise<RecipeItem> => {
      try {
        const updated = await showToast.promise(
          recipesApi.updateIngredient(itemId, ingredientId, recipeItem),
          {
            loading: 'Updating recipe...',
            success: 'Recipe updated successfully!',
            error: 'Failed to update recipe',
          }
        );
        mutate(['recipes', 'menu-item', itemId]);
        return updated;
      } catch (error) {
        throw error;
      }
    },
    []
  );

  return { updateIngredient };
};

export const useRemoveRecipeIngredient = () => {
  const removeIngredient = useCallback(
    async (itemId: number, ingredientId: number): Promise<void> => {
      try {
        await showToast.promise(
          recipesApi.removeIngredient(itemId, ingredientId),
          {
            loading: 'Removing ingredient...',
            success: 'Ingredient removed from recipe!',
            error: 'Failed to remove ingredient',
          }
        );
        mutate(['recipes', 'menu-item', itemId]);
      } catch (error) {
        throw error;
      }
    },
    []
  );

  return { removeIngredient };
};

