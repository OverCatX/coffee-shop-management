"use client";

import React, { useState } from "react";
import { Package, Plus, X } from "lucide-react";
import { useRestockIngredient } from "@/lib/hooks/useStock";
import { useAuth } from "@/contexts/AuthContext";
import { IngredientInfo } from "@/lib/api/inventory";

interface RestockModalProps {
  ingredient: IngredientInfo;
  currentQuantity: number;
  minThreshold: number;
  onClose: () => void;
}

function RestockModal({
  ingredient,
  currentQuantity,
  minThreshold,
  onClose,
}: RestockModalProps) {
  const [quantity, setQuantity] = useState<string>("");
  const { restockIngredient } = useRestockIngredient();
  const { user } = useAuth();

  const handleRestock = async () => {
    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) {
      return;
    }

    try {
      await restockIngredient(ingredient.ingredient_id, qty, user?.emp_id);
      onClose();
    } catch (error) {
      console.error("Failed to restock:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
              <Package className="text-amber-600" size={24} />
              Restock Ingredient
            </h2>
            <p className="text-sm text-stone-500 mt-1">{ingredient.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-stone-100 transition-colors"
          >
            <X size={20} className="text-stone-400" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-stone-50 p-4 rounded-xl">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-stone-600">Current Stock:</span>
              <span className="font-semibold text-stone-800">
                {currentQuantity.toFixed(2)} {ingredient.unit}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-stone-600">Min Threshold:</span>
              <span className="font-semibold text-stone-800">
                {minThreshold.toFixed(2)} {ingredient.unit}
              </span>
            </div>
            {currentQuantity < minThreshold && (
              <div className="mt-2 text-xs text-red-600 font-medium">
                ⚠️ Low Stock Alert
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Quantity to Add ({ingredient.unit})
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Enter quantity"
              className="w-full px-4 py-2 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-200 text-stone-800"
            />
          </div>

          {quantity &&
            !isNaN(parseFloat(quantity)) &&
            parseFloat(quantity) > 0 && (
              <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                <div className="flex justify-between">
                  <span className="text-sm text-green-700">New Stock:</span>
                  <span className="font-bold text-green-800">
                    {(currentQuantity + parseFloat(quantity)).toFixed(2)}{" "}
                    {ingredient.unit}
                  </span>
                </div>
              </div>
            )}
        </div>

        <div className="flex gap-4 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-stone-200 rounded-xl font-medium hover:bg-stone-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleRestock}
            disabled={
              !quantity ||
              isNaN(parseFloat(quantity)) ||
              parseFloat(quantity) <= 0
            }
            className="flex-1 px-4 py-2 bg-stone-900 text-white rounded-xl font-medium hover:bg-stone-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Plus size={18} />
            Restock
          </button>
        </div>
      </div>
    </div>
  );
}

export default RestockModal;
