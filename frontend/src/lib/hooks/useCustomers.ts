import useSWR from 'swr';
import { useCallback, useState } from 'react';
import { customersApi, Customer, CustomerCreate, CustomerUpdate } from '@/lib/api/customers';
import { mutate } from 'swr';
import { showToast } from '@/utils/toast';

export const useCustomers = () => {
  const { data, error, isLoading, mutate: mutateCustomers } = useSWR<Customer[]>(
    'customers',
    () => customersApi.getAll(),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    customers: data || [],
    isLoading,
    isError: error,
    mutate: mutateCustomers,
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
      mutate('customers');
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
        mutate('customers');
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
      mutate('customers');
    } catch (error) {
      throw error;
    }
  }, []);

  return { deleteCustomer };
};

