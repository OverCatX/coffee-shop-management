import { Customer, CustomerCreate, CustomerUpdate } from '@/lib/api/customers';
import { mockCustomers as initialCustomers } from './data';

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let customers = [...initialCustomers];
let nextId = Math.max(...initialCustomers.map((cust) => cust.customer_id)) + 1;

export const mockCustomersApi = {
  getAll: async (skip: number = 0, limit: number = 1000): Promise<Customer[]> => {
    await delay(300);
    const filtered = customers.filter((cust) => !cust.is_deleted);
    return filtered.slice(skip, skip + limit);
  },

  getById: async (id: number): Promise<Customer> => {
    await delay(200);
    const customer = customers.find((cust) => cust.customer_id === id && !cust.is_deleted);
    if (!customer) {
      throw new Error(`Customer with id ${id} not found`);
    }
    return customer;
  },

  search: async (query: string): Promise<Customer[]> => {
    await delay(300);
    const lowerQuery = query.toLowerCase();
    return customers.filter(
      (cust) =>
        !cust.is_deleted &&
        (cust.name.toLowerCase().includes(lowerQuery) ||
          cust.phone?.toLowerCase().includes(lowerQuery) ||
          cust.email?.toLowerCase().includes(lowerQuery))
    );
  },

  create: async (customer: CustomerCreate): Promise<Customer> => {
    await delay(400);
    const now = new Date().toISOString();
    const newCustomer: Customer = {
      customer_id: nextId++,
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      loyalty_points: customer.loyalty_points ?? 0,
      created_at: now,
      updated_at: now,
      is_deleted: false,
    };
    customers.push(newCustomer);
    return newCustomer;
  },

  update: async (id: number, customer: CustomerUpdate): Promise<Customer> => {
    await delay(400);
    const index = customers.findIndex((cust) => cust.customer_id === id && !cust.is_deleted);
    if (index === -1) {
      throw new Error(`Customer with id ${id} not found`);
    }
    const existingCustomer = customers[index]!;
    const updatedCustomer: Customer = {
      customer_id: existingCustomer.customer_id,
      name: customer.name ?? existingCustomer.name,
      phone: customer.phone ?? existingCustomer.phone,
      email: customer.email ?? existingCustomer.email,
      loyalty_points: customer.loyalty_points ?? existingCustomer.loyalty_points,
      created_at: existingCustomer.created_at,
      updated_at: new Date().toISOString(),
      is_deleted: existingCustomer.is_deleted,
    };
    customers[index] = updatedCustomer;
    return updatedCustomer;
  },

  delete: async (id: number): Promise<void> => {
    await delay(300);
    const index = customers.findIndex((cust) => cust.customer_id === id && !cust.is_deleted);
    if (index === -1) {
      throw new Error(`Customer with id ${id} not found`);
    }
    const customer = customers[index]!;
    customer.is_deleted = true;
    customer.updated_at = new Date().toISOString();
  },

  updateLoyaltyPoints: async (id: number, points: number): Promise<Customer> => {
    await delay(400);
    const index = customers.findIndex((cust) => cust.customer_id === id && !cust.is_deleted);
    if (index === -1) {
      throw new Error(`Customer with id ${id} not found`);
    }
    const customer = customers[index]!;
    customer.loyalty_points = points;
    customer.updated_at = new Date().toISOString();
    return customer;
  },
};

