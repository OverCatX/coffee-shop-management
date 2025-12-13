'use client';

import React, { memo, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { MenuItem } from '@/types';

interface ProductCardProps {
  item: MenuItem;
  onAdd: (item: MenuItem) => void;
}

const ProductCard: React.FC<ProductCardProps> = memo(({ item, onAdd }) => {
  const handleClick = useCallback(() => {
    onAdd(item);
  }, [item, onAdd]);

  const imageUrl = item.image || `https://images.unsplash.com/photo-1551033406-611cf9a28f67?w=400&q=80`;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-3xl p-3 shadow-sm border border-stone-100 flex flex-col h-full cursor-pointer overflow-hidden relative group"
      onClick={handleClick}
    >
      <div className="h-40 w-full rounded-2xl overflow-hidden relative mb-3">
        <img
          src={imageUrl}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
        <button className="absolute bottom-2 right-2 bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
          <Plus size={18} className="text-stone-800" />
        </button>
        {!item.is_available && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-bold text-sm">Out of Stock</span>
          </div>
        )}
      </div>
      <div className="flex justify-between items-start mt-auto px-1">
        <div>
          <h3 className="font-semibold text-stone-800 text-sm">{item.name}</h3>
          <p className="text-stone-400 text-xs mt-1">{item.category}</p>
        </div>
        <span className="font-bold text-amber-600 text-sm">฿{Number(item.price).toFixed(2)}</span>
      </div>
    </motion.div>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;

