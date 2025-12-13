import useSWR from 'swr';
import { useCallback } from 'react';
import { stockApi, StockAvailability, OrderAvailability } from '@/lib/api/stock';
import { mutate } from 'swr';
import { showToast } from '@/utils/toast';

export const useMenuItemAvailability = (itemId: number | null) => {
  const { data, error, isLoading } = useSWR<StockAvailability>(
    itemId ? ['stock', 'menu-item', itemId] : null,
    () => stockApi.checkMenuItemAvailability(itemId!),
    {
      revalidateOnFocus: false,
      refreshInterval: 5000, // Refresh every 5 seconds
    }
  );

  return {
    availability: data,
    isLoading,
    isError: error,
  };
};

export const useOrderAvailability = (orderId: number | null) => {
  const { data, error, isLoading } = useSWR<OrderAvailability>(
    orderId ? ['stock', 'order', orderId] : null,
    () => stockApi.checkOrderAvailability(orderId!),
    {
      revalidateOnFocus: false,
      refreshInterval: 10000, // Refresh every 10 seconds (reduced from 5s)
    }
  );

  return {
    availability: data,
    isLoading,
    isError: error,
  };
};

export const useRestockIngredient = () => {
  const restockIngredient = useCallback(
    async (ingredientId: number, quantity: number, employeeId?: number): Promise<void> => {
      try {
        await showToast.promise(
          stockApi.restockIngredient(ingredientId, quantity, employeeId),
          {
            loading: 'Restocking ingredient...',
            success: `Successfully restocked ${quantity} units!`,
            error: 'Failed to restock ingredient',
          }
        );
        mutate(['stock']);
        mutate(['inventory']);
      } catch (error) {
        throw error;
      }
    },
    []
  );

  return { restockIngredient };
};

