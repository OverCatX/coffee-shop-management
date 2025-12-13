"use client";

import { useState, useCallback, useMemo } from "react";
import { ChefHat, Plus, Edit2, Trash2, Search, Package } from "lucide-react";
import { useMenuItems } from "@/lib/hooks/useMenuItems";
import { useRecipeByMenuItem, useAddRecipeIngredient, useUpdateRecipeIngredient, useRemoveRecipeIngredient } from "@/lib/hooks/useRecipes";
import { useIngredients } from "@/lib/hooks/useIngredients";
import { RecipeItemCreate, RecipeItemUpdate } from "@/lib/api/recipes";
import { MenuItem } from "@/types";
import { showToast } from "@/utils/toast";
import { useDebounce } from "@/utils/debounce";

function RecipeManagementTab() {
  const { menuItems, isLoading: menuItemsLoading } = useMenuItems();
  const { ingredients, isLoading: ingredientsLoading } = useIngredients();
  const [selectedMenuItem, setSelectedMenuItem] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRecipeItem, setEditingRecipeItem] = useState<{ itemId: number; ingredientId: number } | null>(null);
  const [formData, setFormData] = useState<RecipeItemCreate>({
    ingredient_id: 0,
    amount_required: 0,
    unit: "",
  });

  const debouncedSearch = useDebounce(searchQuery, 300);
  const { recipeItems, isLoading: recipeLoading } = useRecipeByMenuItem(selectedMenuItem);
  const { addIngredient } = useAddRecipeIngredient();
  const { updateIngredient } = useUpdateRecipeIngredient();
  const { removeIngredient } = useRemoveRecipeIngredient();

  // Filter menu items by search
  const filteredMenuItems = useMemo(() => {
    if (!debouncedSearch.trim()) return menuItems;
    const query = debouncedSearch.toLowerCase();
    return menuItems.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
    );
  }, [menuItems, debouncedSearch]);

  // Get selected menu item details
  const selectedMenuItemData = useMemo(() => {
    return menuItems.find((item) => item.item_id === selectedMenuItem);
  }, [menuItems, selectedMenuItem]);

  // Get ingredient name helper
  const getIngredientName = useCallback((ingredientId: number): string => {
    const ing = ingredients.find((i) => i.ingredient_id === ingredientId);
    return ing?.name || `Ingredient #${ingredientId}`;
  }, [ingredients]);

  // Check if ingredient is already in recipe
  const isIngredientInRecipe = useCallback((ingredientId: number): boolean => {
    return recipeItems.some((item) => item.ingredient_id === ingredientId);
  }, [recipeItems]);

  const handleAddIngredient = useCallback(async () => {
    if (!selectedMenuItem) return;
    if (!formData.ingredient_id) {
      showToast.error("Please select an ingredient");
      return;
    }
    if (formData.amount_required <= 0) {
      showToast.error("Amount required must be greater than 0");
      return;
    }
    if (!formData.unit.trim()) {
      showToast.error("Unit is required");
      return;
    }

    try {
      await addIngredient(selectedMenuItem, formData);
      setIsAddModalOpen(false);
      setFormData({ ingredient_id: 0, amount_required: 0, unit: "" });
    } catch (error) {
      console.error("Failed to add ingredient:", error);
    }
  }, [selectedMenuItem, formData, addIngredient]);

  const handleUpdateIngredient = useCallback(async () => {
    if (!editingRecipeItem) return;
    if (formData.amount_required && formData.amount_required <= 0) {
      showToast.error("Amount required must be greater than 0");
      return;
    }

    try {
      const updateData: RecipeItemUpdate = {
        amount_required: formData.amount_required,
        unit: formData.unit,
      };
      await updateIngredient(editingRecipeItem.itemId, editingRecipeItem.ingredientId, updateData);
      setEditingRecipeItem(null);
      setFormData({ ingredient_id: 0, amount_required: 0, unit: "" });
    } catch (error) {
      console.error("Failed to update ingredient:", error);
    }
  }, [editingRecipeItem, formData, updateIngredient]);

  const handleRemoveIngredient = useCallback(
    async (itemId: number, ingredientId: number) => {
      if (!confirm("Are you sure you want to remove this ingredient from the recipe?")) return;
      try {
        await removeIngredient(itemId, ingredientId);
      } catch (error) {
        console.error("Failed to remove ingredient:", error);
      }
    },
    [removeIngredient]
  );

  const openEditModal = useCallback((itemId: number, ingredientId: number, currentAmount: number, currentUnit: string) => {
    setEditingRecipeItem({ itemId, ingredientId });
    setFormData({
      ingredient_id: ingredientId,
      amount_required: currentAmount,
      unit: currentUnit,
    });
    setIsAddModalOpen(true);
  }, []);

  // Available ingredients (not already in recipe)
  const availableIngredients = useMemo(() => {
    if (!selectedMenuItem) return ingredients;
    return ingredients.filter((ing) => !isIngredientInRecipe(ing.ingredient_id));
  }, [ingredients, selectedMenuItem, isIngredientInRecipe]);

  if (menuItemsLoading || ingredientsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-stone-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Menu Items */}
      <div>
        <div className="relative mb-4">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search menu items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 sm:py-3 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-200"
          />
        </div>

        {/* Menu Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredMenuItems.map((item) => (
            <button
              key={item.item_id}
              onClick={() => {
                setSelectedMenuItem(item.item_id);
                setIsAddModalOpen(false);
                setEditingRecipeItem(null);
              }}
              className={`p-4 rounded-xl border-2 transition-all text-left ${
                selectedMenuItem === item.item_id
                  ? "border-amber-500 bg-amber-50"
                  : "border-stone-200 bg-white hover:border-stone-300"
              }`}
            >
              <h3 className="font-bold text-stone-800">{item.name}</h3>
              <p className="text-xs text-stone-500 mt-1">{item.category}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Recipe Details */}
      {selectedMenuItem && selectedMenuItemData && (
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
                <ChefHat className="text-amber-600" size={24} />
                Recipe: {selectedMenuItemData.name}
              </h2>
              <p className="text-sm text-stone-500 mt-1">{selectedMenuItemData.category}</p>
            </div>
            <button
              onClick={() => {
                setFormData({ ingredient_id: 0, amount_required: 0, unit: "" });
                setEditingRecipeItem(null);
                setIsAddModalOpen(true);
              }}
              className="bg-stone-900 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 hover:bg-stone-800 transition-colors"
            >
              <Plus size={18} />
              Add Ingredient
            </button>
          </div>

          {recipeLoading ? (
            <div className="text-center py-8 text-stone-400">Loading recipe...</div>
          ) : recipeItems.length === 0 ? (
            <div className="text-center py-8 text-stone-400 border-2 border-dashed border-stone-200 rounded-xl">
              <Package className="mx-auto mb-2 opacity-50" size={32} />
              <p>No ingredients in recipe yet</p>
              <p className="text-xs mt-1">Click "Add Ingredient" to start</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recipeItems.map((recipeItem) => (
                <div
                  key={`${recipeItem.item_id}-${recipeItem.ingredient_id}`}
                  className="flex items-center justify-between p-4 bg-stone-50 rounded-xl border border-stone-200"
                >
                  <div className="flex-1">
                    <h4 className="font-semibold text-stone-800">
                      {recipeItem.ingredient.name}
                    </h4>
                    <p className="text-sm text-stone-600">
                      {Number(recipeItem.amount_required).toFixed(2)} {recipeItem.unit}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        openEditModal(
                          recipeItem.item_id,
                          recipeItem.ingredient_id,
                          Number(recipeItem.amount_required),
                          recipeItem.unit
                        )
                      }
                      className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 transition-colors"
                      title="Edit"
                    >
                      <Edit2 size={16} className="text-blue-600" />
                    </button>
                    <button
                      onClick={() =>
                        handleRemoveIngredient(recipeItem.item_id, recipeItem.ingredient_id)
                      }
                      className="p-2 rounded-lg bg-red-100 hover:bg-red-200 transition-colors"
                      title="Remove"
                    >
                      <Trash2 size={16} className="text-red-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      {isAddModalOpen && selectedMenuItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-stone-800 mb-6">
              {editingRecipeItem ? "Edit Recipe Ingredient" : "Add Ingredient to Recipe"}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Ingredient
                </label>
                <select
                  value={formData.ingredient_id}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      ingredient_id: parseInt(e.target.value) || 0,
                    })
                  }
                  disabled={!!editingRecipeItem}
                  className="w-full px-4 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-200 disabled:bg-stone-100"
                >
                  <option value={0}>Select ingredient...</option>
                  {(editingRecipeItem ? ingredients : availableIngredients).map((ing) => (
                    <option key={ing.ingredient_id} value={ing.ingredient_id}>
                      {ing.name} ({ing.unit})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Amount Required
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.amount_required || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      amount_required: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-4 py-2 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-200 text-stone-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Unit
                </label>
                <input
                  type="text"
                  value={formData.unit}
                  onChange={(e) =>
                    setFormData({ ...formData, unit: e.target.value })
                  }
                  placeholder="e.g., g, ml, pieces"
                  className="w-full px-4 py-2 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-200 text-stone-800"
                />
              </div>
            </div>
            <div className="flex gap-4 mt-6">
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingRecipeItem(null);
                  setFormData({ ingredient_id: 0, amount_required: 0, unit: "" });
                }}
                className="flex-1 px-4 py-2 border border-stone-200 rounded-xl font-medium hover:bg-stone-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={editingRecipeItem ? handleUpdateIngredient : handleAddIngredient}
                className="flex-1 px-4 py-2 bg-stone-900 text-white rounded-xl font-medium hover:bg-stone-800 transition-colors"
              >
                {editingRecipeItem ? "Update" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RecipeManagementTab;

