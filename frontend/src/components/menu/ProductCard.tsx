'use client';

import React, { memo, useCallback, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { MenuItem } from '@/types';
import { getMenuItemImageUrl, getPlaceholderImage } from '@/utils/imageUtils';

interface ProductCardProps {
  item: MenuItem;
  onAdd: (item: MenuItem) => void;
}

const ProductCard: React.FC<ProductCardProps> = memo(({ item, onAdd }) => {
  const handleClick = useCallback(() => {
    onAdd(item);
  }, [item, onAdd]);

  const imageUrl = useMemo(() => {
    return getMenuItemImageUrl(item);
  }, [item]);

  return (
    <div
      className="bg-white rounded-lg border border-stone-200 flex flex-col h-full cursor-pointer overflow-hidden hover:shadow-lg hover:border-amber-400 transition-all group"
      onClick={handleClick}
    >
      <div className="h-44 w-full overflow-hidden relative bg-stone-100">
        <img
          src={imageUrl}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = getPlaceholderImage(item);
          }}
        />
        {!item.is_available && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-white font-bold text-sm">Out of Stock</span>
          </div>
        )}
      </div>
      <div className="p-3 flex-1 flex flex-col">
        <div className="flex-1 mb-2">
          <h3 className="font-semibold text-stone-800 text-sm mb-1 line-clamp-2">{item.name}</h3>
          <p className="text-stone-500 text-xs">{item.category}</p>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-stone-100">
          <span className="font-bold text-amber-600 text-base">฿{Number(item.price).toFixed(2)}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
            className="p-2 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors"
            aria-label="Add to cart"
          >
            <Plus size={16} className="text-amber-700" />
          </button>
        </div>
      </div>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;

