import useSWR from 'swr';
import { useCallback } from 'react';
import { menuItemsApi, MenuItemCreate, MenuItemUpdate } from '@/lib/api/menuItems';
import { MenuItem } from '@/types';
import { mutate } from 'swr';

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
    const newItem = await menuItemsApi.create(menuItem);
    mutate('menuItems');
    return newItem;
  }, []);

  return { createMenuItem };
};

export const useUpdateMenuItem = () => {
  const updateMenuItem = useCallback(async (id: number, menuItem: MenuItemUpdate): Promise<MenuItem> => {
    const updated = await menuItemsApi.update(id, menuItem);
    mutate('menuItems');
    return updated;
  }, []);

  return { updateMenuItem };
};

export const useDeleteMenuItem = () => {
  const deleteMenuItem = useCallback(async (id: number): Promise<void> => {
    await menuItemsApi.delete(id);
    mutate('menuItems');
  }, []);

  return { deleteMenuItem };
};

export const useToggleMenuItemAvailability = () => {
  const toggleAvailability = useCallback(async (id: number): Promise<MenuItem> => {
    const updated = await menuItemsApi.toggleAvailability(id);
    mutate('menuItems');
    return updated;
  }, []);

  return { toggleAvailability };
};
