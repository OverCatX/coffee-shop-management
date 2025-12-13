// Type-safe constants

export const ORDER_STATUSES = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export type OrderStatus = typeof ORDER_STATUSES[keyof typeof ORDER_STATUSES];

export const PAYMENT_METHODS = {
  CASH: 'cash',
  CARD: 'card',
  MOBILE: 'mobile',
} as const;

export type PaymentMethod = typeof PAYMENT_METHODS[keyof typeof PAYMENT_METHODS];

export const MENU_CATEGORIES = {
  ALL: 'all',
  COFFEE: 'Coffee',
  NON_COFFEE: 'Non-Coffee',
  BAKERY: 'Bakery',
} as const;

export type MenuCategory = typeof MENU_CATEGORIES[keyof typeof MENU_CATEGORIES];

export const API_ENDPOINTS = {
  MENU_ITEMS: '/menu-items',
  ORDERS: '/orders',
  CUSTOMERS: '/customers',
  PAYMENTS: '/payments',
  INVENTORY: '/inventory',
} as const;

export const REFRESH_INTERVALS = {
  ORDERS: 5000,
  ACTIVE_ORDERS: 3000,
  MENU_ITEMS: 10000,
} as const;

