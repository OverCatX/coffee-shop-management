import useSWR from 'swr';
import { useCallback, useState } from 'react';
import { customersApi, Customer, CustomerCreate, CustomerUpdate } from '@/lib/api/customers';
import { mutate } from 'swr';

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
    const newCustomer = await customersApi.create(customer);
    mutate('customers');
    return newCustomer;
  }, []);

  return { createCustomer };
};

export const useUpdateCustomer = () => {
  const updateCustomer = useCallback(
    async (id: number, customer: CustomerUpdate): Promise<Customer> => {
      const updated = await customersApi.update(id, customer);
      mutate('customers');
      return updated;
    },
    []
  );

  return { updateCustomer };
};

export const useDeleteCustomer = () => {
  const deleteCustomer = useCallback(async (id: number): Promise<void> => {
    await customersApi.delete(id);
    mutate('customers');
  }, []);

  return { deleteCustomer };
};

