"use client";

import { useState, useCallback, useMemo } from "react";
import {
  Menu,
  Plus,
  Edit2,
  Trash2,
  X,
  Check,
  ChefHat,
  Search,
  Eye,
  Image as ImageIcon,
  Upload,
} from "lucide-react";
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
import { paginateArray, getPaginationMeta } from "@/utils/pagination";
import Pagination from "@/components/common/Pagination";
import { useAuth } from "@/contexts/AuthContext";
import { getMenuItemImageUrl, getPlaceholderImage } from "@/utils/imageUtils";
import { useDebounce } from "@/utils/debounce";
import RecipeManagementTab from "@/components/menu/RecipeManagementTab";

const ITEMS_PER_PAGE = 20;

function MenuPageContent() {
  const { user } = useAuth();
  const isManager = user?.role === "Manager";
  const { menuItems, isLoading } = useMenuItems();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewingItem, setViewingItem] = useState<MenuItem | null>(null);
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
    image_url: "",
    is_available: true,
  });
  const [imagePreview, setImagePreview] = useState<string>("");

  const debouncedSearch = useDebounce(searchQuery, 300);

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
      setFormData({
        name: "",
        price: 0,
        category: "Coffee",
        description: "",
        image_url: "",
        is_available: true,
      });
      setImagePreview("");
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
        image_url: formData.image_url || undefined,
        is_available: formData.is_available,
      };
      await updateMenuItem(editingItem.item_id, updateData);
      setIsModalOpen(false);
      setEditingItem(null);
      setFormData({
        name: "",
        price: 0,
        category: "Coffee",
        description: "",
        is_available: true,
      });
    } catch (error) {
      // Error toast is handled by hook
      console.error("Failed to update menu item:", error);
    }
  }, [editingItem, formData, updateMenuItem]);

  const handleDelete = useCallback(
    async (id: number) => {
      if (!window.confirm("Are you sure you want to delete this menu item?"))
        return;
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

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      showToast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast.error("Image size must be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setFormData({ ...formData, image_url: base64String });
      setImagePreview(base64String);
    };
    reader.readAsDataURL(file);
  }, [formData]);

  const handleImageUrlChange = useCallback((url: string) => {
    setFormData({ ...formData, image_url: url });
    setImagePreview(url);
  }, [formData]);

  const openEditModal = useCallback((item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      price: Number(item.price),
      category: item.category,
      description: item.description || "",
      image_url: item.image_url || "",
      is_available: item.is_available,
    });
    setImagePreview(item.image_url || "");
    setIsModalOpen(true);
  }, []);

  const categories = useMemo(() => {
    const cats = new Set(menuItems.map((item) => item.category));
    return Array.from(cats).sort();
  }, [menuItems]);

  // Filter menu items by category and search
  const filteredMenuItems = useMemo(() => {
    let filtered = menuItems;

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter((item) => item.category === selectedCategory);
    }

    // Filter by search query
    if (debouncedSearch.trim()) {
      const query = debouncedSearch.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [menuItems, selectedCategory, debouncedSearch]);

  // Paginate filtered menu items
  const paginatedMenuItems = useMemo(() => {
    return paginateArray(filteredMenuItems, currentPage, ITEMS_PER_PAGE);
  }, [filteredMenuItems, currentPage]);

  const paginationMeta = useMemo(() => {
    return getPaginationMeta(
      currentPage,
      ITEMS_PER_PAGE,
      filteredMenuItems.length
    );
  }, [currentPage, filteredMenuItems.length]);

  // Reset to page 1 when filters change
  useMemo(() => {
    if (
      currentPage > paginationMeta.totalPages &&
      paginationMeta.totalPages > 0
    ) {
      setCurrentPage(1);
    }
  }, [
    selectedCategory,
    debouncedSearch,
    paginationMeta.totalPages,
    currentPage,
  ]);

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
            {isManager && (
              <button
                onClick={() => {
                  setEditingItem(null);
                  setFormData({
                    name: "",
                    price: 0,
                    category: "Coffee",
                    description: "",
                    is_available: true,
                  });
                  setIsModalOpen(true);
                }}
                className="bg-stone-900 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-stone-800 transition-colors text-sm sm:text-base"
              >
                <Plus size={20} />
                <span className="whitespace-nowrap">Add Menu Item</span>
              </button>
            )}
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
              {/* Search Bar */}
              <div className="mb-4 sm:mb-6">
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="Search menu items by name, description, or category..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full pl-10 pr-4 py-2 sm:py-3 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-200"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div className="flex gap-2 mb-4 sm:mb-6 overflow-x-auto pb-2 scrollbar-hide">
                <button
                  onClick={() => {
                    setSelectedCategory("all");
                    setCurrentPage(1);
                  }}
                  className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === "all"
                      ? "bg-stone-900 text-white"
                      : "bg-white border border-stone-200 hover:bg-stone-50"
                  }`}
                >
                  All ({menuItems.length})
                </button>
                {categories.map((cat) => {
                  const count = menuItems.filter(
                    (item) => item.category === cat
                  ).length;
                  return (
                    <button
                      key={cat}
                      onClick={() => {
                        setSelectedCategory(cat);
                        setCurrentPage(1);
                      }}
                      className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
                        selectedCategory === cat
                          ? "bg-stone-900 text-white"
                          : "bg-white border border-stone-200 hover:bg-stone-50"
                      }`}
                    >
                      {cat} ({count})
                    </button>
                  );
                })}
              </div>

              {/* Results Info */}
              {filteredMenuItems.length !== menuItems.length && (
                <div className="mb-4 text-sm text-stone-600">
                  Showing {filteredMenuItems.length} of {menuItems.length} menu
                  items
                </div>
              )}

              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-stone-400">Loading menu items...</div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 pb-20 lg:pb-8">
                    {paginatedMenuItems.map((item) => {
                      const imageUrl = getMenuItemImageUrl(item);
                      
                      return (
                        <div
                          key={item.item_id}
                          className="bg-white rounded-lg border border-stone-200 flex flex-col overflow-hidden hover:shadow-md transition-all"
                        >
                          {/* Image */}
                          <div className="h-40 w-full overflow-hidden bg-stone-100 relative">
                            <img
                              src={imageUrl}
                              alt={item.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = getPlaceholderImage(item);
                              }}
                            />
                            {!item.is_available && (
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <span className="text-white font-bold text-sm">Unavailable</span>
                              </div>
                            )}
                          </div>
                          
                          {/* Content */}
                          <div className="p-4 flex-1 flex flex-col">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex-1">
                                <h3 className="font-bold text-stone-800 text-base mb-1">
                                  {item.name}
                                </h3>
                                <p className="text-xs text-stone-500">
                                  {item.category}
                                </p>
                              </div>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-semibold shrink-0 ${
                                  item.is_available
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {item.is_available ? "Available" : "Unavailable"}
                              </span>
                            </div>
                            
                            {item.description && (
                              <p className="text-xs text-stone-600 mb-3 line-clamp-2">
                                {item.description}
                              </p>
                            )}
                            
                            <div className="flex justify-between items-center mt-auto pt-3 border-t border-stone-100">
                              <span className="font-bold text-amber-600 text-lg">
                                ฿{Number(item.price).toFixed(2)}
                              </span>
                              <div className="flex gap-1">
                                <button
                                  onClick={() => setViewingItem(item)}
                                  className="p-1.5 rounded-lg bg-purple-100 hover:bg-purple-200 transition-colors"
                                  title="View details"
                                >
                                  <Eye size={14} className="text-purple-600" />
                                </button>
                                {isManager && (
                                  <>
                                    <button
                                      onClick={() =>
                                        handleToggleAvailability(item.item_id)
                                      }
                                      className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 transition-colors"
                                      title={
                                        item.is_available
                                          ? "Mark unavailable"
                                          : "Mark available"
                                      }
                                    >
                                      {item.is_available ? (
                                        <X size={14} />
                                      ) : (
                                        <Check size={14} />
                                      )}
                                    </button>
                                    <button
                                      onClick={() => openEditModal(item)}
                                      className="p-1.5 rounded-lg bg-blue-100 hover:bg-blue-200 transition-colors"
                                      title="Edit menu item"
                                    >
                                      <Edit2 size={14} className="text-blue-600" />
                                    </button>
                                    <button
                                      onClick={() => handleDelete(item.item_id)}
                                      className="p-1.5 rounded-lg bg-red-100 hover:bg-red-200 transition-colors"
                                      title="Delete menu item"
                                    >
                                      <Trash2 size={14} className="text-red-600" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {paginationMeta.totalPages > 1 && (
                    <div className="mt-6 pt-6 border-t border-stone-200">
                      <Pagination
                        currentPage={currentPage}
                        totalPages={paginationMeta.totalPages}
                        onPageChange={setCurrentPage}
                        itemsPerPage={ITEMS_PER_PAGE}
                        totalItems={filteredMenuItems.length}
                        showInfo={true}
                      />
                    </div>
                  )}
                </>
              )}
            </>
          ) : (
            <RecipeManagementTab />
          )}
        </div>

        {/* View Details Modal */}
        {viewingItem && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-stone-800">
                  {viewingItem.name}
                </h2>
                <button
                  onClick={() => setViewingItem(null)}
                  className="text-stone-400 hover:text-stone-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                    Category
                  </span>
                  <p className="text-stone-800 font-medium mt-1">
                    {viewingItem.category}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                    Price
                  </span>
                  <p className="text-stone-800 font-bold text-xl mt-1">
                    ฿{Number(viewingItem.price).toFixed(2)}
                  </p>
                </div>
                {viewingItem.description && (
                  <div>
                    <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                      Description
                    </span>
                    <p className="text-stone-600 mt-1">
                      {viewingItem.description}
                    </p>
                  </div>
                )}
                <div>
                  <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                    Status
                  </span>
                  <div className="mt-1">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                        viewingItem.is_available
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {viewingItem.is_available ? "Available" : "Unavailable"}
                    </span>
                  </div>
                </div>
                {isManager && (
                  <div className="pt-4 border-t border-stone-200 flex gap-2">
                    <button
                      onClick={() => {
                        setViewingItem(null);
                        openEditModal(viewingItem);
                      }}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                    >
                      Edit
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Create/Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl sm:text-2xl font-bold text-stone-800 mb-6">
                {editingItem ? "Edit Menu Item" : "Add Menu Item"}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-200 text-stone-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-4 py-2 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-200 text-stone-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-200 text-stone-800"
                  >
                    <option value="Coffee">Coffee</option>
                    <option value="Non-Coffee">Non-Coffee</option>
                    <option value="Bakery">Bakery</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-200 text-stone-800"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    Image
                  </label>
                  <div className="space-y-3">
                    {/* Image Preview */}
                    {imagePreview && (
                      <div className="relative w-full h-48 bg-stone-100 rounded-xl overflow-hidden border border-stone-200">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                          onError={() => {
                            setImagePreview("");
                            showToast.error("Failed to load image");
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview("");
                            setFormData({ ...formData, image_url: "" });
                          }}
                          className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}
                    
                    {/* File Upload */}
                    <div className="flex gap-2">
                      <label className="flex-1 cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        <div className="flex items-center justify-center gap-2 px-4 py-2 bg-stone-100 border border-stone-200 rounded-xl hover:bg-stone-200 transition-colors">
                          <Upload size={18} className="text-stone-600" />
                          <span className="text-sm font-medium text-stone-700">
                            Upload Image
                          </span>
                        </div>
                      </label>
                    </div>

                    {/* URL Input */}
                    <div className="relative">
                      <ImageIcon
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400"
                        size={18}
                      />
                      <input
                        type="text"
                        value={formData.image_url || ""}
                        onChange={(e) => handleImageUrlChange(e.target.value)}
                        placeholder="Or paste image URL here..."
                        className="w-full pl-10 pr-4 py-2 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-200 text-stone-800 text-sm"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_available"
                    checked={formData.is_available}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        is_available: e.target.checked,
                      })
                    }
                    className="w-4 h-4"
                  />
                  <label
                    htmlFor="is_available"
                    className="text-sm font-medium text-stone-700"
                  >
                    Available
                  </label>
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingItem(null);
                    setImagePreview("");
                    setFormData({
                      name: "",
                      price: 0,
                      category: "Coffee",
                      description: "",
                      image_url: "",
                      is_available: true,
                    });
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
    <ProtectedRoute allowedRoles={["Manager", "Barista"]}>
      <MenuPageContent />
    </ProtectedRoute>
  );
}
