'use client';

import React, { memo, useCallback, useMemo } from 'react';
import { Plus, Minus, Trash2 } from 'lucide-react';
import { CartItem as CartItemType } from '@/types';
import { getMenuItemImageUrl, getPlaceholderImage } from '@/utils/imageUtils';

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
  }, [item.item_id, item.quantity, onUpdateQuantity, onRemove]);

  const handleIncrease = useCallback(() => {
    onUpdateQuantity(item.item_id, 1);
  }, [item.item_id, onUpdateQuantity]);

  // Convert CartItem to MenuItem format for image helper
  const menuItemForImage = useMemo(() => ({
    item_id: item.item_id,
    name: item.name,
    category: item.category || 'Coffee',
    image_url: item.image_url,
  }), [item.item_id, item.name, item.category, item.image_url]);

  const imageUrl = useMemo(() => {
    return getMenuItemImageUrl(menuItemForImage);
  }, [menuItemForImage]);

  const subtotal = useMemo(() => {
    return (item.price * item.quantity).toFixed(2);
  }, [item.price, item.quantity]);

  return (
    <div className="flex items-center justify-between p-3 mb-3 bg-white rounded-lg border border-stone-200 hover:shadow-md transition-all">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-14 h-14 rounded-lg overflow-hidden bg-stone-100 shrink-0">
          <img 
            src={imageUrl} 
            alt={item.name} 
            className="w-full h-full object-cover" 
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = getPlaceholderImage(menuItemForImage);
            }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-stone-800 text-sm line-clamp-1">{item.name}</h4>
          <p className="text-amber-600 font-bold text-xs mt-0.5">฿{subtotal}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 bg-stone-50 rounded-lg p-1 shrink-0">
        <button
          onClick={handleDecrease}
          className="w-7 h-7 flex items-center justify-center rounded-md bg-white text-stone-600 hover:bg-red-50 hover:text-red-500 shadow-sm transition-colors"
          aria-label="Decrease quantity"
        >
          {item.quantity === 1 ? <Trash2 size={12} /> : <Minus size={12} />}
        </button>
        <span className="text-xs font-bold w-5 text-center">{item.quantity}</span>
        <button
          onClick={handleIncrease}
          className="w-7 h-7 flex items-center justify-center rounded-md bg-stone-800 text-white shadow-sm hover:bg-stone-700 transition-colors"
          aria-label="Increase quantity"
        >
          <Plus size={12} />
        </button>
      </div>
    </div>
  );
});

CartItem.displayName = 'CartItem';

export default CartItem;

