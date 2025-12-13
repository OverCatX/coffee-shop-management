"use client";

import React, { useState, useMemo } from "react";
import { ChefHat, X, AlertTriangle, CheckCircle2, Package } from "lucide-react";
import { useRecipeByMenuItem } from "@/lib/hooks/useRecipes";
import { useMenuItemAvailability } from "@/lib/hooks/useStock";
import { MenuItem } from "@/types";

interface RecipeViewProps {
  menuItem: MenuItem;
  quantity?: number;
  onClose: () => void;
}

function RecipeView({ menuItem, quantity = 1, onClose }: RecipeViewProps) {
  const { recipeItems, isLoading } = useRecipeByMenuItem(menuItem.item_id);
  const { availability } = useMenuItemAvailability(menuItem.item_id);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "text-green-600";
      case "low_stock":
        return "text-amber-600";
      case "insufficient":
      case "missing":
        return "text-red-600";
      default:
        return "text-stone-600";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "available":
        return <CheckCircle2 size={16} className="text-green-600" />;
      case "low_stock":
        return <AlertTriangle size={16} className="text-amber-600" />;
      case "insufficient":
      case "missing":
        return <AlertTriangle size={16} className="text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
              <ChefHat className="text-amber-600" size={24} />
              Recipe: {menuItem.name}
            </h2>
            <p className="text-sm text-stone-500 mt-1">
              {menuItem.category} • Quantity: {quantity}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-stone-100 transition-colors"
          >
            <X size={20} className="text-stone-400" />
          </button>
        </div>

        {/* Stock Availability Status */}
        {availability && (
          <div
            className={`mb-6 p-4 rounded-xl border-2 ${
              availability.can_make
                ? "bg-green-50 border-green-200"
                : "bg-red-50 border-red-200"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              {availability.can_make ? (
                <CheckCircle2 className="text-green-600" size={20} />
              ) : (
                <AlertTriangle className="text-red-600" size={20} />
              )}
              <span
                className={`font-bold ${
                  availability.can_make ? "text-green-800" : "text-red-800"
                }`}
              >
                {availability.can_make
                  ? "Can Make"
                  : "Cannot Make - Missing Ingredients"}
              </span>
            </div>
            {availability.missing_ingredients.length > 0 && (
              <div className="mt-2 text-sm text-red-700">
                <p className="font-semibold mb-1">Missing:</p>
                <ul className="list-disc list-inside space-y-1">
                  {availability.missing_ingredients.map((ing, idx) => (
                    <li key={idx}>
                      {ing.ingredient_name} - Need: {ing.required} {ing.unit},
                      Available: {ing.available} {ing.unit}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {availability.low_stock_ingredients.length > 0 &&
              availability.can_make && (
                <div className="mt-2 text-sm text-amber-700">
                  <p className="font-semibold mb-1">Low Stock:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {availability.low_stock_ingredients.map((ing, idx) => (
                      <li key={idx}>
                        {ing.ingredient_name} - Available: {ing.available}{" "}
                        {ing.unit} (Min: {ing.min_threshold} {ing.unit})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
          </div>
        )}

        {/* Recipe Ingredients */}
        {isLoading ? (
          <div className="text-center py-8 text-stone-400">
            Loading recipe...
          </div>
        ) : recipeItems.length === 0 ? (
          <div className="text-center py-8 text-stone-400 border-2 border-dashed border-stone-200 rounded-xl">
            <Package className="mx-auto mb-2 opacity-50" size={32} />
            <p>No recipe defined</p>
          </div>
        ) : (
          <div className="space-y-3">
            <h3 className="font-semibold text-stone-700 mb-3">
              Ingredients Required:
            </h3>
            {recipeItems.map((recipeItem, idx) => {
              const amountRequired = Number(recipeItem.amount_required);
              const totalRequired = amountRequired * quantity;
              const status =
                availability?.ingredients_status.find(
                  (s) => s.ingredient_id === recipeItem.ingredient_id
                )?.status || "unknown";

              return (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 bg-stone-50 rounded-xl border border-stone-200"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {getStatusIcon(status)}
                      <span className="font-semibold text-stone-800">
                        {recipeItem.ingredient.name}
                      </span>
                    </div>
                    <p className="text-sm text-stone-600">
                      {totalRequired.toFixed(2)} {recipeItem.unit} (
                      {amountRequired.toFixed(2)} {recipeItem.unit} × {quantity}
                      )
                    </p>
                    {availability && (
                      <p
                        className={`text-xs mt-1 font-medium ${getStatusColor(
                          status
                        )}`}
                      >
                        Available:{" "}
                        {availability.ingredients_status.find(
                          (s) => s.ingredient_id === recipeItem.ingredient_id
                        )?.available || 0}{" "}
                        {recipeItem.unit}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default RecipeView;
