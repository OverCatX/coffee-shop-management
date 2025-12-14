'use client';

import React, { memo, useCallback, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { MenuItem } from '@/types';
import { getMenuItemImageUrl, getPlaceholderImage } from '@/utils/imageUtils';

interface ProductCardProps {
  item: MenuItem;
  onAdd: (item: MenuItem) => void;
}

const ProductCard: React.FC<ProductCardProps> = memo(({ item, onAdd }) => {
  const [imageError, setImageError] = useState(false);
  
  const handleClick = useCallback(() => {
    if (item.is_available) {
      onAdd(item);
    }
  }, [item, onAdd]);

  const imageUrl = useMemo(() => {
    if (imageError) {
      return getPlaceholderImage(item);
    }
    return getMenuItemImageUrl(item);
  }, [item, imageError]);

  const formattedPrice = useMemo(() => {
    return Number(item.price).toFixed(2);
  }, [item.price]);

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  return (
    <div
      className={`group bg-white rounded-xl border flex flex-col h-full overflow-hidden transition-all duration-300 ${
        item.is_available
          ? 'border-stone-200 hover:border-amber-400 hover:shadow-xl hover:-translate-y-1 cursor-pointer'
          : 'border-stone-200 opacity-60 cursor-not-allowed'
      }`}
      onClick={handleClick}
    >
      {/* Image */}
      <div className="relative w-full aspect-square overflow-hidden bg-gradient-to-br from-stone-100 to-stone-200">
        <img
          src={imageUrl}
          alt={item.name}
          className={`w-full h-full object-cover transition-transform duration-500 ${
            item.is_available ? 'group-hover:scale-110' : ''
          }`}
          loading="lazy"
          decoding="async"
          onError={handleImageError}
        />
        {!item.is_available && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
            <span className="text-white font-bold text-xs px-3 py-1.5 bg-red-600 rounded-full shadow-lg">Unavailable</span>
          </div>
        )}
        {/* Hover overlay */}
        {item.is_available && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        )}
      </div>

      {/* Content */}
      <div className="p-3 flex-1 flex flex-col min-h-0 bg-gradient-to-b from-white to-stone-50">
        <div className="flex-1 mb-2 min-h-0">
          <h3 className="font-bold text-stone-900 text-sm mb-1 line-clamp-2 leading-tight group-hover:text-amber-700 transition-colors">{item.name}</h3>
          <p className="text-stone-500 text-xs truncate">{item.category}</p>
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-stone-200">
          <span className="font-bold text-amber-600 text-base group-hover:text-amber-700 transition-colors">฿{formattedPrice}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
            disabled={!item.is_available}
            className={`p-2 rounded-lg transition-all duration-200 ${
              item.is_available
                ? 'bg-gradient-to-br from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 active:scale-90 shadow-md hover:shadow-lg text-white'
                : 'bg-stone-100 cursor-not-allowed'
            }`}
            aria-label="Add to cart"
          >
            <Plus size={16} className={item.is_available ? 'text-white' : 'text-stone-400'} />
          </button>
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for better memoization
  return (
    prevProps.item.item_id === nextProps.item.item_id &&
    prevProps.item.is_available === nextProps.item.is_available &&
    prevProps.item.price === nextProps.item.price &&
    prevProps.item.name === nextProps.item.name &&
    prevProps.item.image_url === nextProps.item.image_url
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;

