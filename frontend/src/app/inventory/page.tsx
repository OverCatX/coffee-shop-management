"use client";

import { useState, useCallback } from "react";
import { Package, Plus, AlertTriangle, Edit2, Trash2 } from "lucide-react";
import {
  useInventory,
  useLowStockInventory,
  useCreateInventory,
  useUpdateInventoryQuantity,
  useDeleteInventory,
} from "@/lib/hooks/useInventory";
import { InventoryCreate } from "@/lib/api/inventory";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

function InventoryPageContent() {
  const { inventory, isLoading } = useInventory();
  const { lowStockItems } = useLowStockInventory();
  const { createInventory } = useCreateInventory();
  const { updateQuantity } = useUpdateInventoryQuantity();
  const { deleteInventory: deleteInv } = useDeleteInventory();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [quantityChange, setQuantityChange] = useState<string>("");
  const [formData, setFormData] = useState<InventoryCreate>({
    ingredient_id: 0,
    quantity: 0,
    min_threshold: 0,
  });

  const handleQuantityUpdate = useCallback(
    async (ingredientId: number) => {
      if (!quantityChange) return;
      try {
        await updateQuantity(ingredientId, parseFloat(quantityChange));
        setQuantityChange("");
        setEditingId(null);
      } catch (error) {
        console.error("Failed to update quantity:", error);
        alert("Failed to update quantity");
      }
    },
    [quantityChange, updateQuantity]
  );

  const handleDelete = useCallback(
    async (id: number) => {
      if (!confirm("Are you sure you want to delete this inventory record?"))
        return;
      try {
        await deleteInv(id);
      } catch (error) {
        console.error("Failed to delete inventory:", error);
        alert("Failed to delete inventory");
      }
    },
    [deleteInv]
  );

  return (
    <div className="flex h-screen bg-stone-50 lg:pl-0 overflow-hidden">
      <div className="w-full p-4 sm:p-6 lg:p-8 flex flex-col overflow-hidden">
        <header className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-stone-800 flex items-center gap-2 sm:gap-3">
                <Package className="text-amber-600" size={28} />
                Inventory Management
              </h1>
              <p className="text-stone-500 mt-2 text-sm sm:text-base">
                Monitor and manage ingredient stock levels
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-stone-900 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-stone-800 transition-colors text-sm sm:text-base"
            >
              <Plus size={20} />
              <span className="whitespace-nowrap">Add Inventory</span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          {/* Low Stock Alert */}
          {lowStockItems.length > 0 && (
            <div className="mb-4 sm:mb-6 bg-red-50 border border-red-200 rounded-2xl p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="text-red-600" size={24} />
                <h2 className="text-lg sm:text-xl font-bold text-red-800">
                  Low Stock Alert
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {lowStockItems.map((item) => (
                  <div
                    key={item.inventory_id}
                    className="bg-white p-3 sm:p-4 rounded-xl"
                  >
                    <p className="font-semibold text-stone-800 text-sm sm:text-base">
                      Ingredient #{item.ingredient_id}
                    </p>
                    <p className="text-xs sm:text-sm text-red-600">
                      Stock: {Number(item.quantity).toFixed(2)} (Min:{" "}
                      {Number(item.min_threshold).toFixed(2)})
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Inventory List */}
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-stone-400">Loading inventory...</div>
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
                          Ingredient ID
                        </th>
                        <th className="px-4 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold text-stone-700">
                          Quantity
                        </th>
                        <th className="px-4 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold text-stone-700">
                          Min Threshold
                        </th>
                        <th className="px-4 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold text-stone-700">
                          Status
                        </th>
                        <th className="px-4 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold text-stone-700">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {inventory.map((item) => {
                        const isLowStock =
                          Number(item.quantity) < Number(item.min_threshold);
                        return (
                          <tr
                            key={item.inventory_id}
                            className="border-b border-stone-100 hover:bg-stone-50"
                          >
                            <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm font-medium text-stone-800">
                              #{item.ingredient_id}
                            </td>
                            <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm text-stone-600">
                              {Number(item.quantity).toFixed(2)}
                            </td>
                            <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm text-stone-600">
                              {Number(item.min_threshold).toFixed(2)}
                            </td>
                            <td className="px-4 sm:px-6 py-4">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-bold ${
                                  isLowStock
                                    ? "bg-red-100 text-red-800"
                                    : "bg-green-100 text-green-800"
                                }`}
                              >
                                {isLowStock ? "Low Stock" : "In Stock"}
                              </span>
                            </td>
                            <td className="px-4 sm:px-6 py-4">
                              {editingId === item.ingredient_id ? (
                                <div className="flex gap-2">
                                  <input
                                    type="number"
                                    step="0.01"
                                    value={quantityChange}
                                    onChange={(e) =>
                                      setQuantityChange(e.target.value)
                                    }
                                    placeholder="Change"
                                    className="w-20 sm:w-24 px-2 py-1 border border-stone-200 rounded text-xs sm:text-sm"
                                  />
                                  <button
                                    onClick={() =>
                                      handleQuantityUpdate(item.ingredient_id)
                                    }
                                    className="px-2 sm:px-3 py-1 bg-green-600 text-white rounded text-xs sm:text-sm hover:bg-green-700"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => {
                                      setEditingId(null);
                                      setQuantityChange("");
                                    }}
                                    className="px-2 sm:px-3 py-1 bg-stone-200 text-stone-700 rounded text-xs sm:text-sm hover:bg-stone-300"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => setEditingId(item.ingredient_id)}
                                    className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 transition-colors"
                                  >
                                    <Edit2 size={16} className="text-blue-600" />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(item.inventory_id)}
                                    className="p-2 rounded-lg bg-red-100 hover:bg-red-200 transition-colors"
                                  >
                                    <Trash2 size={16} className="text-red-600" />
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-4">
                {inventory.map((item) => {
                  const isLowStock =
                    Number(item.quantity) < Number(item.min_threshold);
                  return (
                    <div
                      key={item.inventory_id}
                      className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-bold text-stone-800 text-base">
                            Ingredient #{item.ingredient_id}
                          </h3>
                          <span
                            className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-bold ${
                              isLowStock
                                ? "bg-red-100 text-red-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {isLowStock ? "Low Stock" : "In Stock"}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          {editingId === item.ingredient_id ? (
                            <>
                              <button
                                onClick={() =>
                                  handleQuantityUpdate(item.ingredient_id)
                                }
                                className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => {
                                  setEditingId(null);
                                  setQuantityChange("");
                                }}
                                className="px-3 py-1 bg-stone-200 text-stone-700 rounded text-xs hover:bg-stone-300"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => setEditingId(item.ingredient_id)}
                                className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 transition-colors"
                              >
                                <Edit2 size={16} className="text-blue-600" />
                              </button>
                              <button
                                onClick={() => handleDelete(item.inventory_id)}
                                className="p-2 rounded-lg bg-red-100 hover:bg-red-200 transition-colors"
                              >
                                <Trash2 size={16} className="text-red-600" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      {editingId === item.ingredient_id ? (
                        <div className="mt-3">
                          <input
                            type="number"
                            step="0.01"
                            value={quantityChange}
                            onChange={(e) => setQuantityChange(e.target.value)}
                            placeholder="Quantity change"
                            className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm"
                          />
                        </div>
                      ) : (
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-stone-500">Quantity:</span>
                            <span className="text-stone-800 font-medium">
                              {Number(item.quantity).toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-stone-500">Min Threshold:</span>
                            <span className="text-stone-800 font-medium">
                              {Number(item.min_threshold).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Add Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl sm:text-2xl font-bold text-stone-800 mb-6">
                Add Inventory
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    Ingredient ID
                  </label>
                  <input
                    type="number"
                    value={formData.ingredient_id || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        ingredient_id: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-4 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    Quantity
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.quantity || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        quantity: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-4 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    Min Threshold
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.min_threshold || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        min_threshold: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-4 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-200"
                  />
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-stone-200 rounded-xl font-medium hover:bg-stone-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    try {
                      await createInventory(formData);
                      setIsModalOpen(false);
                      setFormData({
                        ingredient_id: 0,
                        quantity: 0,
                        min_threshold: 0,
                      });
                    } catch (error) {
                      console.error("Failed to create inventory:", error);
                      alert("Failed to create inventory");
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-stone-900 text-white rounded-xl font-medium hover:bg-stone-800 transition-colors"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function InventoryPage() {
  return (
    <ProtectedRoute allowedRoles={['Manager']}>
      <InventoryPageContent />
    </ProtectedRoute>
  );
}
