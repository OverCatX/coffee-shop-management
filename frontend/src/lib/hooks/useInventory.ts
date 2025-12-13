import useSWR from 'swr';
import { useCallback } from 'react';
import { inventoryApi, Inventory, InventoryCreate, InventoryUpdate } from '@/lib/api/inventory';
import { mutate } from 'swr';

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
    const newInventory = await inventoryApi.create(inventory);
    mutate('inventory');
    mutate('inventory-low-stock');
    return newInventory;
  }, []);

  return { createInventory };
};

export const useUpdateInventory = () => {
  const updateInventory = useCallback(
    async (id: number, inventory: InventoryUpdate): Promise<Inventory> => {
      const updated = await inventoryApi.update(id, inventory);
      mutate('inventory');
      mutate('inventory-low-stock');
      return updated;
    },
    []
  );

  return { updateInventory };
};

export const useUpdateInventoryQuantity = () => {
  const updateQuantity = useCallback(
    async (ingredientId: number, quantityChange: number, employeeId?: number): Promise<Inventory> => {
      const updated = await inventoryApi.updateQuantity(ingredientId, quantityChange, employeeId);
      mutate('inventory');
      mutate('inventory-low-stock');
      return updated;
    },
    []
  );

  return { updateQuantity };
};

export const useDeleteInventory = () => {
  const deleteInventory = useCallback(async (id: number): Promise<void> => {
    await inventoryApi.delete(id);
    mutate('inventory');
    mutate('inventory-low-stock');
  }, []);

  return { deleteInventory };
};

