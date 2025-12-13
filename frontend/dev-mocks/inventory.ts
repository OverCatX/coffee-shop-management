import { Inventory, InventoryCreate, InventoryUpdate } from '@/lib/api/inventory';
import { mockInventory as initialInventory } from './data';

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let inventory = [...initialInventory];
let nextId = Math.max(...initialInventory.map((inv) => inv.inventory_id)) + 1;

export const mockInventoryApi = {
  getAll: async (skip: number = 0, limit: number = 1000): Promise<Inventory[]> => {
    await delay(300);
    const filtered = inventory.filter((inv) => !inv.is_deleted);
    return filtered.slice(skip, skip + limit);
  },

  getLowStock: async (skip: number = 0, limit: number = 1000): Promise<Inventory[]> => {
    await delay(300);
    const filtered = inventory.filter(
      (inv) => !inv.is_deleted && inv.quantity < inv.min_threshold
    );
    return filtered.slice(skip, skip + limit);
  },

  getById: async (id: number): Promise<Inventory> => {
    await delay(200);
    const inv = inventory.find((inv) => inv.inventory_id === id && !inv.is_deleted);
    if (!inv) {
      throw new Error(`Inventory with id ${id} not found`);
    }
    return inv;
  },

  getByIngredient: async (ingredientId: number): Promise<Inventory> => {
    await delay(200);
    const inv = inventory.find(
      (inv) => inv.ingredient_id === ingredientId && !inv.is_deleted
    );
    if (!inv) {
      throw new Error(`Inventory for ingredient ${ingredientId} not found`);
    }
    return inv;
  },

  create: async (inv: InventoryCreate): Promise<Inventory> => {
    await delay(400);
    const now = new Date().toISOString();
    const newInventory: Inventory = {
      inventory_id: nextId++,
      ingredient_id: inv.ingredient_id,
      quantity: inv.quantity,
      min_threshold: inv.min_threshold,
      employee_id: inv.employee_id,
      last_updated: now,
      created_at: now,
      updated_at: now,
      is_deleted: false,
    };
    inventory.push(newInventory);
    return newInventory;
  },

  update: async (id: number, inv: InventoryUpdate): Promise<Inventory> => {
    await delay(400);
    const index = inventory.findIndex((inv) => inv.inventory_id === id && !inv.is_deleted);
    if (index === -1) {
      throw new Error(`Inventory with id ${id} not found`);
    }
    const existingInventory = inventory[index]!;
    const updatedInventory: Inventory = {
      inventory_id: existingInventory.inventory_id,
      ingredient_id: existingInventory.ingredient_id,
      quantity: inv.quantity ?? existingInventory.quantity,
      min_threshold: inv.min_threshold ?? existingInventory.min_threshold,
      employee_id: inv.employee_id ?? existingInventory.employee_id,
      last_updated: new Date().toISOString(),
      created_at: existingInventory.created_at,
      updated_at: new Date().toISOString(),
      is_deleted: existingInventory.is_deleted,
    };
    inventory[index] = updatedInventory;
    return updatedInventory;
  },

  updateQuantity: async (
    ingredientId: number,
    quantityChange: number,
    employeeId?: number
  ): Promise<Inventory> => {
    await delay(400);
    const index = inventory.findIndex(
      (inv) => inv.ingredient_id === ingredientId && !inv.is_deleted
    );
    if (index === -1) {
      throw new Error(`Inventory for ingredient ${ingredientId} not found`);
    }
    const inv = inventory[index]!;
    inv.quantity += quantityChange;
    inv.employee_id = employeeId ?? inv.employee_id;
    inv.updated_at = new Date().toISOString();
    inv.last_updated = new Date().toISOString();
    return inv;
  },

  delete: async (id: number): Promise<void> => {
    await delay(300);
    const index = inventory.findIndex((inv) => inv.inventory_id === id && !inv.is_deleted);
    if (index === -1) {
      throw new Error(`Inventory with id ${id} not found`);
    }
    const inv = inventory[index]!;
    inv.is_deleted = true;
    inv.updated_at = new Date().toISOString();
  },
};
