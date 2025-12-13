import useSWR from 'swr';
import { useCallback } from 'react';
import { employeesApi, Employee, EmployeeCreate, EmployeeUpdate } from '@/lib/api/employees';
import { mutate } from 'swr';
import { showToast } from '@/utils/toast';

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
    try {
      const newEmployee = await showToast.promise(
        employeesApi.create(employee),
        {
          loading: 'Creating employee...',
          success: `Employee "${employee.name}" created successfully!`,
          error: 'Failed to create employee',
        }
      );
      mutate('employees');
      return newEmployee;
    } catch (error) {
      throw error;
    }
  }, []);

  return { createEmployee };
};

export const useUpdateEmployee = () => {
  const updateEmployee = useCallback(
    async (id: number, employee: EmployeeUpdate): Promise<Employee> => {
      try {
        const updated = await showToast.promise(
          employeesApi.update(id, employee),
          {
            loading: 'Updating employee...',
            success: 'Employee updated successfully!',
            error: 'Failed to update employee',
          }
        );
        mutate('employees');
        return updated;
      } catch (error) {
        throw error;
      }
    },
    []
  );

  return { updateEmployee };
};

export const useDeleteEmployee = () => {
  const deleteEmployee = useCallback(async (id: number): Promise<void> => {
    try {
      await showToast.promise(
        employeesApi.delete(id),
        {
          loading: 'Deleting employee...',
          success: 'Employee deleted successfully!',
          error: 'Failed to delete employee',
        }
      );
      mutate('employees');
    } catch (error) {
      throw error;
    }
  }, []);

  return { deleteEmployee };
};

