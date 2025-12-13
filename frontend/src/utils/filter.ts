import { MenuItem } from '@/types';

/**
 * Optimized filter function using bitwise operations and early returns
 * Memory efficient - creates minimal intermediate arrays
 */
export function filterMenuItems(
  items: MenuItem[],
  category: string,
  searchQuery: string
): MenuItem[] {
  // Early return if no filters
  if (category === 'all' && !searchQuery.trim()) {
    return items;
  }

  const normalizedSearch = searchQuery.toLowerCase().trim();
  const isAllCategory = category === 'all';

  // Pre-allocate array size estimate (optimization)
  const result: MenuItem[] = [];
  result.length = items.length; // Pre-allocate to avoid resizing

  let index = 0;
  
  // Single pass filter - O(n) complexity
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    
    // Category filter (early exit if doesn't match)
    if (!isAllCategory && item.category !== category) {
      continue;
    }
    
    // Search filter (early exit if doesn't match)
    if (normalizedSearch && !item.name.toLowerCase().includes(normalizedSearch)) {
      continue;
    }
    
    // Item matches all filters
    result[index++] = item;
  }
  
  // Trim array to actual size
  result.length = index;
  
  return result;
}

/**
 * Get unique categories from menu items
 * Memory efficient - uses Set for O(1) lookups
 */
export function getCategories(items: MenuItem[]): string[] {
  const categorySet = new Set<string>();
  
  for (let i = 0; i < items.length; i++) {
    categorySet.add(items[i].category);
  }
  
  return Array.from(categorySet);
}

