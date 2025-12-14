"use client";

import { useState, useCallback, useMemo } from "react";
import { ChefHat, Plus, Trash2, Search, Package, Check, X } from "lucide-react";
import { useMenuItems } from "@/lib/hooks/useMenuItems";
import { useRecipeByMenuItem, useAddRecipeIngredient, useUpdateRecipeIngredient, useRemoveRecipeIngredient } from "@/lib/hooks/useRecipes";
import { useIngredients } from "@/lib/hooks/useIngredients";
import { RecipeItemCreate } from "@/lib/api/recipes";
import { MenuItem } from "@/types";
import { showToast } from "@/utils/toast";
import { useDebounce } from "@/utils/debounce";

function RecipeManagementTab() {
  const { menuItems, isLoading: menuItemsLoading } = useMenuItems();
  const { ingredients, isLoading: ingredientsLoading } = useIngredients();
  const [selectedMenuItem, setSelectedMenuItem] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [ingredientSearchQuery, setIngredientSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  // Batch selection state: ingredient_id -> { amount, unit, selected }
  const [selectedIngredients, setSelectedIngredients] = useState<Map<number, { amount: number; unit: string; selected: boolean }>>(new Map());

  const debouncedSearch = useDebounce(searchQuery, 300);
  const debouncedIngredientSearch = useDebounce(ingredientSearchQuery, 300);
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


  // Check if ingredient is already in recipe
  const isIngredientInRecipe = useCallback((ingredientId: number): boolean => {
    return recipeItems.some((item) => item.ingredient_id === ingredientId);
  }, [recipeItems]);

  // Available ingredients (all ingredients, including those already in recipe)
  const availableIngredients = useMemo(() => {
    return ingredients;
  }, [ingredients]);

  // Filter ingredients by search
  const filteredIngredients = useMemo(() => {
    if (!debouncedIngredientSearch.trim()) return availableIngredients;
    const query = debouncedIngredientSearch.toLowerCase();
    return availableIngredients.filter((ing) =>
      ing.name.toLowerCase().includes(query) ||
      ing.unit.toLowerCase().includes(query)
    );
  }, [availableIngredients, debouncedIngredientSearch]);

  // Initialize selected ingredients map when modal opens
  const initializeSelectedIngredients = useCallback(() => {
    const newMap = new Map<number, { amount: number; unit: string; selected: boolean }>();
    const recipeMap = new Map(recipeItems.map((r) => [r.ingredient_id, r]));
    
    ingredients.forEach((ing) => {
      const existingRecipe = recipeMap.get(ing.ingredient_id);
      if (existingRecipe) {
        // Already in recipe - pre-select with current values
        newMap.set(ing.ingredient_id, {
          amount: Number(existingRecipe.amount_required),
          unit: existingRecipe.unit || ing.unit, // Fallback to ingredient unit
          selected: true,
        });
      } else {
        // Not in recipe - unselected with ingredient's default unit
        newMap.set(ing.ingredient_id, {
          amount: 0,
          unit: ing.unit, // Use ingredient's unit as default
          selected: false,
        });
      }
    });
    setSelectedIngredients(newMap);
  }, [ingredients, recipeItems]);

  // Open add modal and initialize
  const handleOpenAddModal = useCallback(() => {
    initializeSelectedIngredients();
    setIsAddModalOpen(true);
  }, [initializeSelectedIngredients]);

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

  // Toggle ingredient selection
  const toggleIngredient = useCallback((ingredientId: number) => {
    setSelectedIngredients((prev) => {
      const newMap = new Map(prev);
      const current = newMap.get(ingredientId);
      if (current) {
        newMap.set(ingredientId, {
          ...current,
          selected: !current.selected,
        });
      }
      return newMap;
    });
  }, []);

  // Update ingredient amount
  const updateIngredientAmount = useCallback((ingredientId: number, amount: number) => {
    setSelectedIngredients((prev) => {
      const newMap = new Map(prev);
      const current = newMap.get(ingredientId);
      if (current) {
        newMap.set(ingredientId, {
          ...current,
          amount: Math.max(0, amount),
        });
      }
      return newMap;
    });
  }, []);

  // Update ingredient unit
  const updateIngredientUnit = useCallback((ingredientId: number, unit: string) => {
    setSelectedIngredients((prev) => {
      const newMap = new Map(prev);
      const current = newMap.get(ingredientId);
      if (current) {
        newMap.set(ingredientId, {
          ...current,
          unit,
        });
      }
      return newMap;
    });
  }, []);

  // Batch add/update/remove ingredients
  const handleBatchSave = useCallback(async () => {
    if (!selectedMenuItem) return;

    const currentRecipeMap = new Map(
      recipeItems.map((r) => [r.ingredient_id, r])
    );

    const selected = Array.from(selectedIngredients.entries())
      .filter(([_, data]) => data.selected && data.amount > 0);
    
    const selectedIds = new Set(selected.map(([id]) => id));
    
    // Find ingredients to remove (in recipe but not selected)
    const toRemove = recipeItems.filter(
      (r) => !selectedIds.has(r.ingredient_id)
    );

    if (selected.length === 0 && toRemove.length === 0) {
      showToast.error("Please select at least one ingredient with amount > 0");
      return;
    }

    try {
      const promises: Promise<any>[] = [];

      // Add/Update selected ingredients
      selected.forEach(([ingredientId, data]) => {
        const existing = currentRecipeMap.get(ingredientId);
        const recipeData: RecipeItemCreate = {
          ingredient_id: ingredientId,
          amount_required: data.amount,
          unit: data.unit,
        };

        if (existing) {
          // Update existing
          promises.push(updateIngredient(selectedMenuItem, ingredientId, recipeData));
        } else {
          // Add new
          promises.push(addIngredient(selectedMenuItem, recipeData));
        }
      });

      // Remove unselected ingredients
      toRemove.forEach((recipeItem) => {
        promises.push(removeIngredient(selectedMenuItem, recipeItem.ingredient_id));
      });

      await Promise.all(promises);
      
      const actions = [];
      if (selected.length > 0) actions.push(`${selected.length} updated`);
      if (toRemove.length > 0) actions.push(`${toRemove.length} removed`);
      
      showToast.success(`Successfully ${actions.join(" and ")}`);
      setIsAddModalOpen(false);
      setSelectedIngredients(new Map());
      setIngredientSearchQuery("");
    } catch (error) {
      console.error("Failed to save ingredients:", error);
      showToast.error("Failed to save ingredients");
    }
  }, [selectedMenuItem, selectedIngredients, recipeItems, addIngredient, updateIngredient, removeIngredient]);

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
                setSelectedIngredients(new Map());
                setIngredientSearchQuery("");
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
              onClick={handleOpenAddModal}
              className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 hover:from-amber-600 hover:to-amber-700 transition-all shadow-md hover:shadow-lg"
            >
              <Plus size={18} />
              Manage Ingredients
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
              ))}
            </div>
          )}
        </div>
      )}

      {/* Batch Add/Edit Modal */}
      {isAddModalOpen && selectedMenuItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-stone-800 flex items-center gap-2">
                <ChefHat className="text-amber-600" size={24} />
                Manage Recipe Ingredients
              </h2>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setSelectedIngredients(new Map());
                  setIngredientSearchQuery("");
                }}
                className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* Search Ingredients */}
            <div className="relative mb-4">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search ingredients..."
                value={ingredientSearchQuery}
                onChange={(e) => setIngredientSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border-2 border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400 transition-all"
              />
            </div>

            {/* Ingredients List */}
            <div className="flex-1 overflow-y-auto space-y-2 mb-6 pr-2">
              {filteredIngredients.length === 0 ? (
                <div className="text-center py-8 text-stone-400">
                  <Package className="mx-auto mb-2 opacity-50" size={32} />
                  <p>No ingredients available</p>
                </div>
              ) : (
                filteredIngredients.map((ingredient) => {
                  const ingredientData = selectedIngredients.get(ingredient.ingredient_id);
                  const isSelected = ingredientData?.selected || false;
                  const amount = ingredientData?.amount || 0;
                  const unit = ingredientData?.unit || ingredient.unit;

                  return (
                    <div
                      key={ingredient.ingredient_id}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        isSelected
                          ? "bg-amber-50 border-amber-400 shadow-md"
                          : "bg-white border-stone-200 hover:border-stone-300"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Checkbox */}
                        <button
                          onClick={() => toggleIngredient(ingredient.ingredient_id)}
                          className={`mt-1 w-6 h-6 rounded border-2 flex items-center justify-center transition-all shrink-0 ${
                            isSelected
                              ? "bg-gradient-to-br from-amber-500 to-amber-600 border-amber-600 shadow-lg"
                              : "bg-white border-stone-300 hover:border-amber-400"
                          }`}
                        >
                          {isSelected && (
                            <Check size={14} className="text-white" />
                          )}
                        </button>

                        {/* Ingredient Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-stone-800">
                              {ingredient.name}
                            </h3>
                            {isSelected && (
                              <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
                                Selected
                              </span>
                            )}
                          </div>

                          {/* Amount and Unit Inputs */}
                          {isSelected && (
                            <div className="grid grid-cols-2 gap-3 mt-3">
                              <div>
                                <label className="block text-xs font-medium text-stone-600 mb-1">
                                  Amount
                                </label>
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0.01"
                                  value={amount || ""}
                                  onChange={(e) =>
                                    updateIngredientAmount(
                                      ingredient.ingredient_id,
                                      parseFloat(e.target.value) || 0
                                    )
                                  }
                                  className="w-full px-3 py-2 bg-white border-2 border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400 transition-all"
                                  placeholder="0.00"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-stone-600 mb-1">
                                  Unit <span className="text-amber-600">({ingredient.unit})</span>
                                </label>
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    value={unit}
                                    onChange={(e) =>
                                      updateIngredientUnit(
                                        ingredient.ingredient_id,
                                        e.target.value
                                      )
                                    }
                                    className="flex-1 px-3 py-2 bg-white border-2 border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400 transition-all"
                                    placeholder={ingredient.unit}
                                  />
                                  {unit !== ingredient.unit && (
                                    <button
                                      onClick={() =>
                                        updateIngredientUnit(
                                          ingredient.ingredient_id,
                                          ingredient.unit
                                        )
                                      }
                                      className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-medium transition-colors"
                                      title={`Use ingredient default unit: ${ingredient.unit}`}
                                    >
                                      Reset
                                    </button>
                                  )}
                                </div>
                                {unit !== ingredient.unit && unit && (
                                  <p className="text-xs text-amber-600 mt-1">
                                    ⚠️ Ingredient default is "{ingredient.unit}"
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer Actions */}
            <div className="flex gap-4 pt-4 border-t border-stone-200">
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setSelectedIngredients(new Map());
                  setIngredientSearchQuery("");
                }}
                className="flex-1 px-4 py-3 border-2 border-stone-200 rounded-xl font-medium hover:bg-stone-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleBatchSave}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-bold hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg hover:shadow-xl"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RecipeManagementTab;

