/**
 * Pagination utilities - optimized for performance and memory efficiency
 */

/**
 * Calculate pagination metadata (memoized-friendly)
 * Uses efficient calculations to avoid unnecessary computations
 */
export function getPaginationMeta(
  currentPage: number,
  itemsPerPage: number,
  totalItems: number
) {
  // Early return for empty data
  if (totalItems === 0) {
    return {
      currentPage: 1,
      totalPages: 0,
      itemsPerPage,
      totalItems: 0,
      startIndex: 0,
      endIndex: 0,
      hasNext: false,
      hasPrev: false,
    };
  }

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  
  return {
    currentPage,
    totalPages,
    itemsPerPage,
    totalItems,
    startIndex,
    endIndex,
    hasNext: currentPage < totalPages,
    hasPrev: currentPage > 1,
  };
}

/**
 * Slice array for pagination (memory efficient)
 * Uses native slice which is highly optimized in JS engines
 * Only creates a shallow copy of the slice, not the entire array
 */
export function paginateArray<T>(
  array: T[],
  page: number,
  itemsPerPage: number
): T[] {
  // Early return for empty array
  if (array.length === 0) {
    return [];
  }

  // Validate page number
  const validPage = Math.max(1, Math.min(page, Math.ceil(array.length / itemsPerPage)));
  const start = (validPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  
  // Use native slice - it's already optimized by JS engines
  return array.slice(start, end);
}

