import useSWR from 'swr';
import { useCallback } from 'react';
import { menuItemsApi, MenuItemCreate, MenuItemUpdate } from '@/lib/api/menuItems';
import { MenuItem } from '@/types';
import { mutate } from 'swr';
import { showToast } from '@/utils/toast';

export const useMenuItems = (availableOnly: boolean = false) => {
  const { data, error, isLoading, mutate: mutateMenuItems } = useSWR<MenuItem[]>(
    ['menuItems', availableOnly],
    () => menuItemsApi.getAll(availableOnly),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
    }
  );

  return {
    menuItems: data || [],
    isLoading,
    isError: error,
    mutate: mutateMenuItems,
  };
};

export const useMenuItemsByCategory = (category: string) => {
  const { data, error, isLoading } = useSWR<MenuItem[]>(
    category ? ['menuItems', 'category', category] : null,
    () => menuItemsApi.getByCategory(category),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    menuItems: data || [],
    isLoading,
    isError: error,
  };
};

export const useCreateMenuItem = () => {
  const createMenuItem = useCallback(async (menuItem: MenuItemCreate): Promise<MenuItem> => {
    try {
      const newItem = await showToast.promise(
        menuItemsApi.create(menuItem),
        {
          loading: 'Creating menu item...',
          success: `Menu item "${menuItem.name}" created successfully!`,
          error: 'Failed to create menu item',
        }
      );
      // Mutate all menuItems keys
      mutate((key) => Array.isArray(key) && key[0] === 'menuItems');
      return newItem;
    } catch (error) {
      throw error;
    }
  }, []);

  return { createMenuItem };
};

export const useUpdateMenuItem = () => {
  const updateMenuItem = useCallback(async (id: number, menuItem: MenuItemUpdate): Promise<MenuItem> => {
    try {
      const updated = await showToast.promise(
        menuItemsApi.update(id, menuItem),
        {
          loading: 'Updating menu item...',
          success: `Menu item updated successfully!`,
          error: 'Failed to update menu item',
        }
      );
      // Mutate all menuItems keys
      mutate((key) => Array.isArray(key) && key[0] === 'menuItems');
      return updated;
    } catch (error) {
      throw error;
    }
  }, []);

  return { updateMenuItem };
};

export const useDeleteMenuItem = () => {
  const deleteMenuItem = useCallback(async (id: number): Promise<void> => {
    try {
      await showToast.promise(
        menuItemsApi.delete(id),
        {
          loading: 'Deleting menu item...',
          success: 'Menu item deleted successfully!',
          error: 'Failed to delete menu item',
        }
      );
      // Mutate all menuItems keys
      mutate((key) => Array.isArray(key) && key[0] === 'menuItems');
    } catch (error) {
      throw error;
    }
  }, []);

  return { deleteMenuItem };
};

export const useToggleMenuItemAvailability = () => {
  const toggleAvailability = useCallback(async (id: number): Promise<MenuItem> => {
    try {
      const updated = await menuItemsApi.toggleAvailability(id);
      // Mutate all menuItems keys
      mutate((key) => Array.isArray(key) && key[0] === 'menuItems');
      showToast.success(
        updated.is_available 
          ? 'Menu item marked as available' 
          : 'Menu item marked as unavailable'
      );
      return updated;
    } catch (error) {
      throw error;
    }
  }, []);

  return { toggleAvailability };
};
