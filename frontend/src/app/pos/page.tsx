"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import {
  ShoppingBag,
  Coffee,
  Search,
  X,
  User,
  Sparkles,
  Tag,
} from "lucide-react";
import ProductCard from "@/components/menu/ProductCard";
import CartItem from "@/components/cart/CartItem";
import { useCart } from "@/contexts/CartContext";
import { useMenuItems } from "@/lib/hooks/useMenuItems";
import { useCreateOrder } from "@/lib/hooks/useOrders";
import { OrderCreate } from "@/types";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useDebounce } from "@/utils/debounce";
import { filterMenuItems, getCategories } from "@/utils/filter";
import { customersApi, Customer } from "@/lib/api/customers";
import { showToast } from "@/utils/toast";

function POSPageContent() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [customerInput, setCustomerInput] = useState("");
  const [isMember, setIsMember] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [searchResults, setSearchResults] = useState<Customer[]>([]);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [isSearchingCustomer, setIsSearchingCustomer] = useState(false);
  const [pointsToRedeem, setPointsToRedeem] = useState<number>(0);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const customerInputRef = useRef<HTMLDivElement>(null);

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
  const debouncedCustomerSearch = useDebounce(customerInput, 500);

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

  // Normalize phone number (remove dashes, spaces)
  const normalizePhone = useCallback((phone: string): string => {
    return phone.replace(/[-\s]/g, "");
  }, []);

  // Calculate loyalty points (1 point per 10 baht, rounded down)
  const loyaltyPointsToAdd = useMemo(() => {
    if (!isMember || !selectedCustomer || total === 0) return 0;
    return Math.floor(total / 10);
  }, [total, isMember, selectedCustomer]);

  // Discount rate: 100 points = 10 baht (10 points = 1 baht)
  const POINTS_PER_BAHT = 10;

  // Calculate available points for redemption
  const availablePoints = useMemo(() => {
    if (!selectedCustomer) return 0;
    return Math.floor(selectedCustomer.loyalty_points || 0);
  }, [selectedCustomer]);

  // Calculate discount amount (points to redeem / POINTS_PER_BAHT)
  const discountAmount = useMemo(() => {
    if (pointsToRedeem <= 0) return 0;
    return Math.min(pointsToRedeem / POINTS_PER_BAHT, subtotal);
  }, [pointsToRedeem, subtotal]);

  // Calculate final total after discount
  const finalTotal = useMemo(() => {
    return Math.max(0, subtotal - discountAmount);
  }, [subtotal, discountAmount]);

  // Reset points to redeem when customer changes
  useEffect(() => {
    if (!selectedCustomer) {
      setPointsToRedeem(0);
    }
  }, [selectedCustomer]);

  // Search customers when input changes
  useEffect(() => {
    if (!isMember || !debouncedCustomerSearch.trim()) {
      setSearchResults([]);
      setShowCustomerDropdown(false);
      return;
    }

    const searchCustomers = async () => {
      setIsSearchingCustomer(true);
      try {
        const normalizedInput = normalizePhone(debouncedCustomerSearch.trim());
        const results = await customersApi.search(normalizedInput);
        setSearchResults(results);
        setShowCustomerDropdown(results.length > 0);
      } catch (error) {
        setSearchResults([]);
        setShowCustomerDropdown(false);
      } finally {
        setIsSearchingCustomer(false);
      }
    };

    searchCustomers();
  }, [debouncedCustomerSearch, isMember, normalizePhone]);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!showCustomerDropdown) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        customerInputRef.current &&
        !customerInputRef.current.contains(event.target as Node)
      ) {
        setShowCustomerDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showCustomerDropdown]);

  // Handle customer selection
  const handleSelectCustomer = useCallback((customer: Customer) => {
    setSelectedCustomer(customer);
    setCustomerInput(customer.phone || customer.customer_id.toString());
    setShowCustomerDropdown(false);
    setSearchResults([]);
  }, []);

  // Handle customer input change
  const handleCustomerInputChange = useCallback(
    (value: string) => {
      setCustomerInput(value);
      setSelectedCustomer(null);
      if (value.trim() && isMember) {
        setShowCustomerDropdown(true);
      } else {
        setShowCustomerDropdown(false);
      }
    },
    [isMember]
  );

  // Handle member checkbox
  const handleMemberChange = useCallback((checked: boolean) => {
    setIsMember(checked);
    if (!checked) {
      setCustomerInput("");
      setSelectedCustomer(null);
      setSearchResults([]);
      setShowCustomerDropdown(false);
      setPointsToRedeem(0);
    }
  }, []);

  // Handle points redemption
  const handlePointsRedeem = useCallback(
    (points: number) => {
      if (!selectedCustomer) return;
      const maxPoints = Math.min(
        availablePoints,
        Math.floor(subtotal * POINTS_PER_BAHT)
      );
      setPointsToRedeem(Math.max(0, Math.min(points, maxPoints)));
    },
    [selectedCustomer, availablePoints, subtotal]
  );

  const handlePlaceOrder = useCallback(async () => {
    if (cartCount === 0) return;

    // Validate customer if member is checked
    if (isMember && !selectedCustomer) {
      showToast.error("Please select a customer first");
      return;
    }

    try {
      const today = new Date().toISOString().split("T")[0];
      if (!today) {
        throw new Error("Failed to get current date");
      }

      // Calculate net loyalty points (points to add - points redeemed)
      const netPointsToAdd = loyaltyPointsToAdd - pointsToRedeem;

      const orderData: OrderCreate = {
        customer_id:
          isMember && selectedCustomer
            ? selectedCustomer.customer_id
            : undefined,
        order_date: today,
        order_details: cart.map((item) => ({
          item_id: item.item_id,
          quantity: item.quantity,
          unit_price: item.price,
          subtotal: item.price * item.quantity,
        })),
        payment_method: "cash",
        payment_amount: finalTotal, // Use final total after discount
      };

      await createOrder(orderData);

      // Update loyalty points: deduct redeemed points and add new points
      if (isMember && selectedCustomer) {
        try {
          // Net points change (can be positive or negative)
          await customersApi.updateLoyaltyPoints(
            selectedCustomer.customer_id,
            netPointsToAdd
          );

          if (pointsToRedeem > 0) {
            showToast.success(
              `Redeemed ${pointsToRedeem} points (฿${discountAmount.toFixed(
                2
              )} discount). ` +
                (netPointsToAdd > 0
                  ? `Added ${netPointsToAdd} new points.`
                  : netPointsToAdd < 0
                  ? `Net: ${netPointsToAdd} points.`
                  : "")
            );
          } else if (loyaltyPointsToAdd > 0) {
            showToast.success(
              `Added ${loyaltyPointsToAdd} loyalty points to ${selectedCustomer.name}`
            );
          }
        } catch (pointsError) {
          console.error("Failed to update loyalty points:", pointsError);
          // Don't fail the order if points update fails
        }
      }

      clearCart();
      setIsCartOpen(false);
      setCustomerInput("");
      setSelectedCustomer(null);
      setIsMember(false);
      setSearchResults([]);
      setShowCustomerDropdown(false);
      setPointsToRedeem(0);
      // Success toast is handled by hook
    } catch (error) {
      // Error toast is handled by hook
      console.error("Failed to place order:", error);
    }
  }, [
    cart,
    cartCount,
    getTotal,
    createOrder,
    clearCart,
    isMember,
    selectedCustomer,
    loyaltyPointsToAdd,
    pointsToRedeem,
    discountAmount,
    finalTotal,
  ]);

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-stone-50 lg:pl-0">
      {/* Menu Section */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="px-4 sm:px-6 lg:px-8 py-4 bg-gradient-to-r from-white via-stone-50 to-white border-b border-stone-200 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg shadow-md">
                <Coffee className="text-white" size={20} />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-stone-800 to-stone-600 bg-clip-text text-transparent">
                Coffee Shop POS System
              </h1>
            </div>
            <button
              onClick={() => setIsCartOpen(true)}
              className="lg:hidden relative bg-gradient-to-br from-stone-800 to-stone-900 text-white p-2.5 rounded-xl hover:from-stone-700 hover:to-stone-800 transition-all shadow-lg hover:shadow-xl active:scale-95"
              aria-label="Open cart"
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-br from-red-500 to-red-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg animate-pulse">
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
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 transition-colors"
                size={18}
              />
              <input
                type="text"
                placeholder="Search menu..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border-2 border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400 transition-all shadow-sm hover:shadow-md focus:shadow-lg"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Categories Filter */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {categories.map((cat, index) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                    activeCategory === cat.id
                      ? "bg-gradient-to-r from-stone-800 to-stone-700 text-white shadow-lg scale-105"
                      : "bg-white text-stone-600 hover:bg-stone-100 hover:shadow-md border border-stone-200"
                  }`}
                  style={{
                    animationDelay: `${index * 50}ms`,
                  }}
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
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-stone-500 font-medium">Loading menu...</p>
              </div>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center animate-fade-in">
                <div className="p-4 bg-stone-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                  <Coffee size={40} className="text-stone-400" />
                </div>
                <p className="text-stone-600 font-semibold text-lg">
                  No items found
                </p>
                {search && (
                  <p className="text-stone-400 text-sm mt-2">
                    Try a different search term
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4">
              {filteredItems.map((item, index) => (
                <div
                  key={item.item_id}
                  className="animate-fade-in"
                  style={{
                    animationDelay: `${Math.min(index * 30, 300)}ms`,
                  }}
                >
                  <ProductCard item={item} onAdd={addToCart} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Desktop Cart Section */}
      <div className="hidden lg:flex w-[380px] bg-gradient-to-b from-white to-stone-50 h-full border-l-2 border-stone-300 flex-col shadow-2xl">
        <div className="p-5 border-b-2 border-stone-300 bg-gradient-to-r from-stone-50 to-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="text-amber-600" size={20} />
              <h2 className="text-lg font-bold text-stone-800">
                Order Summary
              </h2>
            </div>
            {cartCount > 0 && (
              <span className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-bold rounded-full shadow-lg animate-pulse">
                {cartCount} {cartCount === 1 ? "item" : "items"}
              </span>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col">
          {/* Customer Section - Button to open modal - Moved to top */}
          <div className="mb-4">
            <button
              onClick={() => setIsCustomerModalOpen(true)}
              className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                isMember && selectedCustomer
                  ? "bg-gradient-to-r from-amber-50 to-amber-100 border-amber-400 shadow-md hover:shadow-lg"
                  : "bg-stone-50 border-stone-200 hover:border-stone-300 hover:bg-stone-100"
              }`}
            >
              <div className="flex items-center gap-2">
                <User
                  size={18}
                  className={
                    isMember && selectedCustomer
                      ? "text-amber-600"
                      : "text-stone-500"
                  }
                />
                <div className="text-left">
                  <span
                    className={`text-sm font-semibold ${
                      isMember && selectedCustomer
                        ? "text-amber-700"
                        : "text-stone-700"
                    }`}
                  >
                    {isMember && selectedCustomer
                      ? selectedCustomer.name
                      : "Guest"}
                  </span>
                  {isMember && selectedCustomer && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <Sparkles size={10} className="text-amber-600" />
                      <span className="text-xs text-amber-600 font-medium">
                        {selectedCustomer.loyalty_points} pts
                      </span>
                      {pointsToRedeem > 0 && (
                        <span className="text-xs text-purple-600 font-medium ml-1">
                          • Redeeming {pointsToRedeem} pts
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isMember && selectedCustomer && (
                  <Sparkles
                    size={14}
                    className="text-amber-600 animate-pulse"
                  />
                )}
                <span
                  className={`text-xs font-medium ${
                    isMember && selectedCustomer
                      ? "text-amber-600"
                      : "text-stone-500"
                  }`}
                >
                  {isMember && selectedCustomer ? "Edit" : "Add Member"}
                </span>
              </div>
            </button>
          </div>

          {/* Order Items */}
          {cartCount === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-stone-400">
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

        <div className="p-5 bg-gradient-to-b from-stone-50 to-white border-t-2 border-stone-300 flex flex-col">
          {/* Summary */}
          <div className="space-y-3 mb-4">
            <div className="flex justify-between text-sm text-stone-600">
              <span>Subtotal</span>
              <span className="font-medium">฿{subtotal.toFixed(2)}</span>
            </div>
            {pointsToRedeem > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span className="flex items-center gap-1">
                  <Tag size={12} />
                  Discount ({pointsToRedeem} pts)
                </span>
                <span className="font-bold">-฿{discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-xl font-bold text-stone-900 border-t-2 border-stone-300 pt-3">
              <span>Total</span>
              <span className="text-amber-600 bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent">
                ฿{finalTotal.toFixed(2)}
              </span>
            </div>
          </div>

          <button
            disabled={cartCount === 0}
            onClick={handlePlaceOrder}
            className="w-full py-4 bg-gradient-to-r from-stone-800 via-stone-700 to-stone-800 text-white rounded-xl font-bold text-base disabled:opacity-50 disabled:cursor-not-allowed hover:from-stone-700 hover:via-stone-600 hover:to-stone-700 active:scale-[0.98] transition-all shadow-xl hover:shadow-2xl relative overflow-hidden group"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              <ShoppingBag size={18} />
              Checkout
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
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
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl border-t-2 border-stone-300 z-50 max-h-[85vh] flex flex-col shadow-2xl animate-slide-up">
            <div className="p-4 border-b-2 border-stone-300 flex items-center justify-between bg-gradient-to-r from-stone-50 to-white">
              <div className="flex items-center gap-2">
                <ShoppingBag className="text-amber-600" size={20} />
                <h2 className="text-lg font-bold text-stone-800">
                  Order Summary
                </h2>
              </div>
              <div className="flex items-center gap-2">
                {cartCount > 0 && (
                  <span className="px-2.5 py-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-bold rounded-full shadow-lg">
                    {cartCount}
                  </span>
                )}
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
                  aria-label="Close cart"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col">
              {/* Customer Section - Button to open modal - Moved to top */}
              <div className="mb-4">
                <button
                  onClick={() => setIsCustomerModalOpen(true)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                    isMember && selectedCustomer
                      ? "bg-gradient-to-r from-amber-50 to-amber-100 border-amber-400 shadow-md hover:shadow-lg"
                      : "bg-stone-50 border-stone-200 hover:border-stone-300 hover:bg-stone-100"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <User
                      size={18}
                      className={
                        isMember && selectedCustomer
                          ? "text-amber-600"
                          : "text-stone-500"
                      }
                    />
                    <div className="text-left">
                      <span
                        className={`text-sm font-semibold ${
                          isMember && selectedCustomer
                            ? "text-amber-700"
                            : "text-stone-700"
                        }`}
                      >
                        {isMember && selectedCustomer
                          ? selectedCustomer.name
                          : "Guest"}
                      </span>
                      {isMember && selectedCustomer && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <Sparkles size={10} className="text-amber-600" />
                          <span className="text-xs text-amber-600 font-medium">
                            {selectedCustomer.loyalty_points} pts
                          </span>
                          {pointsToRedeem > 0 && (
                            <span className="text-xs text-purple-600 font-medium ml-1">
                              • Redeeming {pointsToRedeem} pts
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isMember && selectedCustomer && (
                      <Sparkles
                        size={14}
                        className="text-amber-600 animate-pulse"
                      />
                    )}
                    <span
                      className={`text-xs font-medium ${
                        isMember && selectedCustomer
                          ? "text-amber-600"
                          : "text-stone-500"
                      }`}
                    >
                      {isMember && selectedCustomer ? "Edit" : "Add Member"}
                    </span>
                  </div>
                </button>
              </div>

              {/* Order Items */}
              {cartCount === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-stone-400 py-12">
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

            <div className="p-4 bg-gradient-to-b from-stone-50 to-white border-t-2 border-stone-300 flex flex-col">
              {/* Summary */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm text-stone-600">
                  <span>Subtotal</span>
                  <span className="font-medium">฿{subtotal.toFixed(2)}</span>
                </div>
                {pointsToRedeem > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span className="flex items-center gap-1">
                      <Tag size={12} />
                      Discount ({pointsToRedeem} pts)
                    </span>
                    <span className="font-bold">
                      -฿{discountAmount.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold text-stone-900 border-t-2 border-stone-300 pt-3">
                  <span>Total</span>
                  <span className="text-amber-600 bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent">
                    ฿{finalTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                disabled={cartCount === 0}
                onClick={handlePlaceOrder}
                className="w-full py-4 bg-gradient-to-r from-stone-800 via-stone-700 to-stone-800 text-white rounded-xl font-bold text-base disabled:opacity-50 disabled:cursor-not-allowed hover:from-stone-700 hover:via-stone-600 hover:to-stone-700 active:scale-[0.98] transition-all shadow-xl hover:shadow-2xl relative overflow-hidden group"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <ShoppingBag size={18} />
                  Checkout
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Customer Modal */}
      {isCustomerModalOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setIsCustomerModalOpen(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="bg-white rounded-xl shadow-lg w-full max-w-md max-h-[90vh] flex flex-col border border-stone-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-4 border-b border-stone-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="text-amber-600" size={20} />
                  <h2 className="text-lg font-bold text-stone-800">
                    Customer Loyalty Points
                  </h2>
                </div>
                <button
                  onClick={() => setIsCustomerModalOpen(false)}
                  className="p-1.5 hover:bg-stone-100 rounded-lg transition-colors"
                  aria-label="Close modal"
                >
                  <X size={20} className="text-stone-500" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Member Checkbox */}
                <div>
                  <label
                    onClick={() => handleMemberChange(!isMember)}
                    className={`flex items-center gap-3 cursor-pointer p-3 rounded-lg border transition-colors ${
                      isMember
                        ? "bg-amber-50 border-amber-400"
                        : "bg-stone-50 border-stone-200 hover:border-stone-300"
                    }`}
                  >
                    <div
                      className={`relative w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        isMember
                          ? "bg-amber-600 border-amber-600"
                          : "bg-white border-stone-300"
                      }`}
                    >
                      {isMember && (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="3"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path d="M5 13l4 4L19 7"></path>
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <span
                        className={`text-sm font-semibold transition-colors ${
                          isMember ? "text-amber-700" : "text-stone-600"
                        }`}
                      >
                        Has Member
                      </span>
                      {isMember && (
                        <p className="text-xs text-amber-600 mt-0.5">
                          Customer will receive loyalty points
                        </p>
                      )}
                    </div>
                    {isMember && (
                      <Sparkles size={16} className="text-amber-600" />
                    )}
                  </label>
                </div>

                {/* Customer Input */}
                {isMember && (
                  <div ref={customerInputRef} className="space-y-3 relative">
                    <div className="relative">
                      <label className="block text-sm font-semibold text-stone-700 mb-2">
                        Search Customer
                      </label>
                      <input
                        type="text"
                        placeholder="Phone or Member ID"
                        value={customerInput}
                        onChange={(e) => handleCustomerInputChange(e.target.value)}
                        onFocus={() => {
                          if (searchResults.length > 0) {
                            setShowCustomerDropdown(true);
                          }
                        }}
                        className="w-full px-3 py-2 pr-10 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400 transition-colors"
                        disabled={isSearchingCustomer}
                      />
                      {isSearchingCustomer && (
                        <div className="absolute right-3 top-9 transform -translate-y-1/2">
                          <div className="w-4 h-4 border-2 border-amber-300 border-t-amber-600 rounded-full animate-spin"></div>
                        </div>
                      )}
                    </div>

                    {/* Customer Dropdown */}
                    {showCustomerDropdown && searchResults.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-stone-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {searchResults.map((customer) => (
                          <button
                            key={customer.customer_id}
                            onClick={() => {
                              handleSelectCustomer(customer);
                              setShowCustomerDropdown(false);
                            }}
                            className="w-full px-3 py-2 text-left hover:bg-amber-50 transition-colors border-b border-stone-100 last:border-b-0"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-stone-800 text-sm truncate">
                                  {customer.name}
                                </p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  {customer.phone && (
                                    <p className="text-xs text-stone-600">
                                      {customer.phone}
                                    </p>
                                  )}
                                  {customer.email && (
                                    <p className="text-xs text-stone-500">
                                      • {customer.email}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-1 text-amber-600 ml-2 shrink-0">
                                <Sparkles size={12} />
                                <span className="text-xs font-bold">
                                  {customer.loyalty_points}
                                </span>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Selected Customer Info */}
                    {selectedCustomer && !showCustomerDropdown && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-stone-800 text-sm">
                              {selectedCustomer.name}
                            </p>
                            {selectedCustomer.phone && (
                              <p className="text-xs text-stone-600 mt-0.5">
                                {selectedCustomer.phone}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => {
                              setSelectedCustomer(null);
                              setCustomerInput("");
                            }}
                            className="ml-2 p-1 hover:bg-green-100 rounded transition-colors shrink-0"
                            aria-label="Clear customer"
                          >
                            <X size={14} className="text-stone-500" />
                          </button>
                        </div>
                        <div className="flex items-center gap-1 text-amber-600">
                          <Sparkles size={12} />
                          <span className="text-xs font-bold">
                            Current: {selectedCustomer.loyalty_points} pts
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Redeem Points Section */}
                    {selectedCustomer && availablePoints > 0 && (
                      <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-3">
                          <Tag className="text-purple-600" size={14} />
                          <span className="text-sm font-bold text-purple-800">
                            Redeem Points
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mb-3 flex-wrap text-xs">
                          <span className="text-purple-700">
                            Available:{" "}
                            <span className="font-bold">{availablePoints} pts</span>
                          </span>
                          <span className="text-purple-600">
                            (100 pts = ฿10)
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <button
                            onClick={() => handlePointsRedeem(100)}
                            className={`px-3 py-1.5 text-xs rounded-lg border transition-colors font-semibold ${
                              pointsToRedeem >= 100
                                ? "bg-purple-600 text-white border-purple-600"
                                : "bg-white text-purple-700 border-purple-300 hover:bg-purple-50"
                            }`}
                          >
                            100 pts
                          </button>
                          <button
                            onClick={() => handlePointsRedeem(500)}
                            className={`px-3 py-1.5 text-xs rounded-lg border transition-colors font-semibold ${
                              pointsToRedeem >= 500
                                ? "bg-purple-600 text-white border-purple-600"
                                : "bg-white text-purple-700 border-purple-300 hover:bg-purple-50"
                            }`}
                          >
                            500 pts
                          </button>
                          <button
                            onClick={() =>
                              handlePointsRedeem(
                                Math.floor(subtotal * POINTS_PER_BAHT)
                              )
                            }
                            className={`px-3 py-1.5 text-xs rounded-lg border transition-colors font-semibold ${
                              pointsToRedeem >=
                              Math.floor(subtotal * POINTS_PER_BAHT)
                                ? "bg-purple-600 text-white border-purple-600"
                                : "bg-white text-purple-700 border-purple-300 hover:bg-purple-50"
                            }`}
                          >
                            Max
                          </button>
                          {pointsToRedeem > 0 && (
                            <button
                              onClick={() => handlePointsRedeem(0)}
                              className="px-3 py-1.5 text-xs rounded-lg border bg-red-100 text-red-700 border-red-300 hover:bg-red-200 transition-colors font-semibold"
                            >
                              Clear
                            </button>
                          )}
                        </div>
                        {pointsToRedeem > 0 && (
                          <div className="p-2 bg-white rounded-lg border border-purple-200">
                            <p className="text-xs text-purple-800">
                              Redeeming{" "}
                              <span className="font-bold">
                                {pointsToRedeem} pts
                              </span>{" "}
                              ={" "}
                              <span className="font-bold text-green-600">
                                ฿{discountAmount.toFixed(2)} discount
                              </span>
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Loyalty Points Preview */}
                    {selectedCustomer && loyaltyPointsToAdd > 0 && (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-xs text-amber-700 flex items-center gap-1">
                          <Sparkles size={12} />
                          Will receive{" "}
                          <span className="font-bold">
                            {loyaltyPointsToAdd} points
                          </span>{" "}
                          after payment
                          {pointsToRedeem > 0 && (
                            <span className="text-amber-600">
                              {" "}
                              (Net: {loyaltyPointsToAdd - pointsToRedeem} pts)
                            </span>
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-stone-200">
                <button
                  onClick={() => setIsCustomerModalOpen(false)}
                  className="w-full py-3 bg-amber-600 text-white rounded-lg font-semibold text-sm hover:bg-amber-700 transition-colors"
                >
                  Done
                </button>
              </div>
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
