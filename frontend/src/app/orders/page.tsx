"use client";

import { useState, useMemo, Fragment } from "react";
import { ShoppingBag, Filter, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import { useOrders } from "@/lib/hooks/useOrders";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { paginateArray, getPaginationMeta } from "@/utils/pagination";
import Pagination from "@/components/common/Pagination";
import { useMenuItems } from "@/lib/hooks/useMenuItems";

const ITEMS_PER_PAGE = 20;

function OrdersPageContent() {
  const { orders, isLoading } = useOrders();
  const { menuItems } = useMenuItems();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedOrders, setExpandedOrders] = useState<Set<number>>(new Set());

  const filteredOrders = useMemo(() => {
    let filtered = orders;

    if (statusFilter !== "all") {
      filtered = filtered.filter((o) => o.status === statusFilter);
    }

    if (dateFilter) {
      // Filter by date - compare order_date and created_at with dateFilter
      filtered = filtered.filter((o) => {
        // Format order_date to YYYY-MM-DD
        const orderDateStr = o.order_date.includes('T') 
          ? o.order_date.split('T')[0]
          : o.order_date;
        
        // Format created_at to YYYY-MM-DD
        const createdDateStr = o.created_at.includes('T')
          ? o.created_at.split('T')[0]
          : o.created_at.split(' ')[0];
        
        // dateFilter is already in YYYY-MM-DD format
        return orderDateStr === dateFilter || createdDateStr === dateFilter;
      });
    }

    return filtered.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return dateB - dateA; // Newest first
    });
  }, [orders, statusFilter, dateFilter]);

  // Paginate filtered orders
  const paginatedOrders = useMemo(() => {
    return paginateArray(filteredOrders, currentPage, ITEMS_PER_PAGE);
  }, [filteredOrders, currentPage]);

  const paginationMeta = useMemo(() => {
    return getPaginationMeta(
      currentPage,
      ITEMS_PER_PAGE,
      filteredOrders.length
    );
  }, [currentPage, filteredOrders.length]);

  // Reset to page 1 when filters change
  useMemo(() => {
    if (
      currentPage > paginationMeta.totalPages &&
      paginationMeta.totalPages > 0
    ) {
      setCurrentPage(1);
    }
  }, [statusFilter, dateFilter, paginationMeta.totalPages, currentPage]);

  const stats = useMemo(() => {
    const totalRevenue = filteredOrders.reduce(
      (sum, o) => sum + Number(o.payment_amount || o.total_amount),
      0
    );
    const pendingCount = filteredOrders.filter(
      (o) => o.status === "pending"
    ).length;
    const completedCount = filteredOrders.filter(
      (o) => o.status === "completed"
    ).length;
    const cancelledCount = filteredOrders.filter(
      (o) => o.status === "cancelled"
    ).length;

    return {
      totalRevenue,
      totalOrders: filteredOrders.length,
      pendingCount,
      completedCount,
      cancelledCount,
    };
  }, [filteredOrders]);

  // Create menu item map for quick lookup
  const menuItemMap = useMemo(() => {
    const map = new Map<number, string>();
    menuItems.forEach((item) => {
      map.set(item.item_id, item.name);
    });
    return map;
  }, [menuItems]);

  // Get menu item name
  const getMenuItemName = (itemId: number): string => {
    return menuItemMap.get(itemId) || `Item #${itemId}`;
  };

  // Format date and time
  const formatDateTime = (dateString: string): { date: string; time: string } => {
    const date = new Date(dateString);
    const dateStr = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    const timeStr = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return { date: dateStr, time: timeStr };
  };

  // Toggle expanded order
  const toggleOrder = (orderId: number) => {
    setExpandedOrders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  return (
    <div className="flex h-screen bg-stone-50 lg:pl-0 overflow-hidden">
      <div className="w-full p-4 sm:p-6 lg:p-8 flex flex-col overflow-hidden">
        <header className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-800 flex items-center gap-2 sm:gap-3">
            <ShoppingBag className="text-amber-600" size={28} />
            Orders History
          </h1>
          <p className="text-stone-500 mt-2 text-sm sm:text-base">
            View and manage all orders
          </p>
        </header>

        <div className="flex-1 overflow-y-auto">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-white rounded-2xl p-4 sm:p-6 border border-stone-100">
              <p className="text-xs sm:text-sm text-stone-500 mb-1">
                Total Revenue
              </p>
              <p className="text-xl sm:text-2xl font-bold text-stone-800">
                ฿{stats.totalRevenue.toFixed(2)}
              </p>
            </div>
            <div className="bg-white rounded-2xl p-4 sm:p-6 border border-stone-100">
              <p className="text-xs sm:text-sm text-stone-500 mb-1">
                Total Orders
              </p>
              <p className="text-xl sm:text-2xl font-bold text-stone-800">
                {stats.totalOrders}
              </p>
            </div>
            <div className="bg-white rounded-2xl p-4 sm:p-6 border border-stone-100">
              <p className="text-xs sm:text-sm text-stone-500 mb-1">
                Completed
              </p>
              <p className="text-xl sm:text-2xl font-bold text-green-600">
                {stats.completedCount}
              </p>
            </div>
            <div className="bg-white rounded-2xl p-4 sm:p-6 border border-stone-100">
              <p className="text-xs sm:text-sm text-stone-500 mb-1">Pending</p>
              <p className="text-xl sm:text-2xl font-bold text-amber-600">
                {stats.pendingCount}
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-4 sm:mb-6 flex flex-wrap gap-2 sm:gap-4">
            <div className="flex items-center gap-2 bg-white px-3 sm:px-4 py-2 rounded-xl border border-stone-200 flex-1 sm:flex-initial min-w-[140px]">
              <Filter size={18} className="text-stone-400 shrink-0" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border-none focus:outline-none text-xs sm:text-sm font-medium w-full bg-transparent text-stone-800"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="flex items-center gap-2 bg-white px-3 sm:px-4 py-2 rounded-xl border border-stone-200 flex-1 sm:flex-initial min-w-[140px]">
              <Calendar size={18} className="text-stone-400 shrink-0" />
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="border-none focus:outline-none text-xs sm:text-sm font-medium w-full bg-transparent text-stone-800"
              />
            </div>
            {dateFilter && (
              <button
                onClick={() => setDateFilter("")}
                className="px-3 sm:px-4 py-2 bg-stone-100 hover:bg-stone-200 rounded-xl text-xs sm:text-sm font-medium transition-colors whitespace-nowrap"
              >
                Clear Date
              </button>
            )}
          </div>

          {/* Orders List */}
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-stone-400">Loading orders...</div>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-stone-50 border-b border-stone-200">
                      <tr>
                        <th className="px-4 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold text-stone-700">
                          Order ID
                        </th>
                        <th className="px-4 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold text-stone-700">
                          Date
                        </th>
                        <th className="px-4 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold text-stone-700">
                          Customer
                        </th>
                        <th className="px-4 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold text-stone-700">
                          Items
                        </th>
                        <th className="px-4 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold text-stone-700">
                          Total
                        </th>
                        <th className="px-4 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold text-stone-700">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedOrders.map((order) => {
                        const isExpanded = expandedOrders.has(order.order_id);
                        const { date, time } = formatDateTime(order.created_at);
                        const subtotal = order.order_details.reduce(
                          (sum, detail) => sum + Number(detail.subtotal),
                          0
                        );
                        const paymentAmount = Number(order.payment_amount || order.total_amount);
                        const hasDiscount = subtotal > paymentAmount;

                        return (
                          <Fragment key={order.order_id}>
                            <tr
                              className="border-b border-stone-100 hover:bg-stone-50 cursor-pointer"
                              onClick={() => toggleOrder(order.order_id)}
                            >
                              <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm font-medium text-stone-800">
                                #{order.order_id}
                              </td>
                              <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm text-stone-600">
                                <div>
                                  <div className="font-medium">{date}</div>
                                  <div className="text-stone-500">{time}</div>
                                </div>
                              </td>
                              <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm text-stone-600">
                                {order.customer_id
                                  ? `Customer #${order.customer_id}`
                                  : "Walk-in"}
                              </td>
                              <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm text-stone-600">
                                <div className="flex items-center gap-2">
                                  <span>{order.order_details.length} item(s)</span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleOrder(order.order_id);
                                    }}
                                    className="text-amber-600 hover:text-amber-700"
                                  >
                                    {isExpanded ? (
                                      <ChevronUp size={16} />
                                    ) : (
                                      <ChevronDown size={16} />
                                    )}
                                  </button>
                                </div>
                              </td>
                              <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm font-bold text-stone-800">
                                {hasDiscount ? (
                                  <div>
                                    <div className="text-stone-400 line-through">
                                      ฿{subtotal.toFixed(2)}
                                    </div>
                                    <div className="text-green-600">
                                      ฿{paymentAmount.toFixed(2)}
                                    </div>
                                  </div>
                                ) : (
                                  <div>฿{paymentAmount.toFixed(2)}</div>
                                )}
                              </td>
                              <td className="px-4 sm:px-6 py-4">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-bold ${
                                    order.status === "completed"
                                      ? "bg-green-100 text-green-800"
                                      : order.status === "pending"
                                      ? "bg-amber-100 text-amber-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {order.status}
                                </span>
                              </td>
                            </tr>
                            {isExpanded && (
                              <tr key={`${order.order_id}-details`}>
                                <td colSpan={6} className="px-4 sm:px-6 py-4 bg-stone-50">
                                  <div className="space-y-2">
                                    <div className="text-xs font-semibold text-stone-700 mb-2">
                                      Order Items:
                                    </div>
                                    {order.order_details.map((detail, idx) => (
                                      <div
                                        key={idx}
                                        className="flex items-center justify-between p-2 bg-white rounded-lg border border-stone-200"
                                      >
                                        <div className="flex items-center gap-2">
                                          <span className="w-6 h-6 rounded bg-amber-100 flex items-center justify-center text-xs font-bold text-amber-800">
                                            {detail.quantity}
                                          </span>
                                          <span className="text-sm text-stone-800">
                                            {getMenuItemName(detail.item_id)}
                                          </span>
                                        </div>
                                        <div className="text-sm text-stone-600">
                                          ฿{Number(detail.subtotal).toFixed(2)}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </td>
                              </tr>
                            )}
                          </Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-4">
                {paginatedOrders.map((order) => {
                  const isExpanded = expandedOrders.has(order.order_id);
                  const { date, time } = formatDateTime(order.created_at);
                  const subtotal = order.order_details.reduce(
                    (sum, detail) => sum + Number(detail.subtotal),
                    0
                  );
                  const paymentAmount = Number(order.payment_amount || order.total_amount);
                  const hasDiscount = subtotal > paymentAmount;

                  return (
                    <div
                      key={order.order_id}
                      className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-bold text-stone-800 text-base">
                            Order #{order.order_id}
                          </h3>
                          <div className="text-xs text-stone-500 mt-1">
                            <div className="font-medium">{date}</div>
                            <div>{time}</div>
                          </div>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-bold ${
                            order.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : order.status === "pending"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm mb-3">
                        <div className="flex justify-between">
                          <span className="text-stone-500">Customer:</span>
                          <span className="text-stone-800">
                            {order.customer_id
                              ? `Customer #${order.customer_id}`
                              : "Walk-in"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-stone-500">Items:</span>
                          <button
                            onClick={() => toggleOrder(order.order_id)}
                            className="flex items-center gap-1 text-stone-800 hover:text-amber-600"
                          >
                            <span>{order.order_details.length} item(s)</span>
                            {isExpanded ? (
                              <ChevronUp size={16} />
                            ) : (
                              <ChevronDown size={16} />
                            )}
                          </button>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-stone-500">Total:</span>
                          {hasDiscount ? (
                            <div className="text-right">
                              <div className="text-stone-400 line-through text-xs">
                                ฿{subtotal.toFixed(2)}
                              </div>
                              <div className="text-stone-800 font-bold text-green-600">
                                ฿{paymentAmount.toFixed(2)}
                              </div>
                            </div>
                          ) : (
                            <span className="text-stone-800 font-bold">
                              ฿{paymentAmount.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                      {isExpanded && (
                        <div className="pt-3 border-t border-stone-200 mt-3">
                          <div className="text-xs font-semibold text-stone-700 mb-2">
                            Order Items:
                          </div>
                          <div className="space-y-2">
                            {order.order_details.map((detail, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between p-2 bg-stone-50 rounded-lg border border-stone-200"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="w-6 h-6 rounded bg-amber-100 flex items-center justify-center text-xs font-bold text-amber-800">
                                    {detail.quantity}
                                  </span>
                                  <span className="text-sm text-stone-800">
                                    {getMenuItemName(detail.item_id)}
                                  </span>
                                </div>
                                <div className="text-sm text-stone-600 font-medium">
                                  ฿{Number(detail.subtotal).toFixed(2)}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Pagination */}
          {!isLoading && paginationMeta.totalPages > 1 && (
            <div className="mt-6 pt-6 border-t border-stone-200">
              <Pagination
                currentPage={currentPage}
                totalPages={paginationMeta.totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={ITEMS_PER_PAGE}
                totalItems={filteredOrders.length}
                showInfo={true}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <ProtectedRoute allowedRoles={["Manager", "Barista", "Cashier"]}>
      <OrdersPageContent />
    </ProtectedRoute>
  );
}
