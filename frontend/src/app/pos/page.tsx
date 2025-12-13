"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { ShoppingBag, Coffee, Search, X } from "lucide-react";
import { AnimatePresence } from "framer-motion";
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
  const [displayedItems, setDisplayedItems] = useState<number>(20); // Virtual scrolling limit
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  
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

  // Debounce search to reduce filtering operations
  const debouncedSearch = useDebounce(search, 300);

  // Get dynamic categories from menu items
  const categories = useMemo(() => {
    const cats = getCategories(menuItems);
    return [
      { id: "all", name: "All" },
      ...cats.map((cat) => ({ id: cat, name: cat })),
    ];
  }, [menuItems]);

  // Optimized filtering with single-pass algorithm
  const filteredItems = useMemo(() => {
    return filterMenuItems(menuItems, activeCategory, debouncedSearch);
  }, [menuItems, activeCategory, debouncedSearch]);

  // Virtual scrolling - only render visible items + buffer
  const visibleItems = useMemo(() => {
    return filteredItems.slice(0, displayedItems);
  }, [filteredItems, displayedItems]);

  // Reset displayed items when filters change
  useEffect(() => {
    setDisplayedItems(20);
  }, [activeCategory, debouncedSearch]);

  // Intersection Observer for infinite scroll (memory efficient)
  useEffect(() => {
    if (isLoading || displayedItems >= filteredItems.length) {
      return;
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setDisplayedItems((prev) => Math.min(prev + 20, filteredItems.length));
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current && loadMoreRef.current) {
        observerRef.current.unobserve(loadMoreRef.current);
      }
    };
  }, [isLoading, displayedItems, filteredItems.length]);

  const subtotal = useMemo(() => getTotal(), [getTotal]);
  const total = subtotal;

  const handlePlaceOrder = useCallback(async () => {
    if (cart.length === 0) return;

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
  }, [cart, getTotal, createOrder, clearCart]);

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-stone-50 lg:pl-0">
      {/* Menu Section */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4 sm:mb-6">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-stone-800">
                Select Today's Menu ☕️
              </h1>
              <p className="text-stone-500 text-xs sm:text-sm">
                Welcome, manage customer orders
              </p>
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1 sm:flex-initial">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search menu..."
                  className="pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-200 w-full sm:w-64 shadow-sm"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              {/* Mobile Cart Button */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="lg:hidden relative bg-stone-900 text-white p-2.5 rounded-xl shadow-lg"
                aria-label="Open cart"
              >
                <ShoppingBag size={20} />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {cart.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Categories */}
          <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all whitespace-nowrap
                  ${
                    activeCategory === cat.id
                      ? "bg-stone-800 text-white shadow-lg shadow-stone-900/20"
                      : "bg-white text-stone-500 hover:bg-stone-100 border border-stone-100"
                  }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </header>

        {/* Grid with Virtual Scrolling */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pt-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-stone-400">Loading menu...</div>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Coffee size={48} className="mx-auto mb-4 text-stone-300" />
                <p className="text-stone-400">No items found</p>
                <p className="text-stone-300 text-sm mt-1">
                  Try adjusting your search or category filter
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 pb-20 lg:pb-8">
                <AnimatePresence mode="popLayout">
                  {visibleItems.map((item) => (
                    <ProductCard
                      key={item.item_id}
                      item={item}
                      onAdd={addToCart}
                    />
                  ))}
                </AnimatePresence>
              </div>
              {/* Load more trigger (invisible) */}
              {displayedItems < filteredItems.length && (
                <div
                  ref={loadMoreRef}
                  className="h-20 flex items-center justify-center"
                >
                  <div className="text-stone-400 text-sm">
                    Loading more items...
                  </div>
                </div>
              )}
              {/* Results count */}
              <div className="text-center py-4 text-stone-400 text-sm">
                Showing {visibleItems.length} of {filteredItems.length} items
              </div>
            </>
          )}
        </div>
      </div>

      {/* Desktop Cart Section */}
      <div className="hidden lg:flex w-[380px] bg-white h-full shadow-2xl flex-col z-20 border-l border-stone-100">
        <div className="p-6 border-b border-stone-100">
          <h2 className="text-lg font-bold text-stone-800 flex items-center gap-2">
            <ShoppingBag className="text-amber-500" />
            Current Order
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-stone-300">
              <Coffee size={48} className="mb-4 opacity-50" />
              <p className="text-sm">No items yet</p>
              <p className="text-xs">
                Select items from the left to start ordering
              </p>
            </div>
          ) : (
            <AnimatePresence>
              {cart.map((item) => (
                <CartItem
                  key={item.item_id}
                  item={item}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeFromCart}
                />
              ))}
            </AnimatePresence>
          )}
        </div>

        <div className="p-6 bg-stone-50 rounded-t-3xl shadow-[0_-5px_20px_rgba(0,0,0,0.03)]">
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-sm text-stone-500">
              <span>Subtotal</span>
              <span>฿{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-stone-800">
              <span>Total Payment</span>
              <span>฿{total.toFixed(2)}</span>
            </div>
          </div>

          <button
            disabled={cart.length === 0}
            onClick={handlePlaceOrder}
            className="w-full py-4 bg-stone-900 text-white rounded-xl font-bold shadow-lg shadow-stone-900/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
          >
            <span>Checkout</span>
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
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-50 max-h-[85vh] flex flex-col">
            <div className="p-4 border-b border-stone-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-stone-800 flex items-center gap-2">
                <ShoppingBag className="text-amber-500" />
                Current Order ({cart.length})
              </h2>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
                aria-label="Close cart"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-stone-300 py-12">
                  <Coffee size={48} className="mb-4 opacity-50" />
                  <p className="text-sm">No items yet</p>
                  <p className="text-xs text-center">
                    Select items to start ordering
                  </p>
                </div>
              ) : (
                <AnimatePresence>
                  {cart.map((item) => (
                    <CartItem
                      key={item.item_id}
                      item={item}
                      onUpdateQuantity={updateQuantity}
                      onRemove={removeFromCart}
                    />
                  ))}
                </AnimatePresence>
              )}
            </div>

            <div className="p-4 bg-stone-50 border-t border-stone-100">
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm text-stone-500">
                  <span>Subtotal</span>
                  <span>฿{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-stone-800">
                  <span>Total Payment</span>
                  <span>฿{total.toFixed(2)}</span>
                </div>
              </div>

              <button
                disabled={cart.length === 0}
                onClick={handlePlaceOrder}
                className="w-full py-4 bg-stone-900 text-white rounded-xl font-bold shadow-lg shadow-stone-900/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
    <ProtectedRoute allowedRoles={['Cashier', 'Manager']}>
      <POSPageContent />
    </ProtectedRoute>
  );
}
