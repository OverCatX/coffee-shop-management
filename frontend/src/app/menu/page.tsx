"use client";

import { useState, useCallback, useMemo } from "react";
import { Menu, Plus, Edit2, Trash2, X, Check, ChefHat } from "lucide-react";
import {
  useMenuItems,
  useCreateMenuItem,
  useUpdateMenuItem,
  useDeleteMenuItem,
  useToggleMenuItemAvailability,
} from "@/lib/hooks/useMenuItems";
import { MenuItem } from "@/types";
import { MenuItemCreate, MenuItemUpdate } from "@/lib/api/menuItems";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { showToast } from "@/utils/toast";

function MenuPageContent() {
  const { menuItems, isLoading } = useMenuItems();
  const { createMenuItem } = useCreateMenuItem();
  const { updateMenuItem } = useUpdateMenuItem();
  const { deleteMenuItem } = useDeleteMenuItem();
  const { toggleAvailability } = useToggleMenuItemAvailability();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [activeTab, setActiveTab] = useState<"menu" | "recipes">("menu");
  const [formData, setFormData] = useState<MenuItemCreate>({
    name: "",
    price: 0,
    category: "Coffee",
    description: "",
    is_available: true,
  });

  const handleCreate = useCallback(async () => {
    // Validation
    if (!formData.name.trim()) {
      showToast.error("Menu item name is required");
      return;
    }
    if (formData.price <= 0) {
      showToast.error("Price must be greater than 0");
      return;
    }
    
    try {
      await createMenuItem(formData);
      setIsModalOpen(false);
      setFormData({ name: "", price: 0, category: "Coffee", description: "", is_available: true });
    } catch (error) {
      // Error toast is handled by hook
      console.error("Failed to create menu item:", error);
    }
  }, [formData, createMenuItem]);

  const handleUpdate = useCallback(async () => {
    if (!editingItem) return;
    
    // Validation
    if (!formData.name.trim()) {
      showToast.error("Menu item name is required");
      return;
    }
    if (formData.price <= 0) {
      showToast.error("Price must be greater than 0");
      return;
    }
    
    try {
      const updateData: MenuItemUpdate = {
        name: formData.name,
        price: formData.price,
        category: formData.category,
        description: formData.description,
        is_available: formData.is_available,
      };
      await updateMenuItem(editingItem.item_id, updateData);
      setIsModalOpen(false);
      setEditingItem(null);
      setFormData({ name: "", price: 0, category: "Coffee", description: "", is_available: true });
    } catch (error) {
      // Error toast is handled by hook
      console.error("Failed to update menu item:", error);
    }
  }, [editingItem, formData, updateMenuItem]);

  const handleDelete = useCallback(
    async (id: number) => {
      if (!window.confirm("Are you sure you want to delete this menu item?")) return;
      try {
        await deleteMenuItem(id);
      } catch (error) {
        // Error toast is handled by hook
        console.error("Failed to delete menu item:", error);
      }
    },
    [deleteMenuItem]
  );

  const handleToggleAvailability = useCallback(
    async (id: number) => {
      try {
        await toggleAvailability(id);
      } catch (error) {
        console.error("Failed to toggle availability:", error);
      }
    },
    [toggleAvailability]
  );

  const openEditModal = useCallback((item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      price: Number(item.price),
      category: item.category,
      description: item.description || "",
      is_available: item.is_available,
    });
    setIsModalOpen(true);
  }, []);

  const categories = useMemo(() => {
    const cats = new Set(menuItems.map((item) => item.category));
    return Array.from(cats);
  }, [menuItems]);

  return (
    <div className="flex h-screen bg-stone-50 lg:pl-0 overflow-hidden">
      <div className="w-full p-4 sm:p-6 lg:p-8 flex flex-col overflow-hidden">
        <header className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-stone-800 flex items-center gap-2 sm:gap-3">
                <Menu className="text-amber-600" size={28} />
                Menu & Recipe Management
              </h1>
              <p className="text-stone-500 mt-2 text-sm sm:text-base">
                Manage menu items, recipes, and ingredients
              </p>
            </div>
            <button
              onClick={() => {
                setEditingItem(null);
                setFormData({ name: "", price: 0, category: "Coffee", description: "", is_available: true });
                setIsModalOpen(true);
              }}
              className="bg-stone-900 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-stone-800 transition-colors text-sm sm:text-base"
            >
              <Plus size={20} />
              <span className="whitespace-nowrap">Add Menu Item</span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          {/* Tabs */}
          <div className="flex gap-2 sm:gap-4 mb-4 sm:mb-6 border-b border-stone-200 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setActiveTab("menu")}
              className={`px-3 sm:px-4 py-2 font-medium transition-colors whitespace-nowrap ${
                activeTab === "menu"
                  ? "text-stone-900 border-b-2 border-stone-900"
                  : "text-stone-500 hover:text-stone-700"
              }`}
            >
              Menu Items ({menuItems.length})
            </button>
            <button
              onClick={() => setActiveTab("recipes")}
              className={`px-3 sm:px-4 py-2 font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
                activeTab === "recipes"
                  ? "text-stone-900 border-b-2 border-stone-900"
                  : "text-stone-500 hover:text-stone-700"
              }`}
            >
              <ChefHat size={18} />
              Recipes & Ingredients
            </button>
          </div>

          {activeTab === "menu" ? (
            <>
              {/* Category Filter */}
              <div className="flex gap-2 mb-4 sm:mb-6 overflow-x-auto pb-2 scrollbar-hide">
                <button
                  onClick={() => setActiveTab("menu")}
                  className="px-3 sm:px-4 py-2 bg-stone-800 text-white rounded-full text-xs sm:text-sm font-medium whitespace-nowrap"
                >
                  All ({menuItems.length})
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    className="px-3 sm:px-4 py-2 bg-white border border-stone-200 rounded-full text-xs sm:text-sm font-medium hover:bg-stone-50 whitespace-nowrap"
                  >
                    {cat} ({menuItems.filter((item) => item.category === cat).length})
                  </button>
                ))}
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-stone-400">Loading menu items...</div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 pb-20 lg:pb-8">
                  {menuItems.map((item) => (
                    <div
                      key={item.item_id}
                      className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-stone-100 flex flex-col"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="font-bold text-stone-800 text-base sm:text-lg">{item.name}</h3>
                          <p className="text-xs sm:text-sm text-stone-500">{item.category}</p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-bold ${
                            item.is_available
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {item.is_available ? "Available" : "Unavailable"}
                        </span>
                      </div>
                      {item.description && (
                        <p className="text-xs sm:text-sm text-stone-600 mb-4 line-clamp-2">{item.description}</p>
                      )}
                      <div className="flex justify-between items-center mt-auto">
                        <span className="font-bold text-amber-600 text-lg sm:text-xl">
                          ฿{Number(item.price).toFixed(2)}
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleToggleAvailability(item.item_id)}
                            className="p-2 rounded-lg bg-stone-100 hover:bg-stone-200 transition-colors"
                            title={item.is_available ? "Mark unavailable" : "Mark available"}
                          >
                            {item.is_available ? <X size={16} /> : <Check size={16} />}
                          </button>
                          <button
                            onClick={() => openEditModal(item)}
                            className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 transition-colors"
                          >
                            <Edit2 size={16} className="text-blue-600" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.item_id)}
                            className="p-2 rounded-lg bg-red-100 hover:bg-red-200 transition-colors"
                          >
                            <Trash2 size={16} className="text-red-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6 sm:p-8">
              <div className="text-center py-8 sm:py-12">
                <ChefHat className="mx-auto text-stone-300 mb-4" size={40} />
                <h3 className="text-base sm:text-lg font-semibold text-stone-600 mb-2">Recipe Management</h3>
                <p className="text-xs sm:text-sm text-stone-500 mb-4 sm:mb-6">
                  Manage menu item recipes and ingredient requirements
                </p>
                <p className="text-xs text-stone-400">This feature allows you to:</p>
                <ul className="text-xs text-stone-400 mt-2 space-y-1 text-left max-w-md mx-auto">
                  <li>• Define ingredients required for each menu item</li>
                  <li>• Set amount required per ingredient</li>
                  <li>• Track ingredient usage from inventory</li>
                  <li>• View recipe details for baristas</li>
                </ul>
                <p className="text-xs text-stone-400 mt-4">
                  <strong>Database Tables Used:</strong> menu_items, ingredients, menu_item_ingredients
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl sm:text-2xl font-bold text-stone-800 mb-6">
                {editingItem ? "Edit Menu Item" : "Add Menu Item"}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-200"
                  >
                    <option value="Coffee">Coffee</option>
                    <option value="Non-Coffee">Non-Coffee</option>
                    <option value="Bakery">Bakery</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-200"
                    rows={3}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_available"
                    checked={formData.is_available}
                    onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label htmlFor="is_available" className="text-sm font-medium text-stone-700">
                    Available
                  </label>
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingItem(null);
                  }}
                  className="flex-1 px-4 py-2 border border-stone-200 rounded-xl font-medium hover:bg-stone-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={editingItem ? handleUpdate : handleCreate}
                  className="flex-1 px-4 py-2 bg-stone-900 text-white rounded-xl font-medium hover:bg-stone-800 transition-colors"
                >
                  {editingItem ? "Update" : "Create"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MenuPage() {
  return (
    <ProtectedRoute allowedRoles={['Manager', 'Barista']}>
      <MenuPageContent />
    </ProtectedRoute>
  );
}
