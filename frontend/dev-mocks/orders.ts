import { Order, OrderCreate } from '@/types';
import { mockOrders as initialOrders } from './data';

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let orders = [...initialOrders];
let nextId = Math.max(...initialOrders.map((order) => order.order_id)) + 1;

export const mockOrdersApi = {
  create: async (order: OrderCreate): Promise<Order> => {
    await delay(500);
    const now = new Date().toISOString();
    const orderDetails = order.order_details.map((detail) => ({
      order_id: nextId,
      item_id: detail.item_id,
      quantity: detail.quantity,
      unit_price: detail.unit_price,
      subtotal: detail.subtotal,
      created_at: now,
      updated_at: now,
      is_deleted: false,
    }));

    const newOrder: Order = {
      order_id: nextId++,
      customer_id: order.customer_id,
      order_date: order.order_date,
      total_amount: order.payment_amount,
      status: 'pending',
      created_at: now,
      updated_at: now,
      is_deleted: false,
      order_details: orderDetails,
    };

    orders.push(newOrder);
    return newOrder;
  },

  getAll: async (): Promise<Order[]> => {
    await delay(300);
    return orders.filter((order) => !order.is_deleted);
  },

  getById: async (id: number): Promise<Order> => {
    await delay(200);
    const order = orders.find((order) => order.order_id === id && !order.is_deleted);
    if (!order) {
      throw new Error(`Order with id ${id} not found`);
    }
    return order;
  },

  getByStatus: async (status: 'pending' | 'completed' | 'cancelled'): Promise<Order[]> => {
    await delay(200);
    return orders.filter((order) => order.status === status && !order.is_deleted);
  },

  updateStatus: async (
    id: number,
    status: 'pending' | 'completed' | 'cancelled'
  ): Promise<Order> => {
    await delay(400);
    const index = orders.findIndex((order) => order.order_id === id && !order.is_deleted);
    if (index === -1) {
      throw new Error(`Order with id ${id} not found`);
    }
    const order = orders[index]!;
    order.status = status;
    order.updated_at = new Date().toISOString();
    return order;
  },
};

