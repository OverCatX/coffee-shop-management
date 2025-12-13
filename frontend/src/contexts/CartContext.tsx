"use client";

import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
import { CartItem, MenuItem } from "@/types";

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: MenuItem) => void;
  updateQuantity: (itemId: number, change: number) => void;
  removeFromCart: (itemId: number) => void;
  clearCart: () => void;
  getTotal: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = useCallback((item: MenuItem) => {
    setCart((prev) => {
      const existingItem = prev.find((cartItem) => cartItem.item_id === item.item_id);
      if (existingItem) {
        return prev.map((cartItem) =>
          cartItem.item_id === item.item_id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [
        ...prev,
        {
          item_id: item.item_id,
          name: item.name,
          price: Number(item.price),
          quantity: 1,
          image: item.image,
          category: item.category,
        },
      ];
    });
  }, []);

  const updateQuantity = useCallback((itemId: number, change: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.item_id === itemId
            ? { ...item, quantity: Math.max(1, item.quantity + change) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }, []);

  const removeFromCart = useCallback((itemId: number) => {
    setCart((prev) => prev.filter((item) => item.item_id !== itemId));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const getTotal = useCallback(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart]);

  const value = useMemo(
    () => ({
      cart,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      getTotal,
    }),
    [cart, addToCart, updateQuantity, removeFromCart, clearCart, getTotal]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
