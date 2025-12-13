import useSWR from 'swr';
import { useCallback } from 'react';
import { inventoryApi, Inventory, InventoryCreate, InventoryUpdate } from '@/lib/api/inventory';
import { mutate } from 'swr';
import { showToast } from '@/utils/toast';

export const useInventory = () => {
  const { data, error, isLoading, mutate: mutateInventory } = useSWR<Inventory[]>(
    'inventory',
    () => inventoryApi.getAll(),
    {
      revalidateOnFocus: true,
      refreshInterval: 10000, // Refresh every 10 seconds
    }
  );

  return {
    inventory: data || [],
    isLoading,
    isError: error,
    mutate: mutateInventory,
  };
};

export const useLowStockInventory = () => {
  const { data, error, isLoading } = useSWR<Inventory[]>(
    'inventory-low-stock',
    () => inventoryApi.getLowStock(),
    {
      revalidateOnFocus: true,
      refreshInterval: 5000, // Refresh every 5 seconds for low stock alerts
    }
  );

  return {
    lowStockItems: data || [],
    isLoading,
    isError: error,
  };
};

export const useCreateInventory = () => {
  const createInventory = useCallback(async (inventory: InventoryCreate): Promise<Inventory> => {
    try {
      const newInventory = await showToast.promise(
        inventoryApi.create(inventory),
        {
          loading: 'Creating inventory record...',
          success: 'Inventory record created successfully!',
          error: 'Failed to create inventory record',
        }
      );
      mutate('inventory');
      mutate('inventory-low-stock');
      return newInventory;
    } catch (error) {
      throw error;
    }
  }, []);

  return { createInventory };
};

export const useUpdateInventory = () => {
  const updateInventory = useCallback(
    async (id: number, inventory: InventoryUpdate): Promise<Inventory> => {
      try {
        const updated = await showToast.promise(
          inventoryApi.update(id, inventory),
          {
            loading: 'Updating inventory...',
            success: 'Inventory updated successfully!',
            error: 'Failed to update inventory',
          }
        );
        mutate('inventory');
        mutate('inventory-low-stock');
        return updated;
      } catch (error) {
        throw error;
      }
    },
    []
  );

  return { updateInventory };
};

export const useUpdateInventoryQuantity = () => {
  const updateQuantity = useCallback(
    async (ingredientId: number, quantityChange: number, employeeId?: number): Promise<Inventory> => {
      try {
        const updated = await showToast.promise(
          inventoryApi.updateQuantity(ingredientId, quantityChange, employeeId),
          {
            loading: 'Updating inventory quantity...',
            success: `Inventory quantity ${quantityChange > 0 ? 'increased' : 'decreased'} successfully!`,
            error: 'Failed to update inventory quantity',
          }
        );
        mutate('inventory');
        mutate('inventory-low-stock');
        return updated;
      } catch (error) {
        throw error;
      }
    },
    []
  );

  return { updateQuantity };
};

export const useDeleteInventory = () => {
  const deleteInventory = useCallback(async (id: number): Promise<void> => {
    try {
      await showToast.promise(
        inventoryApi.delete(id),
        {
          loading: 'Deleting inventory record...',
          success: 'Inventory record deleted successfully!',
          error: 'Failed to delete inventory record',
        }
      );
      mutate('inventory');
      mutate('inventory-low-stock');
    } catch (error) {
      throw error;
    }
  }, []);

  return { deleteInventory };
};

