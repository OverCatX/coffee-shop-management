'use client';

import React, { memo, useCallback, useMemo } from 'react';
import { Clock, Bell } from 'lucide-react';
import { motion } from 'framer-motion';
import { Order } from '@/types';

interface OrderCardProps {
  order: Order;
  updateStatus: (orderId: number, status: 'pending' | 'completed' | 'cancelled') => Promise<void>;
}

const OrderCard: React.FC<OrderCardProps> = memo(({ order, updateStatus }) => {
  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }, []);

  const getNextAction = useCallback((status: string) => {
    switch (status) {
      case 'pending':
        return { label: 'Start Preparing', next: 'completed' as const, color: 'bg-blue-600 hover:bg-blue-700' };
      case 'completed':
        return null;
      default:
        return null;
    }
  }, []);

  const action = useMemo(() => getNextAction(order.status), [order.status, getNextAction]);

  const handleStatusUpdate = useCallback(async () => {
    if (action) {
      await updateStatus(order.order_id, action.next);
    }
  }, [action, order.order_id, updateStatus]);

  const formattedTime = useMemo(() => {
    return new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, [order.created_at]);

  return (
    <motion.div
      layout
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden flex flex-col h-full"
    >
      <div className="p-4 border-b border-stone-100 flex justify-between items-start bg-stone-50/50">
        <div>
          <span className="text-xs font-bold text-stone-400">ORDER ID</span>
          <h3 className="text-xl font-bold text-stone-800">#{order.order_id}</h3>
        </div>
        <div
          className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)} uppercase tracking-wider flex items-center gap-1`}
        >
          {order.status === 'pending' && <Clock size={12} />}
          {order.status === 'completed' && <Bell size={12} />}
          {order.status}
        </div>
      </div>

      <div className="p-4 flex-1">
        <ul className="space-y-3">
          {order.order_details.map((detail, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <div className="w-5 h-5 rounded bg-stone-200 flex items-center justify-center text-xs font-bold text-stone-600 shrink-0 mt-0.5">
                {detail.quantity}
              </div>
              <div className="flex-1">
                <span className="text-stone-700 text-sm font-medium">Item #{detail.item_id}</span>
                <p className="text-xs text-stone-400">฿{Number(detail.unit_price).toFixed(2)} × {detail.quantity}</p>
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-4 pt-4 border-t border-stone-100">
          <div className="flex justify-between items-center">
            <span className="text-xs text-stone-500">Total</span>
            <span className="font-bold text-stone-800">฿{Number(order.total_amount).toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="p-4 bg-stone-50 mt-auto flex justify-between items-center gap-3">
        <span className="text-xs text-stone-400 font-mono">{formattedTime}</span>
        {action && (
          <button
            onClick={handleStatusUpdate}
            className={`flex-1 py-2 px-4 rounded-lg text-white text-sm font-bold shadow-sm transition-all active:scale-95 ${action.color}`}
          >
            {action.label}
          </button>
        )}
      </div>
    </motion.div>
  );
});

OrderCard.displayName = 'OrderCard';

export default OrderCard;

