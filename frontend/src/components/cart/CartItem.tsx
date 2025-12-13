'use client';

import React, { memo, useCallback } from 'react';
import { Plus, Minus, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { CartItem as CartItemType } from '@/types';

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (itemId: number, change: number) => void;
  onRemove: (itemId: number) => void;
}

const CartItem: React.FC<CartItemProps> = memo(({ item, onUpdateQuantity, onRemove }) => {
  const handleDecrease = useCallback(() => {
    if (item.quantity === 1) {
      onRemove(item.item_id);
    } else {
      onUpdateQuantity(item.item_id, -1);
    }
  }, [item, onUpdateQuantity, onRemove]);

  const handleIncrease = useCallback(() => {
    onUpdateQuantity(item.item_id, 1);
  }, [item.item_id, onUpdateQuantity]);

  const imageUrl = item.image || `https://images.unsplash.com/photo-1551033406-611cf9a28f67?w=400&q=80`;

  return (
    <motion.div
      layout
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -20, opacity: 0 }}
      className="flex items-center justify-between p-3 mb-3 bg-white rounded-2xl border border-stone-100 shadow-sm"
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl overflow-hidden bg-stone-100 shrink-0">
          <img src={imageUrl} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
        </div>
        <div>
          <h4 className="font-medium text-stone-800 text-sm line-clamp-1">{item.name}</h4>
          <p className="text-amber-600 font-bold text-xs">฿{(item.price * item.quantity).toFixed(2)}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 bg-stone-50 rounded-lg p-1">
        <button
          onClick={handleDecrease}
          className="w-6 h-6 flex items-center justify-center rounded-md bg-white text-stone-600 hover:bg-red-50 hover:text-red-500 shadow-sm transition-colors"
        >
          {item.quantity === 1 ? <Trash2 size={12} /> : <Minus size={12} />}
        </button>
        <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
        <button
          onClick={handleIncrease}
          className="w-6 h-6 flex items-center justify-center rounded-md bg-stone-800 text-white shadow-sm hover:bg-stone-700 transition-colors"
        >
          <Plus size={12} />
        </button>
      </div>
    </motion.div>
  );
});

CartItem.displayName = 'CartItem';

export default CartItem;

