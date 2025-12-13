import { Employee, EmployeeCreate, EmployeeUpdate } from '@/lib/api/employees';
import { mockEmployees as initialEmployees } from './data';

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let employees = [...initialEmployees];
let nextId = Math.max(...initialEmployees.map((emp) => emp.emp_id)) + 1;

export const mockEmployeesApi = {
  getAll: async (skip: number = 0, limit: number = 1000): Promise<Employee[]> => {
    await delay(300);
    const filtered = employees.filter((emp) => !emp.is_deleted);
    return filtered.slice(skip, skip + limit);
  },

  getById: async (id: number): Promise<Employee> => {
    await delay(200);
    const employee = employees.find((emp) => emp.emp_id === id && !emp.is_deleted);
    if (!employee) {
      throw new Error(`Employee with id ${id} not found`);
    }
    return employee;
  },

  getByRole: async (role: string): Promise<Employee[]> => {
    await delay(200);
    return employees.filter((emp) => emp.role === role && !emp.is_deleted);
  },

  create: async (employee: EmployeeCreate): Promise<Employee> => {
    await delay(400);
    const now = new Date().toISOString();
    const newEmployee: Employee = {
      emp_id: nextId++,
      name: employee.name,
      role: employee.role,
      salary: employee.salary,
      email: employee.email,
      phone: employee.phone,
      hire_date: employee.hire_date,
      created_at: now,
      updated_at: now,
      is_deleted: false,
    };
    employees.push(newEmployee);
    return newEmployee;
  },

  update: async (id: number, employee: EmployeeUpdate): Promise<Employee> => {
    await delay(400);
    const index = employees.findIndex((emp) => emp.emp_id === id && !emp.is_deleted);
    if (index === -1) {
      throw new Error(`Employee with id ${id} not found`);
    }
    const existingEmployee = employees[index]!;
    const updatedEmployee: Employee = {
      emp_id: existingEmployee.emp_id,
      name: employee.name ?? existingEmployee.name,
      role: employee.role ?? existingEmployee.role,
      salary: employee.salary ?? existingEmployee.salary,
      email: employee.email ?? existingEmployee.email,
      phone: employee.phone ?? existingEmployee.phone,
      hire_date: existingEmployee.hire_date,
      created_at: existingEmployee.created_at,
      updated_at: new Date().toISOString(),
      is_deleted: existingEmployee.is_deleted,
    };
    employees[index] = updatedEmployee;
    return updatedEmployee;
  },

  delete: async (id: number): Promise<void> => {
    await delay(300);
    const index = employees.findIndex((emp) => emp.emp_id === id && !emp.is_deleted);
    if (index === -1) {
      throw new Error(`Employee with id ${id} not found`);
    }
    const employee = employees[index]!;
    employee.is_deleted = true;
    employee.updated_at = new Date().toISOString();
  },

  createManager: async (empId: number): Promise<Employee> => {
    await delay(400);
    const index = employees.findIndex((emp) => emp.emp_id === empId && !emp.is_deleted);
    if (index === -1) {
      throw new Error(`Employee with id ${empId} not found`);
    }
    const employee = employees[index]!;
    employee.role = 'Manager';
    employee.updated_at = new Date().toISOString();
    return employee;
  },

  createBarista: async (empId: number): Promise<Employee> => {
    await delay(400);
    const index = employees.findIndex((emp) => emp.emp_id === empId && !emp.is_deleted);
    if (index === -1) {
      throw new Error(`Employee with id ${empId} not found`);
    }
    const employee = employees[index]!;
    employee.role = 'Barista';
    employee.updated_at = new Date().toISOString();
    return employee;
  },
};

