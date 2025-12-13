import { MenuItem } from '@/types';
import { MenuItemCreate, MenuItemUpdate } from '@/lib/api/menuItems';
import { mockMenuItems } from './data';

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let menuItems = [...mockMenuItems];
let nextId = Math.max(...mockMenuItems.map((item) => item.item_id)) + 1;

export const mockMenuItemsApi = {
  getAll: async (availableOnly: boolean = false): Promise<MenuItem[]> => {
    await delay(300);
    let items = menuItems.filter((item) => !item.is_deleted);
    if (availableOnly) {
      items = items.filter((item) => item.is_available);
    }
    return items;
  },

  getById: async (id: number): Promise<MenuItem> => {
    await delay(200);
    const item = menuItems.find((item) => item.item_id === id && !item.is_deleted);
    if (!item) {
      throw new Error(`Menu item with id ${id} not found`);
    }
    return item;
  },

  getByCategory: async (category: string): Promise<MenuItem[]> => {
    await delay(200);
    return menuItems.filter(
      (item) => item.category === category && !item.is_deleted && item.is_available
    );
  },

  create: async (menuItem: MenuItemCreate): Promise<MenuItem> => {
    await delay(400);
    const now = new Date().toISOString();
    const newItem: MenuItem = {
      item_id: nextId++,
      name: menuItem.name,
      price: menuItem.price,
      category: menuItem.category,
      description: menuItem.description,
      is_available: menuItem.is_available ?? true,
      created_at: now,
      updated_at: now,
      is_deleted: false,
    };
    menuItems.push(newItem);
    return newItem;
  },

  update: async (id: number, menuItem: MenuItemUpdate): Promise<MenuItem> => {
    await delay(400);
    const index = menuItems.findIndex((item) => item.item_id === id && !item.is_deleted);
    if (index === -1) {
      throw new Error(`Menu item with id ${id} not found`);
    }
    const existingItem = menuItems[index]!;
    const updatedItem: MenuItem = {
      item_id: existingItem.item_id,
      name: menuItem.name ?? existingItem.name,
      price: menuItem.price ?? existingItem.price,
      category: menuItem.category ?? existingItem.category,
      description: menuItem.description ?? existingItem.description,
      is_available: menuItem.is_available ?? existingItem.is_available,
      created_at: existingItem.created_at,
      updated_at: new Date().toISOString(),
      is_deleted: existingItem.is_deleted,
      image: existingItem.image,
    };
    menuItems[index] = updatedItem;
    return updatedItem;
  },

  delete: async (id: number): Promise<void> => {
    await delay(300);
    const index = menuItems.findIndex((item) => item.item_id === id && !item.is_deleted);
    if (index === -1) {
      throw new Error(`Menu item with id ${id} not found`);
    }
    const item = menuItems[index]!;
    item.is_deleted = true;
    item.updated_at = new Date().toISOString();
  },

  toggleAvailability: async (id: number): Promise<MenuItem> => {
    await delay(300);
    const index = menuItems.findIndex((item) => item.item_id === id && !item.is_deleted);
    if (index === -1) {
      throw new Error(`Menu item with id ${id} not found`);
    }
    const item = menuItems[index]!;
    item.is_available = !item.is_available;
    item.updated_at = new Date().toISOString();
    return item;
  },
};
