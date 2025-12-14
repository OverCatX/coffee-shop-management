"use client";

import React, { memo, useCallback, useMemo, useState, useEffect } from "react";
import { Clock, CheckCircle2, ChefHat, AlertTriangle, Zap } from "lucide-react";
import { Order, MenuItem } from "@/types";
import RecipeView from "./RecipeView";
import { useOrderAvailability } from "@/lib/hooks/useStock";

interface OrderCardProps {
  order: Order & { waitTime?: number };
  updateStatus: (
    orderId: number,
    status: "pending" | "completed" | "cancelled"
  ) => Promise<void>;
  menuItems?: MenuItem[]; // Optional menu items for displaying names
}

const OrderCard: React.FC<OrderCardProps> = memo(
  ({ order, updateStatus, menuItems = [] }) => {
    const [viewingRecipe, setViewingRecipe] = useState<MenuItem | null>(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    
    // Update timer every second
    useEffect(() => {
      const interval = setInterval(() => {
        setCurrentTime(new Date());
      }, 1000);
      return () => clearInterval(interval);
    }, []);

    // Only check availability for pending orders to reduce queries
    const { availability: orderAvailability } = useOrderAvailability(
      order.status === 'pending' ? order.order_id : null
    );

    // Calculate wait time (only for pending orders)
    const waitTime = useMemo(() => {
      if (order.status !== 'pending') return undefined;
      if (order.waitTime !== undefined) return order.waitTime;
      const createdTime = new Date(order.created_at).getTime();
      return Math.floor((currentTime.getTime() - createdTime) / 1000);
    }, [order.created_at, order.waitTime, order.status, currentTime]);

    const isUrgent = waitTime !== undefined && waitTime > 300; // > 5 minutes
    const waitMinutes = waitTime !== undefined ? Math.floor(waitTime / 60) : 0;
    const waitSeconds = waitTime !== undefined ? waitTime % 60 : 0;

    // Create a map for quick menu item lookup
    const menuItemMap = useMemo(() => {
      const map = new Map<number, MenuItem>();
      menuItems.forEach((item) => {
        map.set(item.item_id, item);
      });
      return map;
    }, [menuItems]);

    // Get menu item name by item_id
    const getMenuItemName = useCallback(
      (itemId: number): string => {
        const menuItem = menuItemMap.get(itemId);
        return menuItem?.name || `Item #${itemId}`;
      },
      [menuItemMap]
    );

    // Get menu item by item_id
    const getMenuItem = useCallback(
      (itemId: number): MenuItem | undefined => {
        return menuItemMap.get(itemId);
      },
      [menuItemMap]
    );

    const getStatusColor = useCallback((status: string) => {
      switch (status) {
        case "pending":
          return "bg-amber-100 text-amber-800 border-amber-200";
        case "completed":
          return "bg-green-100 text-green-800 border-green-200";
        case "cancelled":
          return "bg-red-100 text-red-800 border-red-200";
        default:
          return "bg-gray-100 text-gray-800";
      }
    }, []);

    const getNextAction = useCallback((status: string) => {
      switch (status) {
        case "pending":
          return {
            label: "Mark as Completed",
            next: "completed" as const,
            color: "bg-green-600 hover:bg-green-700",
          };
        case "completed":
          return null;
        default:
          return null;
      }
    }, []);

    const action = useMemo(
      () => getNextAction(order.status),
      [order.status, getNextAction]
    );

    const handleStatusUpdate = useCallback(async () => {
      if (action) {
        await updateStatus(order.order_id, action.next);
      }
    }, [action, order.order_id, updateStatus]);

    const formattedTime = useMemo(() => {
      return new Date(order.created_at).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }, [order.created_at]);

    return (
      <div className={`bg-white rounded-lg border overflow-hidden flex flex-col h-full transition-all ${
        isUrgent 
          ? 'border-red-300 bg-red-50/30' 
          : 'border-stone-200 hover:border-stone-300'
      }`}>
        {/* Header */}
        <div className={`p-4 border-b ${
          isUrgent 
            ? 'bg-red-100 border-red-200' 
            : 'bg-stone-50 border-stone-200'
        }`}>
          <div className="flex justify-between items-start mb-2">
            <div>
              <div className="text-xs font-semibold text-stone-500 mb-1">
                Order #{order.order_id}
              </div>
              <div className="text-lg font-bold text-stone-900">
                {formattedTime}
              </div>
            </div>
            {isUrgent && (
              <div className="px-2 py-1 bg-red-600 text-white text-xs font-bold rounded">
                URGENT
              </div>
            )}
          </div>
          
          {/* Wait Time Timer - Only for pending orders */}
          {order.status === 'pending' && waitTime !== undefined && (
            <div className={`flex items-center gap-1.5 mt-2 ${
              isUrgent ? 'text-red-700' : 'text-stone-600'
            }`}>
              <Clock size={12} />
              <span className="text-xs font-medium">
                Waiting: {waitMinutes}m {waitSeconds}s
              </span>
            </div>
          )}
          
          {/* Completed Time - Only for completed orders */}
          {order.status === 'completed' && (
            <div className="flex items-center gap-1.5 text-green-600 mt-2">
              <CheckCircle2 size={12} />
              <span className="text-xs font-medium">Completed</span>
            </div>
          )}
        </div>

        <div className="p-4 flex-1 flex flex-col">
          {/* Stock Availability Alert */}
          {orderAvailability && !orderAvailability.can_fulfill && (
            <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-1.5 text-red-700 text-xs font-medium">
                <AlertTriangle size={14} />
                <span>Insufficient Stock</span>
              </div>
            </div>
          )}

          {/* Order Items */}
          <div className="flex-1 mb-3">
            <ul className="space-y-2">
              {order.order_details.map((detail, idx) => {
                const itemName = getMenuItemName(detail.item_id);
                const menuItem = getMenuItem(detail.item_id);
                const itemAvailability = orderAvailability?.items.find(
                  (item) => item.item_id === detail.item_id
                );
                const canMake = itemAvailability?.can_make ?? true;

                return (
                  <li key={idx} className="flex items-start gap-2 p-2 bg-stone-50 rounded-lg">
                    <span className="w-6 h-6 rounded bg-amber-100 flex items-center justify-center text-xs font-bold text-amber-800 shrink-0">
                      {detail.quantity}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-stone-800 text-sm font-semibold">
                          {itemName}
                        </span>
                        {!canMake && (
                          <AlertTriangle
                            size={12}
                            className="text-red-600 shrink-0"
                            title="Insufficient stock"
                          />
                        )}
                      </div>
                      {menuItem && (
                        <button
                          onClick={() => setViewingRecipe(menuItem)}
                          className="text-xs text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1 mt-0.5"
                        >
                          <ChefHat size={11} />
                          Recipe
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
          
          {/* Footer */}
          <div className="pt-3 border-t border-stone-200">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium text-stone-600">Total</span>
              {(() => {
                const subtotal = order.order_details.reduce(
                  (sum, detail) => sum + Number(detail.subtotal),
                  0
                );
                const paymentAmount = Number(order.payment_amount || order.total_amount);
                const hasDiscount = subtotal > paymentAmount;

                return (
                  <div className="text-right">
                    {hasDiscount ? (
                      <>
                        <div className="text-stone-400 line-through text-sm">
                          ฿{subtotal.toFixed(2)}
                        </div>
                        <div className="font-bold text-lg text-green-600">
                          ฿{paymentAmount.toFixed(2)}
                        </div>
                      </>
                    ) : (
                      <span className="font-bold text-lg text-stone-900">
                        ฿{paymentAmount.toFixed(2)}
                      </span>
                    )}
                  </div>
                );
              })()}
            </div>
            {action && (
              <button
                onClick={handleStatusUpdate}
                disabled={orderAvailability && !orderAvailability.can_fulfill}
                className={`w-full py-3 px-4 rounded-lg text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                  isUrgent 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : action.color
                }`}
              >
                {orderAvailability && !orderAvailability.can_fulfill
                  ? "Stock Insufficient"
                  : isUrgent
                  ? "Complete Urgent"
                  : "Mark as Completed"}
              </button>
            )}
          </div>
        </div>

        {/* Recipe View Modal */}
        {viewingRecipe && (
          <RecipeView
            menuItem={viewingRecipe}
            quantity={
              order.order_details.find(
                (d) => d.item_id === viewingRecipe.item_id
              )?.quantity || 1
            }
            onClose={() => setViewingRecipe(null)}
          />
        )}
      </div>
    );
  }
);

OrderCard.displayName = "OrderCard";

export default OrderCard;
