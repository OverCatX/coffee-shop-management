"use client";

import { useState, useMemo } from "react";
import { ShoppingBag, Filter, Calendar } from "lucide-react";
import { useOrders } from "@/lib/hooks/useOrders";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

function OrdersPageContent() {
  const { orders, isLoading } = useOrders();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("");

  const filteredOrders = useMemo(() => {
    let filtered = orders;

    if (statusFilter !== "all") {
      filtered = filtered.filter((o) => o.status === statusFilter);
    }

    if (dateFilter) {
      filtered = filtered.filter((o) => o.order_date === dateFilter);
    }

    return filtered.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return dateB - dateA; // Newest first
    });
  }, [orders, statusFilter, dateFilter]);

  const stats = useMemo(() => {
    const totalRevenue = filteredOrders.reduce((sum, o) => sum + Number(o.total_amount), 0);
    const pendingCount = filteredOrders.filter((o) => o.status === "pending").length;
    const completedCount = filteredOrders.filter((o) => o.status === "completed").length;
    const cancelledCount = filteredOrders.filter((o) => o.status === "cancelled").length;

    return {
      totalRevenue,
      totalOrders: filteredOrders.length,
      pendingCount,
      completedCount,
      cancelledCount,
    };
  }, [filteredOrders]);

  return (
    <div className="flex h-screen bg-stone-50 lg:pl-0 overflow-hidden">
      <div className="w-full p-4 sm:p-6 lg:p-8 flex flex-col overflow-hidden">
        <header className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-800 flex items-center gap-2 sm:gap-3">
            <ShoppingBag className="text-amber-600" size={28} />
            Orders History
          </h1>
          <p className="text-stone-500 mt-2 text-sm sm:text-base">View and manage all orders</p>
        </header>

        <div className="flex-1 overflow-y-auto">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-white rounded-2xl p-4 sm:p-6 border border-stone-100">
              <p className="text-xs sm:text-sm text-stone-500 mb-1">Total Revenue</p>
              <p className="text-xl sm:text-2xl font-bold text-stone-800">฿{stats.totalRevenue.toFixed(2)}</p>
            </div>
            <div className="bg-white rounded-2xl p-4 sm:p-6 border border-stone-100">
              <p className="text-xs sm:text-sm text-stone-500 mb-1">Total Orders</p>
              <p className="text-xl sm:text-2xl font-bold text-stone-800">{stats.totalOrders}</p>
            </div>
            <div className="bg-white rounded-2xl p-4 sm:p-6 border border-stone-100">
              <p className="text-xs sm:text-sm text-stone-500 mb-1">Completed</p>
              <p className="text-xl sm:text-2xl font-bold text-green-600">{stats.completedCount}</p>
            </div>
            <div className="bg-white rounded-2xl p-4 sm:p-6 border border-stone-100">
              <p className="text-xs sm:text-sm text-stone-500 mb-1">Pending</p>
              <p className="text-xl sm:text-2xl font-bold text-amber-600">{stats.pendingCount}</p>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-4 sm:mb-6 flex flex-wrap gap-2 sm:gap-4">
            <div className="flex items-center gap-2 bg-white px-3 sm:px-4 py-2 rounded-xl border border-stone-200 flex-1 sm:flex-initial min-w-[140px]">
              <Filter size={18} className="text-stone-400 shrink-0" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border-none focus:outline-none text-xs sm:text-sm font-medium w-full"
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
                className="border-none focus:outline-none text-xs sm:text-sm font-medium w-full"
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
                      {filteredOrders.map((order) => (
                        <tr key={order.order_id} className="border-b border-stone-100 hover:bg-stone-50">
                          <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm font-medium text-stone-800">
                            #{order.order_id}
                          </td>
                          <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm text-stone-600">
                            {order.order_date}
                          </td>
                          <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm text-stone-600">
                            {order.customer_id ? `Customer #${order.customer_id}` : "Walk-in"}
                          </td>
                          <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm text-stone-600">
                            {order.order_details.length} item(s)
                          </td>
                          <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm font-bold text-stone-800">
                            ฿{Number(order.total_amount).toFixed(2)}
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
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-4">
                {filteredOrders.map((order) => (
                  <div
                    key={order.order_id}
                    className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-stone-800 text-base">Order #{order.order_id}</h3>
                        <p className="text-xs text-stone-500">{order.order_date}</p>
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
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-stone-500">Customer:</span>
                        <span className="text-stone-800">
                          {order.customer_id ? `Customer #${order.customer_id}` : "Walk-in"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-500">Items:</span>
                        <span className="text-stone-800">{order.order_details.length} item(s)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-500">Total:</span>
                        <span className="text-stone-800 font-bold">
                          ฿{Number(order.total_amount).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <ProtectedRoute allowedRoles={['Manager', 'Barista', 'Cashier']}>
      <OrdersPageContent />
    </ProtectedRoute>
  );
}
