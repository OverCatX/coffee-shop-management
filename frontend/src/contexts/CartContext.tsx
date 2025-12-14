"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";
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

const CART_STORAGE_KEY = "pos_cart";

// Load cart from localStorage
const loadCartFromStorage = (): CartItem[] => {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    // Validate that parsed data is an array
    if (!Array.isArray(parsed)) return [];

    // Validate each item has required fields
    return parsed.filter((item): item is CartItem => {
      return (
        item &&
        typeof item === "object" &&
        typeof item.item_id === "number" &&
        typeof item.name === "string" &&
        typeof item.price === "number" &&
        typeof item.quantity === "number" &&
        typeof item.category === "string" &&
        item.quantity > 0 &&
        item.price > 0
      );
    });
  } catch {
    return [];
  }
};

// Save cart to localStorage
const saveCartToStorage = (cart: CartItem[]) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch {
    // Ignore storage errors
  }
};

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(() => loadCartFromStorage());

  // Persist cart to localStorage whenever it changes
  useEffect(() => {
    saveCartToStorage(cart);
  }, [cart]);

  const addToCart = useCallback((item: MenuItem) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (cartItem) => cartItem.item_id === item.item_id
      );
      if (existingIndex >= 0) {
        // Update existing item - create new array with updated item
        const existingItem = prev[existingIndex];
        if (!existingItem) {
          // Fallback: add new item if existing item not found
          return [
            ...prev,
            {
              item_id: item.item_id,
              name: item.name,
              price: Number(item.price),
              quantity: 1,
              image_url: item.image_url,
              category: item.category,
            },
          ];
        }
        const newCart = [...prev];
        newCart[existingIndex] = {
          ...existingItem,
          quantity: existingItem.quantity + 1,
        };
        return newCart;
      }
      // Add new item
      return [
        ...prev,
        {
          item_id: item.item_id,
          name: item.name,
          price: Number(item.price),
          quantity: 1,
          image_url: item.image_url,
          category: item.category,
        },
      ];
    });
  }, []);

  const updateQuantity = useCallback((itemId: number, change: number) => {
    setCart((prev) => {
      const newCart = prev.map((item) =>
        item.item_id === itemId
          ? { ...item, quantity: Math.max(1, item.quantity + change) }
          : item
      );
      return newCart.filter((item) => item.quantity > 0);
    });
  }, []);

  const removeFromCart = useCallback((itemId: number) => {
    setCart((prev) => prev.filter((item) => item.item_id !== itemId));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem(CART_STORAGE_KEY);
    }
  }, []);

  // Memoize total calculation
  const total = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart]);

  const getTotal = useCallback(() => total, [total]);

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
