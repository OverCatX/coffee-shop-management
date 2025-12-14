// API Types matching backend schemas

export interface MenuItem {
  item_id: number;
  name: string;
  price: number;
  category: string;
  description?: string;
  image_url?: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}

export interface OrderDetail {
  order_id: number;
  item_id: number;
  quantity: number;
  unit_price: number;
  subtotal: number;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}

export interface Order {
  order_id: number;
  customer_id?: number;
  order_date: string;
  total_amount: number;
  payment_amount?: number; // Actual amount paid after discount
  status: 'pending' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  order_details: OrderDetail[];
}

export interface OrderCreate {
  customer_id?: number;
  order_date: string;
  order_details: {
    item_id: number;
    quantity: number;
    unit_price: number;
    subtotal: number;
  }[];
  payment_method: string;
  payment_amount: number;
}

export interface CartItem {
  item_id: number;
  name: string;
  price: number;
  category: string;
  quantity: number;
  image_url?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
}

