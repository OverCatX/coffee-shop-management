import useSWR from 'swr';
import { useCallback, useState, useMemo } from 'react';
import { customersApi, Customer, CustomerCreate, CustomerUpdate } from '@/lib/api/customers';
import { mutate } from 'swr';
import { showToast } from '@/utils/toast';

export const useCustomers = (page: number = 1, limit: number = 20) => {
  const skip = (page - 1) * limit;
  
  const { data, error, isLoading, mutate: mutateCustomers } = useSWR<Customer[]>(
    ['customers', skip, limit],
    () => customersApi.getAll(skip, limit),
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  );

  return {
    customers: data || [],
    isLoading,
    isError: error,
    mutate: mutateCustomers,
  };
};

// Hook for getting all customers (for filtering)
export const useAllCustomers = () => {
  const { data, error, isLoading } = useSWR<Customer[]>(
    'customers-all',
    () => customersApi.getAll(0, 10000), // Get all for client-side filtering
    {
      revalidateOnFocus: false,
      dedupingInterval: 10000, // Cache longer
    }
  );

  return {
    customers: data || [],
    isLoading,
    isError: error,
  };
};

export const useSearchCustomers = () => {
  const [query, setQuery] = useState<string>('');
  
  const { data, error, isLoading } = useSWR<Customer[]>(
    query ? ['customers', 'search', query] : null,
    () => customersApi.search(query),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    customers: data || [],
    isLoading,
    isError: error,
    search: setQuery,
    query,
  };
};

export const useCreateCustomer = () => {
  const createCustomer = useCallback(async (customer: CustomerCreate): Promise<Customer> => {
    try {
      const newCustomer = await showToast.promise(
        customersApi.create(customer),
        {
          loading: 'Creating customer...',
          success: `Customer "${customer.name}" created successfully!`,
          error: 'Failed to create customer',
        }
      );
      // Mutate all customer-related cache keys
      mutate('customers-all', undefined, { revalidate: true });
      mutate((key) => typeof key === 'string' && key.startsWith('customers'), undefined, { revalidate: true });
      return newCustomer;
    } catch (error) {
      throw error;
    }
  }, []);

  return { createCustomer };
};

export const useUpdateCustomer = () => {
  const updateCustomer = useCallback(
    async (id: number, customer: CustomerUpdate): Promise<Customer> => {
      try {
        const updated = await showToast.promise(
          customersApi.update(id, customer),
          {
            loading: 'Updating customer...',
            success: 'Customer updated successfully!',
            error: 'Failed to update customer',
          }
        );
        // Mutate all customer-related cache keys
        mutate('customers-all', undefined, { revalidate: true });
        mutate((key) => typeof key === 'string' && key.startsWith('customers'), undefined, { revalidate: true });
        return updated;
      } catch (error) {
        throw error;
      }
    },
    []
  );

  return { updateCustomer };
};

export const useDeleteCustomer = () => {
  const deleteCustomer = useCallback(async (id: number): Promise<void> => {
    try {
      await showToast.promise(
        customersApi.delete(id),
        {
          loading: 'Deleting customer...',
          success: 'Customer deleted successfully!',
          error: 'Failed to delete customer',
        }
      );
      // Mutate all customer-related cache keys
      mutate('customers-all', undefined, { revalidate: true });
      mutate((key) => typeof key === 'string' && key.startsWith('customers'), undefined, { revalidate: true });
    } catch (error) {
      throw error;
    }
  }, []);

  return { deleteCustomer };
};

