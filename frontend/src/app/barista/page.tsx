"use client";

import { useMemo, useCallback, useState, useEffect } from "react";
import {
  ChefHat,
  Clock,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  X,
} from "lucide-react";
import OrderCard from "@/components/orders/OrderCard";
import { useOrdersByStatus, useUpdateOrderStatus } from "@/lib/hooks/useOrders";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useMenuItems } from "@/lib/hooks/useMenuItems";
import { useLowStockInventory } from "@/lib/hooks/useInventory";
import RestockModal from "@/components/stock/RestockModal";
import { IngredientInfo } from "@/lib/api/inventory";
import { paginateArray, getPaginationMeta } from "@/utils/pagination";
import Pagination from "@/components/common/Pagination";

const ITEMS_PER_PAGE = 12;

function BaristaPageContent() {
  const { orders: pendingOrders, isLoading: isLoadingPending } =
    useOrdersByStatus("pending");
  const { orders: completedOrders, isLoading: isLoadingCompleted } =
    useOrdersByStatus("completed");
  const { updateStatus } = useUpdateOrderStatus();
  const { menuItems } = useMenuItems();
  const { lowStockItems } = useLowStockInventory();
  const [restockingIngredient, setRestockingIngredient] = useState<{
    ingredient: IngredientInfo;
    quantity: number;
    minThreshold: number;
  } | null>(null);
  const [filter, setFilter] = useState<"pending" | "completed">("pending");
  const [pendingPage, setPendingPage] = useState(1);
  const [completedPage, setCompletedPage] = useState(1);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showGuide, setShowGuide] = useState(false);

  // Update current time every second for timers
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Sort orders by creation time (oldest first) and calculate wait time
  const sortedPendingOrders = useMemo(() => {
    return [...pendingOrders]
      .map((order) => {
        const createdTime = new Date(order.created_at).getTime();
        const waitTime = Math.floor((currentTime.getTime() - createdTime) / 1000);
        return { ...order, waitTime };
      })
      .sort((a, b) => {
        if (a.waitTime > 300 && b.waitTime <= 300) return -1;
        if (a.waitTime <= 300 && b.waitTime > 300) return 1;
        return a.waitTime - b.waitTime;
      });
  }, [pendingOrders, currentTime]);

  // Sort completed orders (newest first)
  const sortedCompletedOrders = useMemo(() => {
    return [...completedOrders]
      .map((order) => {
        const completedTime = new Date(order.updated_at).getTime();
        return { ...order, completedTime };
      })
      .sort((a, b) => b.completedTime - a.completedTime);
  }, [completedOrders]);

  // Paginate orders based on filter
  const paginatedPendingOrders = useMemo(() => {
    return paginateArray(sortedPendingOrders, pendingPage, ITEMS_PER_PAGE);
  }, [sortedPendingOrders, pendingPage]);

  const paginatedCompletedOrders = useMemo(() => {
    return paginateArray(sortedCompletedOrders, completedPage, ITEMS_PER_PAGE);
  }, [sortedCompletedOrders, completedPage]);

  const pendingPaginationMeta = useMemo(() => {
    return getPaginationMeta(pendingPage, ITEMS_PER_PAGE, sortedPendingOrders.length);
  }, [pendingPage, sortedPendingOrders.length]);

  const completedPaginationMeta = useMemo(() => {
    return getPaginationMeta(completedPage, ITEMS_PER_PAGE, sortedCompletedOrders.length);
  }, [completedPage, sortedCompletedOrders.length]);

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
    () => sortedPendingOrders.length,
    [sortedPendingOrders]
  );

  // Calculate statistics
  const stats = useMemo(() => {
    const urgentCount = sortedPendingOrders.filter((o) => o.waitTime > 300).length;
    const avgWaitTime = sortedPendingOrders.length > 0
      ? Math.floor(sortedPendingOrders.reduce((sum, o) => sum + o.waitTime, 0) / sortedPendingOrders.length)
      : 0;
    return { urgentCount, avgWaitTime };
  }, [sortedPendingOrders]);

  // Reset page when filter changes
  useEffect(() => {
    if (filter === "pending") {
      setPendingPage(1);
    } else {
      setCompletedPage(1);
    }
  }, [filter]);

  return (
    <div className="flex h-screen bg-stone-50 lg:pl-0 overflow-hidden">
      <div className="w-full p-4 sm:p-6 lg:p-8 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-stone-800 flex items-center gap-2 sm:gap-3">
                <ChefHat className="text-amber-600" size={28} />
                Barista Monitor
              </h1>
              <p className="text-stone-500 mt-2 text-sm sm:text-base">
                Manage order queue and track completed orders
              </p>
            </div>
            <button
              onClick={() => setShowGuide(!showGuide)}
              className="p-2 rounded-lg bg-stone-100 hover:bg-stone-200 transition-colors"
              title="Show Guide"
            >
              <HelpCircle size={20} className="text-stone-600" />
            </button>
          </div>

          {/* Quick Guide */}
          {showGuide && (
            <div className="mb-4 bg-gradient-to-r from-amber-50 to-amber-100 border-2 border-amber-300 rounded-xl p-4 sm:p-6">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-lg sm:text-xl font-bold text-stone-800 flex items-center gap-2">
                  <ChefHat className="text-amber-600" size={20} />
                  Quick Guide
                </h2>
                <button
                  onClick={() => setShowGuide(false)}
                  className="p-1 rounded hover:bg-amber-200 transition-colors"
                >
                  <X size={18} className="text-stone-600" />
                </button>
              </div>
              
              <div className="space-y-3 text-sm text-stone-700">
                <div>
                  <h3 className="font-bold text-red-600 mb-1 flex items-center gap-2">
                    <AlertTriangle size={16} />
                    URGENT = Order waiting over 5 minutes
                  </h3>
                  <p className="text-xs text-stone-600 ml-6">
                    Orders with "URGENT" badge appear at the top → Process first
                  </p>
                </div>
                
                <div className="border-t border-amber-200 pt-3">
                  <h3 className="font-bold text-stone-800 mb-2">Workflow:</h3>
                  <ol className="list-decimal list-inside space-y-1.5 text-xs ml-2">
                    <li>Check <strong>URGENT orders</strong> first (red badge on top)</li>
                    <li>Verify <strong>Stock</strong> (if insufficient → notify Manager)</li>
                    <li>Click <strong>"Recipe"</strong> to view ingredients (if needed)</li>
                    <li>Complete the order</li>
                    <li>Click <strong>"Mark as Completed"</strong> → Stock deducted automatically</li>
                  </ol>
                </div>

                <div className="border-t border-amber-200 pt-3">
                  <h3 className="font-bold text-stone-800 mb-2">Stock Status:</h3>
                  <ul className="list-disc list-inside space-y-1 text-xs ml-2">
                    <li><span className="text-red-600 font-semibold">Insufficient Stock</span> = Cannot Complete</li>
                    <li><span className="text-green-600 font-semibold">Sufficient Stock</span> = Can Complete</li>
                    <li>Click <strong>"Recipe"</strong> to view ingredient details</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setFilter("pending")}
              className={`px-5 py-2.5 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
                filter === "pending"
                  ? "bg-stone-800 text-white"
                  : "bg-white text-stone-600 hover:bg-stone-100 border border-stone-200"
              }`}
            >
              <Clock size={18} />
              Pending ({sortedPendingOrders.length})
            </button>
            <button
              onClick={() => setFilter("completed")}
              className={`px-5 py-2.5 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
                filter === "completed"
                  ? "bg-stone-800 text-white"
                  : "bg-white text-stone-600 hover:bg-stone-100 border border-stone-200"
              }`}
            >
              <CheckCircle2 size={18} />
              Completed ({sortedCompletedOrders.length})
            </button>
          </div>

          {/* Stats Cards */}
          {filter === "pending" && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
              <div className="bg-white rounded-lg p-3 border border-stone-200">
                <p className="text-xs text-stone-500 mb-1">Pending</p>
                <p className="text-xl font-bold text-stone-900">{pendingCount}</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-stone-200">
                <p className="text-xs text-stone-500 mb-1">Urgent</p>
                <p className="text-xl font-bold text-red-600">{stats.urgentCount}</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-stone-200 col-span-2 sm:col-span-1">
                <p className="text-xs text-stone-500 mb-1">Avg Wait</p>
                <p className="text-xl font-bold text-stone-900">
                  {Math.floor(stats.avgWaitTime / 60)}m {stats.avgWaitTime % 60}s
                </p>
              </div>
            </div>
          )}
        </header>

        <div className="flex-1 overflow-y-auto">
          {/* Low Stock Alert */}
          {filter === "pending" && lowStockItems.length > 0 && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="text-red-600" size={20} />
                  <div>
                    <p className="font-semibold text-red-800">
                      Low Stock ({lowStockItems.length})
                    </p>
                    <p className="text-sm text-red-600">
                      {lowStockItems.length} ingredient{lowStockItems.length > 1 ? 's' : ''} need restocking
                    </p>
                  </div>
                </div>
                <button
                  onClick={() =>
                    lowStockItems[0]?.ingredient &&
                    setRestockingIngredient({
                      ingredient: lowStockItems[0].ingredient!,
                      quantity: Number(lowStockItems[0].quantity),
                      minThreshold: Number(lowStockItems[0].min_threshold),
                    })
                  }
                  className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors"
                >
                  Restock
                </button>
              </div>
            </div>
          )}

          {/* Orders Section */}
          {filter === "pending" ? (
            isLoadingPending ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-stone-400">Loading orders...</div>
              </div>
            ) : pendingCount > 0 ? (
              <div>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                  {paginatedPendingOrders.map((order) => (
                    <OrderCard
                      key={order.order_id}
                      order={order}
                      updateStatus={handleUpdateStatus}
                      menuItems={menuItems}
                    />
                  ))}
                </div>
                {pendingPaginationMeta.totalPages > 1 && (
                  <div className="mt-6">
                    <Pagination
                      currentPage={pendingPage}
                      totalPages={pendingPaginationMeta.totalPages}
                      onPageChange={setPendingPage}
                      itemsPerPage={ITEMS_PER_PAGE}
                      totalItems={sortedPendingOrders.length}
                      showInfo={true}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg border border-stone-200">
                <CheckCircle2 size={48} className="text-stone-300 mb-3" />
                <p className="text-lg font-semibold text-stone-700">All Clear!</p>
                <p className="text-sm text-stone-500">No pending orders</p>
              </div>
            )
          ) : (
            isLoadingCompleted ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-stone-400">Loading orders...</div>
              </div>
            ) : sortedCompletedOrders.length > 0 ? (
              <div>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                  {paginatedCompletedOrders.map((order) => (
                    <OrderCard
                      key={order.order_id}
                      order={order}
                      updateStatus={handleUpdateStatus}
                      menuItems={menuItems}
                    />
                  ))}
                </div>
                {completedPaginationMeta.totalPages > 1 && (
                  <div className="mt-6">
                    <Pagination
                      currentPage={completedPage}
                      totalPages={completedPaginationMeta.totalPages}
                      onPageChange={setCompletedPage}
                      itemsPerPage={ITEMS_PER_PAGE}
                      totalItems={sortedCompletedOrders.length}
                      showInfo={true}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg border border-stone-200">
                <CheckCircle2 size={48} className="text-stone-300 mb-3" />
                <p className="text-lg font-semibold text-stone-700">No Completed Orders</p>
                <p className="text-sm text-stone-500">Completed orders will appear here</p>
              </div>
            )
          )}
        </div>

        {/* Restock Modal */}
        {restockingIngredient && (
          <RestockModal
            ingredient={restockingIngredient.ingredient}
            currentQuantity={restockingIngredient.quantity}
            minThreshold={restockingIngredient.minThreshold}
            onClose={() => setRestockingIngredient(null)}
          />
        )}
      </div>
    </div>
  );
}

export default function BaristaPage() {
  return (
    <ProtectedRoute allowedRoles={["Barista", "Manager"]}>
      <BaristaPageContent />
    </ProtectedRoute>
  );
}
