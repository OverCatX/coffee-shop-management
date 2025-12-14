import useSWR from 'swr';
import { useCallback } from 'react';
import { ingredientsApi, Ingredient, IngredientCreate, IngredientUpdate } from '@/lib/api/ingredients';
import { mutate } from 'swr';
import { showToast } from '@/utils/toast';

export const useIngredients = () => {
  const { data, error, isLoading, mutate: mutateIngredients } = useSWR<Ingredient[]>(
    'ingredients',
    () => ingredientsApi.getAll(),
    {
      revalidateOnFocus: false,
      dedupingInterval: 10000,
    }
  );

  return {
    ingredients: data || [],
    isLoading,
    isError: error,
    mutate: mutateIngredients,
  };
};

export const useCreateIngredient = () => {
  const createIngredient = useCallback(async (ingredient: IngredientCreate): Promise<Ingredient> => {
    try {
      const newIngredient = await showToast.promise(
        ingredientsApi.create(ingredient),
        {
          loading: 'Creating ingredient...',
          success: `Ingredient "${ingredient.name}" created successfully!`,
          error: 'Failed to create ingredient',
        }
      );
      mutate('ingredients', undefined, { revalidate: true });
      return newIngredient;
    } catch (error) {
      throw error;
    }
  }, []);

  return { createIngredient };
};

export const useUpdateIngredient = () => {
  const updateIngredient = useCallback(
    async (id: number, ingredient: IngredientUpdate): Promise<Ingredient> => {
      try {
        const updated = await showToast.promise(
          ingredientsApi.update(id, ingredient),
          {
            loading: 'Updating ingredient...',
            success: 'Ingredient updated successfully!',
            error: 'Failed to update ingredient',
          }
        );
        mutate('ingredients', undefined, { revalidate: true });
        return updated;
      } catch (error) {
        throw error;
      }
    },
    []
  );

  return { updateIngredient };
};

export const useDeleteIngredient = () => {
  const deleteIngredient = useCallback(async (id: number): Promise<void> => {
    try {
      await showToast.promise(
        ingredientsApi.delete(id),
        {
          loading: 'Deleting ingredient...',
          success: 'Ingredient deleted successfully!',
          error: 'Failed to delete ingredient',
        }
      );
      mutate('ingredients', undefined, { revalidate: true });
    } catch (error) {
      throw error;
    }
  }, []);

  return { deleteIngredient };
};

