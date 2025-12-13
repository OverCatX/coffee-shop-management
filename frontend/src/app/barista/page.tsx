"use client";

import { useMemo, useCallback } from "react";
import { ChefHat, CheckCircle } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import OrderCard from "@/components/orders/OrderCard";
import { useOrdersByStatus, useUpdateOrderStatus } from "@/lib/hooks/useOrders";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

function BaristaPageContent() {
  const { orders: pendingOrders, isLoading: isLoadingPending } =
    useOrdersByStatus("pending");
  const { orders: completedOrders, isLoading: isLoadingCompleted } =
    useOrdersByStatus("completed");
  const { updateStatus } = useUpdateOrderStatus();

  const activeOrders = useMemo(() => {
    return [...pendingOrders, ...completedOrders].filter(
      (order) => order.status === "pending" || order.status === "completed"
    );
  }, [pendingOrders, completedOrders]);

  const handleUpdateStatus = useCallback(
    async (
      orderId: number,
      newStatus: "pending" | "completed" | "cancelled"
    ): Promise<void> => {
      try {
        await updateStatus(orderId, newStatus);
      } catch (error) {
        console.error("Failed to update order status:", error);
      }
    },
    [updateStatus]
  );

  const pendingCount = useMemo(
    () => activeOrders.filter((o) => o.status === "pending").length,
    [activeOrders]
  );
  const preparingCount = useMemo(
    () => activeOrders.filter((o) => o.status === "completed").length,
    [activeOrders]
  );

  return (
    <div className="flex h-screen bg-stone-50 lg:pl-0 overflow-hidden">
      <div className="w-full p-4 sm:p-6 lg:p-8 flex flex-col overflow-hidden">
        <header className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-stone-800 flex items-center gap-2 sm:gap-3">
                <ChefHat className="text-amber-600" size={28} />
                Barista Monitor
              </h1>
              <p className="text-stone-500 mt-2 text-sm sm:text-base">
                Manage order queue in sequence
              </p>
            </div>
            <div className="flex gap-2 sm:gap-4">
              <div className="bg-white px-3 sm:px-4 py-2 rounded-lg shadow-sm border border-stone-200 text-stone-600 flex items-center gap-2 text-xs sm:text-sm">
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                Waiting: <span className="font-bold">{pendingCount}</span>
              </div>
              <div className="bg-white px-3 sm:px-4 py-2 rounded-lg shadow-sm border border-stone-200 text-stone-600 flex items-center gap-2 text-xs sm:text-sm">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                Completed: <span className="font-bold">{preparingCount}</span>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 pb-20">
            {isLoadingPending || isLoadingCompleted ? (
              <div className="col-span-full h-64 flex items-center justify-center text-stone-400">
                <div>Loading orders...</div>
              </div>
            ) : activeOrders.length === 0 ? (
              <div className="col-span-full h-64 flex flex-col items-center justify-center text-stone-400 border-2 border-dashed border-stone-200 rounded-3xl">
                <CheckCircle size={48} className="mb-2 opacity-50" />
                <p>No orders yet</p>
              </div>
            ) : (
              <AnimatePresence>
                {activeOrders.map((order) => (
                  <OrderCard
                    key={order.order_id}
                    order={order}
                    updateStatus={handleUpdateStatus}
                  />
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BaristaPage() {
  return (
    <ProtectedRoute allowedRoles={['Barista', 'Manager']}>
      <BaristaPageContent />
    </ProtectedRoute>
  );
}
