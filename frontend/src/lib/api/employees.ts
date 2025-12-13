import apiClient from './client';

export interface Employee {
  emp_id: number;
  name: string;
  role: string;
  salary: number;
  email?: string;
  phone?: string;
  hire_date: string;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}

export interface EmployeeCreate {
  name: string;
  role: string;
  salary: number;
  email?: string;
  phone?: string;
  hire_date: string;
}

export interface EmployeeUpdate {
  name?: string;
  role?: string;
  salary?: number;
  email?: string;
  phone?: string;
}

const employeesApi = {
  getAll: async (skip: number = 0, limit: number = 1000): Promise<Employee[]> => {
    const { data } = await apiClient.get<Employee[]>('/employees', {
      params: { skip, limit },
    });
    return data;
  },

  getById: async (id: number): Promise<Employee> => {
    const { data } = await apiClient.get<Employee>(`/employees/${id}`);
    return data;
  },

  getByRole: async (role: string): Promise<Employee[]> => {
    const { data } = await apiClient.get<Employee[]>(`/employees/role/${role}`, {
      params: { limit: 1000 },
    });
    return data;
  },

  create: async (employee: EmployeeCreate): Promise<Employee> => {
    const { data } = await apiClient.post<Employee>('/employees', employee);
    return data;
  },

  update: async (id: number, employee: EmployeeUpdate): Promise<Employee> => {
    const { data } = await apiClient.put<Employee>(`/employees/${id}`, employee);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/employees/${id}`);
  },

  createManager: async (empId: number): Promise<Employee> => {
    const { data } = await apiClient.post<Employee>(`/employees/${empId}/manager`);
    return data;
  },

  createBarista: async (empId: number): Promise<Employee> => {
    const { data } = await apiClient.post<Employee>(`/employees/${empId}/barista`);
    return data;
  },
};

export { employeesApi };

