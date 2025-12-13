import useSWR from 'swr';
import { useCallback } from 'react';
import { employeesApi, Employee, EmployeeCreate, EmployeeUpdate } from '@/lib/api/employees';
import { mutate } from 'swr';

export const useEmployees = () => {
  const { data, error, isLoading, mutate: mutateEmployees } = useSWR<Employee[]>(
    'employees',
    () => employeesApi.getAll(),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    employees: data || [],
    isLoading,
    isError: error,
    mutate: mutateEmployees,
  };
};

export const useEmployeesByRole = (role: string) => {
  const { data, error, isLoading } = useSWR<Employee[]>(
    role ? ['employees', 'role', role] : null,
    () => employeesApi.getByRole(role),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    employees: data || [],
    isLoading,
    isError: error,
  };
};

export const useCreateEmployee = () => {
  const createEmployee = useCallback(async (employee: EmployeeCreate): Promise<Employee> => {
    const newEmployee = await employeesApi.create(employee);
    mutate('employees');
    return newEmployee;
  }, []);

  return { createEmployee };
};

export const useUpdateEmployee = () => {
  const updateEmployee = useCallback(
    async (id: number, employee: EmployeeUpdate): Promise<Employee> => {
      const updated = await employeesApi.update(id, employee);
      mutate('employees');
      return updated;
    },
    []
  );

  return { updateEmployee };
};

export const useDeleteEmployee = () => {
  const deleteEmployee = useCallback(async (id: number): Promise<void> => {
    await employeesApi.delete(id);
    mutate('employees');
  }, []);

  return { deleteEmployee };
};

