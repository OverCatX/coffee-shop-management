import { Customer } from '@/lib/api/customers';

export interface CustomerFilters {
  search: string;
  minLoyaltyPoints?: number;
  maxLoyaltyPoints?: number;
  hasEmail: boolean | null; // null = all, true = has email, false = no email
  hasPhone: boolean | null; // null = all, true = has phone, false = no phone
}

/**
 * Optimized filter function for customers
 * Uses single-pass algorithm with early exits
 */
export function filterCustomers(
  customers: Customer[],
  filters: CustomerFilters
): Customer[] {
  // Early return if no filters
  if (
    !filters.search.trim() &&
    filters.minLoyaltyPoints === undefined &&
    filters.maxLoyaltyPoints === undefined &&
    filters.hasEmail === null &&
    filters.hasPhone === null
  ) {
    return customers;
  }

  const normalizedSearch = filters.search.toLowerCase().trim();
  const hasSearch = normalizedSearch.length > 0;

  // Pre-allocate array
  const result: Customer[] = [];
  result.length = customers.length;

  let index = 0;

  // Single-pass filter
  for (let i = 0; i < customers.length; i++) {
    const customer = customers[i];

    // Search filter (name, email, phone)
    if (hasSearch) {
      const matchesName = customer.name.toLowerCase().includes(normalizedSearch);
      const matchesEmail = customer.email?.toLowerCase().includes(normalizedSearch) || false;
      const matchesPhone = customer.phone?.includes(normalizedSearch) || false;
      
      if (!matchesName && !matchesEmail && !matchesPhone) {
        continue;
      }
    }

    // Loyalty points filter
    const points = Number(customer.loyalty_points);
    if (filters.minLoyaltyPoints !== undefined && points < filters.minLoyaltyPoints) {
      continue;
    }
    if (filters.maxLoyaltyPoints !== undefined && points > filters.maxLoyaltyPoints) {
      continue;
    }

    // Email filter
    if (filters.hasEmail !== null) {
      const hasEmail = !!customer.email;
      if (filters.hasEmail !== hasEmail) {
        continue;
      }
    }

    // Phone filter
    if (filters.hasPhone !== null) {
      const hasPhone = !!customer.phone;
      if (filters.hasPhone !== hasPhone) {
        continue;
      }
    }

    // All filters passed
    result[index++] = customer;
  }

  // Trim array
  result.length = index;

  return result;
}

