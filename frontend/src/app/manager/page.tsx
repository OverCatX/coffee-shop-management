"use client";

import { useMemo } from "react";
import {
  BarChart3,
  Users,
  ShoppingBag,
  AlertTriangle,
  DollarSign,
  Coffee,
} from "lucide-react";
import { useOrders } from "@/lib/hooks/useOrders";
import { useLowStockInventory } from "@/lib/hooks/useInventory";
import { useEmployees } from "@/lib/hooks/useEmployees";
import { useMenuItems } from "@/lib/hooks/useMenuItems";
import { useAllCustomers } from "@/lib/hooks/useCustomers";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

function ManagerPageContent() {
  const { orders } = useOrders();
  const { lowStockItems } = useLowStockInventory();
  const { employees } = useEmployees();
  const { menuItems } = useMenuItems();
  const { customers } = useAllCustomers(); // Get all customers for stats

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

  const stats = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000)
      .toISOString()
      .split("T")[0];

    const todayOrders = orders.filter((o) => o.order_date === today);
    const yesterdayOrders = orders.filter((o) => o.order_date === yesterday);

    const todayRevenue = todayOrders.reduce(
      (sum, o) => sum + Number(o.payment_amount || o.total_amount),
      0
    );
    const yesterdayRevenue = yesterdayOrders.reduce(
      (sum, o) => sum + Number(o.payment_amount || o.total_amount),
      0
    );

    const revenueChange =
      yesterdayRevenue > 0
        ? (
            ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) *
            100
          ).toFixed(1)
        : "0";

    const pendingOrders = orders.filter((o) => o.status === "pending").length;
    const completedOrders = orders.filter(
      (o) => o.status === "completed"
    ).length;
    const cancelledOrders = orders.filter(
      (o) => o.status === "cancelled"
    ).length;

    const totalRevenue = orders
      .filter((o) => o.status === "completed")
      .reduce((sum, o) => sum + Number(o.payment_amount || o.total_amount), 0);

    const avgOrderValue =
      completedOrders > 0 ? totalRevenue / completedOrders : 0;

    const availableMenuItems = menuItems.filter((m) => m.is_available).length;
    const unavailableMenuItems = menuItems.length - availableMenuItems;

    const totalLoyaltyPoints = customers.reduce(
      (sum, c) => sum + (c.loyalty_points || 0),
      0
    );

    const topCustomers = [...customers]
      .sort((a, b) => (b.loyalty_points || 0) - (a.loyalty_points || 0))
      .slice(0, 3);

    return {
      todayRevenue,
      yesterdayRevenue,
      revenueChange: parseFloat(revenueChange),
      todayOrders: todayOrders.length,
      yesterdayOrders: yesterdayOrders.length,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      totalRevenue,
      avgOrderValue,
      totalEmployees: employees.length,
      totalMenuItems: menuItems.length,
      availableMenuItems,
      unavailableMenuItems,
      lowStockCount: lowStockItems.length,
      totalCustomers: customers.length,
      totalLoyaltyPoints,
      topCustomers,
    };
  }, [orders, employees, menuItems, lowStockItems, customers]);

  return (
    <div className="flex h-screen bg-stone-50 lg:pl-0 overflow-hidden">
      <div className="w-full p-4 sm:p-6 lg:p-8 flex flex-col overflow-hidden">
        <header className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-800 flex items-center gap-2 sm:gap-3">
            <BarChart3 className="text-amber-600" size={28} />
            Manager Dashboard
          </h1>
          <p className="text-stone-500 mt-2 text-sm sm:text-base">
            Overview of coffee shop operations
          </p>
        </header>

        <div className="flex-1 overflow-y-auto">
          {/* Main Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-5 border border-stone-200">
              <div className="flex items-center justify-between mb-3">
                <DollarSign className="text-green-600" size={20} />
                {stats.revenueChange !== 0 && (
                  <span
                    className={`text-xs font-medium ${
                      stats.revenueChange >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {stats.revenueChange >= 0 ? "+" : ""}
                    {stats.revenueChange}%
                  </span>
                )}
              </div>
              <p className="text-sm text-stone-600 mb-1">Today's Revenue</p>
              <p className="text-2xl font-bold text-stone-900 mb-1">
                ฿{stats.todayRevenue.toFixed(2)}
              </p>
              <p className="text-xs text-stone-500">
                {stats.todayOrders} orders today
              </p>
            </div>

            <div className="bg-white rounded-xl p-5 border border-stone-200">
              <ShoppingBag className="text-blue-600 mb-3" size={20} />
              <p className="text-sm text-stone-600 mb-1">Pending Orders</p>
              <p className="text-2xl font-bold text-stone-900 mb-1">
                {stats.pendingOrders}
              </p>
              <p className="text-xs text-stone-500">
                {stats.completedOrders} completed
              </p>
            </div>

            <div className="bg-white rounded-xl p-5 border border-stone-200">
              <Users className="text-purple-600 mb-3" size={20} />
              <p className="text-sm text-stone-600 mb-1">Employees</p>
              <p className="text-2xl font-bold text-stone-900 mb-1">
                {stats.totalEmployees}
              </p>
              <p className="text-xs text-stone-500">Active staff</p>
            </div>

            <div className="bg-white rounded-xl p-5 border border-stone-200">
              <div className="flex items-center justify-between mb-3">
                <Coffee className="text-amber-600" size={20} />
                {stats.lowStockCount > 0 && (
                  <span className="bg-red-100 text-red-700 text-xs font-semibold px-2 py-0.5 rounded">
                    {stats.lowStockCount}
                  </span>
                )}
              </div>
              <p className="text-sm text-stone-600 mb-1">Menu Items</p>
              <p className="text-2xl font-bold text-stone-900 mb-1">
                {stats.totalMenuItems}
              </p>
              <p className="text-xs text-stone-500">
                {stats.availableMenuItems} available
              </p>
            </div>
          </div>

          {/* Low Stock Alert */}
          {stats.lowStockCount > 0 && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="text-red-600" size={18} />
                <h2 className="font-semibold text-red-800">
                  Low Stock ({stats.lowStockCount})
                </h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {lowStockItems.slice(0, 8).map((item) => (
                  <div
                    key={item.inventory_id}
                    className="bg-white p-2 rounded-lg border border-red-100 text-sm"
                  >
                    <p className="font-medium text-stone-800 truncate">
                      {item.ingredient?.name || `#${item.ingredient_id}`}
                    </p>
                    <p className="text-xs text-red-600">
                      {Number(item.quantity).toFixed(1)}{" "}
                      {item.ingredient?.unit || ""}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Section - Recent Orders & Top Customers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Recent Orders */}
            <div className="bg-white rounded-xl border border-stone-200 p-5">
              <h2 className="text-lg font-semibold text-stone-800 mb-4">
                Recent Orders
              </h2>
              <div className="space-y-2">
                {orders.slice(0, 5).length > 0 ? (
                  orders.slice(0, 5).map((order) => {
                    const { date, time } = formatDateTime(order.created_at);
                    return (
                      <div
                        key={order.order_id}
                        className="flex items-center justify-between p-3 bg-stone-50 rounded-lg border border-stone-100 hover:bg-stone-100 transition-colors"
                      >
                        <div>
                          <p className="font-medium text-stone-800">
                            Order #{order.order_id}
                          </p>
                          <div className="text-xs text-stone-500">
                            <div className="font-medium">{date}</div>
                            <div>{time}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-stone-900">
                            ฿{Number(order.payment_amount || order.total_amount).toFixed(2)}
                          </p>
                          <span
                            className={`text-xs px-2 py-0.5 rounded ${
                              order.status === "completed"
                                ? "bg-green-100 text-green-700"
                                : order.status === "pending"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {order.status}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-6 text-stone-400 text-sm">
                    No orders yet
                  </div>
                )}
              </div>
            </div>

            {/* Top Customers */}
            <div className="bg-white rounded-xl border border-stone-200 p-5">
              <h2 className="text-lg font-semibold text-stone-800 mb-4">
                Top Customers
              </h2>
              <div className="space-y-2">
                {stats.topCustomers.length > 0 ? (
                  stats.topCustomers.map((customer, idx) => (
                    <div
                      key={customer.customer_id}
                      className="flex items-center justify-between p-3 bg-stone-50 rounded-lg border border-stone-100 hover:bg-stone-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-stone-400 font-medium text-sm w-5">
                          {idx + 1}.
                        </span>
                        <div>
                          <p className="font-medium text-stone-800 text-sm">
                            {customer.name ||
                              `Customer #${customer.customer_id}`}
                          </p>
                          <p className="text-xs text-stone-500">
                            {customer.email || customer.phone || "No contact"}
                          </p>
                        </div>
                      </div>
                      <p className="font-semibold text-stone-700">
                        {customer.loyalty_points || 0} pts
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-stone-400 text-sm">
                    No customers yet
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ManagerPage() {
  return (
    <ProtectedRoute allowedRoles={["Manager"]}>
      <ManagerPageContent />
    </ProtectedRoute>
  );
}
