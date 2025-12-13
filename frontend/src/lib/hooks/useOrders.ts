import useSWR from 'swr';
import { useCallback } from 'react';
import { ordersApi } from '@/lib/api/orders';
import { Order } from '@/types';
import { mutate } from 'swr';

export const useOrders = () => {
  const { data, error, isLoading, mutate: mutateOrders } = useSWR<Order[]>(
    'orders',
    () => ordersApi.getAll(),
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      refreshInterval: 5000, // Poll every 5 seconds for barista view
    }
  );

  return {
    orders: data || [],
    isLoading,
    isError: error,
    mutate: mutateOrders,
  };
};

export const useOrdersByStatus = (status: 'pending' | 'completed' | 'cancelled') => {
  const { data, error, isLoading } = useSWR<Order[]>(
    status ? ['orders', 'status', status] : null,
    () => ordersApi.getByStatus(status),
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      refreshInterval: 3000, // Poll every 3 seconds for active orders
    }
  );

  return {
    orders: data || [],
    isLoading,
    isError: error,
  };
};

export const useCreateOrder = () => {
  const createOrder = useCallback(async (orderData: Parameters<typeof ordersApi.create>[0]): Promise<Order> => {
    const newOrder = await ordersApi.create(orderData);
    // Optimistically update cache
    mutate('orders', (current: Order[] | undefined): Order[] => {
      return current ? [...current, newOrder] : [newOrder];
    }, false);
    // Revalidate to ensure consistency
    mutate('orders');
    return newOrder;
  }, []);

  return { createOrder };
};

export const useUpdateOrderStatus = () => {
  const updateStatus = useCallback(async (
    orderId: number,
    status: 'pending' | 'completed' | 'cancelled'
  ): Promise<Order> => {
    const updatedOrder = await ordersApi.updateStatus(orderId, status);
    // Optimistically update cache
    mutate('orders', (current: Order[] | undefined): Order[] => {
      if (!current) return [updatedOrder];
      return current.map((order: Order): Order =>
        order.order_id === orderId ? updatedOrder : order
      );
    }, false);
    // Also update status-specific cache
    mutate(['orders', 'status', status]);
    mutate(['orders', 'status', updatedOrder.status]);
    // Revalidate
    mutate('orders');
    return updatedOrder;
  }, []);

  return { updateStatus };
};

