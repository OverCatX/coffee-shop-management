"use client";

import { useMemo } from "react";
import {
  BarChart3,
  Package,
  Users,
  ShoppingBag,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import { useOrders } from "@/lib/hooks/useOrders";
import { useLowStockInventory } from "@/lib/hooks/useInventory";
import { useEmployees } from "@/lib/hooks/useEmployees";
import { useMenuItems } from "@/lib/hooks/useMenuItems";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({
  icon,
  title,
  value,
  subtitle,
  color,
}) => {
  return (
    <div className={`${color} rounded-2xl p-4 sm:p-6 border`}>
      <div className="flex items-center justify-between mb-4">{icon}</div>
      <h3 className="text-xs sm:text-sm font-medium text-stone-600 mb-1">{title}</h3>
      <p className="text-2xl sm:text-3xl font-bold text-stone-800 mb-1">{value}</p>
      <p className="text-xs text-stone-500">{subtitle}</p>
    </div>
  );
};

function ManagerPageContent() {
  const { orders } = useOrders();
  const { lowStockItems } = useLowStockInventory();
  const { employees } = useEmployees();
  const { menuItems } = useMenuItems();

  const stats = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    const todayOrders = orders.filter((o) => o.order_date === today);
    const todayRevenue = todayOrders.reduce(
      (sum, o) => sum + Number(o.total_amount),
      0
    );
    const pendingOrders = orders.filter((o) => o.status === "pending").length;
    const completedOrders = orders.filter(
      (o) => o.status === "completed"
    ).length;

    return {
      todayRevenue,
      todayOrders: todayOrders.length,
      pendingOrders,
      completedOrders,
      totalEmployees: employees.length,
      totalMenuItems: menuItems.length,
      lowStockCount: lowStockItems.length,
    };
  }, [orders, employees, menuItems, lowStockItems]);

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
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <StatCard
              icon={<TrendingUp className="text-green-600" size={24} />}
              title="Today's Revenue"
              value={`฿${stats.todayRevenue.toFixed(2)}`}
              subtitle={`${stats.todayOrders} orders`}
              color="bg-green-50 border-green-200"
            />
            <StatCard
              icon={<ShoppingBag className="text-blue-600" size={24} />}
              title="Pending Orders"
              value={stats.pendingOrders.toString()}
              subtitle={`${stats.completedOrders} completed`}
              color="bg-blue-50 border-blue-200"
            />
            <StatCard
              icon={<Users className="text-purple-600" size={24} />}
              title="Employees"
              value={stats.totalEmployees.toString()}
              subtitle="Active staff"
              color="bg-purple-50 border-purple-200"
            />
            <StatCard
              icon={<Package className="text-amber-600" size={24} />}
              title="Menu Items"
              value={stats.totalMenuItems.toString()}
              subtitle={`${stats.lowStockCount} low stock`}
              color="bg-amber-50 border-amber-200"
            />
          </div>

          {/* Low Stock Alert */}
          {stats.lowStockCount > 0 && (
            <div className="mb-6 sm:mb-8 bg-red-50 border border-red-200 rounded-2xl p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="text-red-600" size={24} />
                <h2 className="text-lg sm:text-xl font-bold text-red-800">
                  Low Stock Alert
                </h2>
              </div>
              <p className="text-red-700 text-sm sm:text-base">
                {stats.lowStockCount} ingredient
                {stats.lowStockCount > 1 ? "s" : ""} need restocking
              </p>
            </div>
          )}

          {/* Recent Orders */}
          <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-stone-800 mb-4">
              Recent Orders
            </h2>
            <div className="space-y-3">
              {orders.slice(0, 5).map((order) => (
                <div
                  key={order.order_id}
                  className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 p-4 bg-stone-50 rounded-xl"
                >
                  <div>
                    <p className="font-semibold text-stone-800">
                      Order #{order.order_id}
                    </p>
                    <p className="text-sm text-stone-500">{order.order_date}</p>
                  </div>
                  <div className="flex sm:flex-col sm:text-right justify-between sm:justify-start items-center sm:items-end gap-2">
                    <p className="font-bold text-stone-800">
                      ฿{Number(order.total_amount).toFixed(2)}
                    </p>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
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
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ManagerPage() {
  return (
    <ProtectedRoute allowedRoles={['Manager']}>
      <ManagerPageContent />
    </ProtectedRoute>
  );
}
