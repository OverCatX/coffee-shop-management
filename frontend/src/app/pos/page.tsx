"use client";

import { useState, useMemo, useCallback } from "react";
import { ShoppingBag, Coffee, Search, X } from "lucide-react";
import ProductCard from "@/components/menu/ProductCard";
import CartItem from "@/components/cart/CartItem";
import { useCart } from "@/contexts/CartContext";
import { useMenuItems } from "@/lib/hooks/useMenuItems";
import { useCreateOrder } from "@/lib/hooks/useOrders";
import { OrderCreate } from "@/types";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useDebounce } from "@/utils/debounce";
import { filterMenuItems, getCategories } from "@/utils/filter";

function POSPageContent() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [isCartOpen, setIsCartOpen] = useState(false);

  const { menuItems, isLoading } = useMenuItems(true);
  const {
    cart,
    addToCart,
    updateQuantity,
    removeFromCart,
    getTotal,
    clearCart,
  } = useCart();
  const { createOrder } = useCreateOrder();

  const debouncedSearch = useDebounce(search, 300);

  const categories = useMemo(() => {
    const cats = getCategories(menuItems);
    return [
      { id: "all", name: "All" },
      ...cats.map((cat) => ({ id: cat, name: cat })),
    ];
  }, [menuItems]);

  const filteredItems = useMemo(() => {
    const filtered = filterMenuItems(
      menuItems,
      activeCategory,
      debouncedSearch
    );
    // Sort alphabetically by name (A-Z)
    return [...filtered].sort((a, b) => {
      return a.name.localeCompare(b.name, "en", { sensitivity: "base" });
    });
  }, [menuItems, activeCategory, debouncedSearch]);

  // Memoize total calculation - only recalculate when cart changes
  const total = useMemo(() => getTotal(), [getTotal]);
  const subtotal = total;
  const cartCount = useMemo(() => cart.length, [cart.length]);

  const handlePlaceOrder = useCallback(async () => {
    if (cartCount === 0) return;

    try {
      const today = new Date().toISOString().split("T")[0];
      if (!today) {
        throw new Error("Failed to get current date");
      }

      const orderData: OrderCreate = {
        order_date: today,
        order_details: cart.map((item) => ({
          item_id: item.item_id,
          quantity: item.quantity,
          unit_price: item.price,
          subtotal: item.price * item.quantity,
        })),
        payment_method: "cash",
        payment_amount: getTotal(),
      };

      await createOrder(orderData);
      clearCart();
      setIsCartOpen(false);
      // Success toast is handled by hook
    } catch (error) {
      // Error toast is handled by hook
      console.error("Failed to place order:", error);
    }
  }, [cart, cartCount, getTotal, createOrder, clearCart]);

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-stone-50 lg:pl-0">
      {/* Menu Section */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="px-4 sm:px-6 lg:px-8 py-3 bg-white border-b border-stone-200 sticky top-0 z-10">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold text-stone-800">POS System</h1>
            <button
              onClick={() => setIsCartOpen(true)}
              className="lg:hidden relative bg-stone-800 text-white p-2 rounded-lg hover:bg-stone-700 transition-colors"
              aria-label="Open cart"
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

          {/* Search and Categories Row */}
          <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
            {/* Search Bar */}
            <div className="relative flex-1 sm:flex-initial sm:min-w-[200px]">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search menu..."
                className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-300 transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Categories Filter */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
                    activeCategory === cat.id
                      ? "bg-stone-800 text-white shadow-md"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-stone-400 text-sm">Loading menu...</div>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Coffee size={48} className="mx-auto mb-3 text-stone-300" />
                <p className="text-stone-500 font-medium">No items found</p>
                {search && (
                  <p className="text-stone-400 text-sm mt-1">
                    Try a different search term
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
              {filteredItems.map((item) => (
                <ProductCard key={item.item_id} item={item} onAdd={addToCart} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Desktop Cart Section */}
      <div className="hidden lg:flex w-[380px] bg-white h-full border-l border-stone-200 flex-col shadow-lg">
        <div className="p-5 border-b border-stone-200 bg-stone-50">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-stone-800">Order Summary</h2>
            {cartCount > 0 && (
              <span className="px-3 py-1 bg-stone-800 text-white text-xs font-bold rounded-full">
                {cartCount} {cartCount === 1 ? "item" : "items"}
              </span>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {cartCount === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-stone-400">
              <Coffee size={48} className="mb-3 opacity-50" />
              <p className="text-sm font-medium">No items yet</p>
              <p className="text-xs text-stone-400 mt-1">
                Add items to start order
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {cart.map((item) => (
                <CartItem
                  key={`${item.item_id}-${item.quantity}`}
                  item={item}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeFromCart}
                />
              ))}
            </div>
          )}
        </div>

        <div className="p-5 bg-stone-50 border-t-2 border-stone-300">
          <div className="space-y-3 mb-4">
            <div className="flex justify-between text-sm text-stone-600">
              <span>Subtotal</span>
              <span className="font-medium">฿{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-stone-900 border-t border-stone-300 pt-3">
              <span>Total</span>
              <span className="text-amber-600">฿{total.toFixed(2)}</span>
            </div>
          </div>

          <button
            disabled={cartCount === 0}
            onClick={handlePlaceOrder}
            className="w-full py-3.5 bg-stone-800 text-white rounded-lg font-bold text-base disabled:opacity-50 disabled:cursor-not-allowed hover:bg-stone-900 active:scale-[0.98] transition-all shadow-lg"
          >
            Checkout
          </button>
        </div>
      </div>

      {/* Mobile Cart Bottom Sheet */}
      {isCartOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsCartOpen(false)}
          />
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white rounded-t-xl border-t border-stone-200 z-50 max-h-[85vh] flex flex-col">
            <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
              <h2 className="text-lg font-bold text-stone-800">
                Order Summary
              </h2>
              {cartCount > 0 && (
                <span className="px-2.5 py-1 bg-stone-800 text-white text-xs font-bold rounded-full">
                  {cartCount}
                </span>
              )}
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 hover:bg-stone-100 rounded-lg"
                aria-label="Close cart"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {cartCount === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-stone-400 py-12">
                  <Coffee size={48} className="mb-3 opacity-50" />
                  <p className="text-sm font-medium">No items yet</p>
                  <p className="text-xs text-stone-400 mt-1">
                    Add items to start order
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {cart.map((item) => (
                    <CartItem
                      key={`${item.item_id}-${item.quantity}`}
                      item={item}
                      onUpdateQuantity={updateQuantity}
                      onRemove={removeFromCart}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 bg-stone-50 border-t border-stone-200">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm text-stone-600">
                  <span>Subtotal</span>
                  <span>฿{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold text-stone-800">
                  <span>Total</span>
                  <span>฿{total.toFixed(2)}</span>
                </div>
              </div>

              <button
                disabled={cartCount === 0}
                onClick={handlePlaceOrder}
                className="w-full py-3.5 bg-stone-800 text-white rounded-lg font-bold text-base disabled:opacity-50 disabled:cursor-not-allowed hover:bg-stone-900 active:scale-[0.98] transition-all shadow-lg"
              >
                Checkout
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function POSPage() {
  return (
    <ProtectedRoute allowedRoles={["Cashier", "Manager"]}>
      <POSPageContent />
    </ProtectedRoute>
  );
}
