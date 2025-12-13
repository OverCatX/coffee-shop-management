"use client";

import { useState, useCallback } from "react";
import { Users, Plus, Edit2, Trash2 } from "lucide-react";
import {
  useEmployees,
  useCreateEmployee,
  useUpdateEmployee,
  useDeleteEmployee,
} from "@/lib/hooks/useEmployees";
import { Employee, EmployeeCreate, EmployeeUpdate } from "@/lib/api/employees";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

function EmployeesPageContent() {
  const { employees, isLoading } = useEmployees();
  const { createEmployee } = useCreateEmployee();
  const { updateEmployee } = useUpdateEmployee();
  const { deleteEmployee } = useDeleteEmployee();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState<EmployeeCreate>({
    name: "",
    role: "Barista",
    salary: 0,
    email: "",
    phone: "",
    hire_date: new Date().toISOString().split("T")[0] || "",
  });

  const handleCreate = useCallback(async () => {
    try {
      await createEmployee(formData);
      setIsModalOpen(false);
      setFormData({
        name: "",
        role: "Barista",
        salary: 0,
        email: "",
        phone: "",
        hire_date: new Date().toISOString().split("T")[0] || "",
      });
    } catch (error) {
      console.error("Failed to create employee:", error);
      alert("Failed to create employee");
    }
  }, [formData, createEmployee]);

  const handleUpdate = useCallback(async () => {
    if (!editingEmployee) return;
    try {
      const updateData: EmployeeUpdate = {
        name: formData.name,
        role: formData.role,
        salary: formData.salary,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
      };
      await updateEmployee(editingEmployee.emp_id, updateData);
      setIsModalOpen(false);
      setEditingEmployee(null);
    } catch (error) {
      console.error("Failed to update employee:", error);
      alert("Failed to update employee");
    }
  }, [editingEmployee, formData, updateEmployee]);

  const handleDelete = useCallback(
    async (id: number) => {
      if (!confirm("Are you sure you want to delete this employee?")) return;
      try {
        await deleteEmployee(id);
      } catch (error) {
        console.error("Failed to delete employee:", error);
        alert("Failed to delete employee");
      }
    },
    [deleteEmployee]
  );

  const openEditModal = useCallback((employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      name: employee.name,
      role: employee.role,
      salary: Number(employee.salary),
      email: employee.email || "",
      phone: employee.phone || "",
      hire_date:
        employee.hire_date || new Date().toISOString().split("T")[0] || "",
    });
    setIsModalOpen(true);
  }, []);

  return (
    <div className="flex h-screen bg-stone-50 lg:pl-0 overflow-hidden">
      <div className="w-full p-4 sm:p-6 lg:p-8 flex flex-col overflow-hidden">
        <header className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-stone-800 flex items-center gap-2 sm:gap-3">
                <Users className="text-amber-600" size={28} />
                Employee Management
              </h1>
              <p className="text-stone-500 mt-2 text-sm sm:text-base">
                Manage staff and employee information
              </p>
            </div>
            <button
              onClick={() => {
                setEditingEmployee(null);
                setFormData({
                  name: "",
                  role: "Barista",
                  salary: 0,
                  email: "",
                  phone: "",
                  hire_date: new Date().toISOString().split("T")[0] || "",
                });
                setIsModalOpen(true);
              }}
              className="bg-stone-900 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-stone-800 transition-colors text-sm sm:text-base"
            >
              <Plus size={20} />
              <span className="whitespace-nowrap">Add Employee</span>
            </button>
          </div>
        </header>

        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-stone-400">Loading employees...</div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {/* Desktop Table */}
            <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-stone-50 border-b border-stone-200">
                    <tr>
                      <th className="px-4 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold text-stone-700">
                        ID
                      </th>
                      <th className="px-4 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold text-stone-700">
                        Name
                      </th>
                      <th className="px-4 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold text-stone-700">
                        Role
                      </th>
                      <th className="px-4 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold text-stone-700">
                        Salary
                      </th>
                      <th className="px-4 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold text-stone-700">
                        Email
                      </th>
                      <th className="px-4 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold text-stone-700">
                        Phone
                      </th>
                      <th className="px-4 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold text-stone-700">
                        Hire Date
                      </th>
                      <th className="px-4 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold text-stone-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((employee) => (
                      <tr
                        key={employee.emp_id}
                        className="border-b border-stone-100 hover:bg-stone-50"
                      >
                        <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm font-medium text-stone-800">
                          #{employee.emp_id}
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm text-stone-600">
                          {employee.name}
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm text-stone-600">
                          {employee.role}
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm text-stone-600">
                          ฿{Number(employee.salary).toFixed(2)}
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm text-stone-600">
                          {employee.email || "-"}
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm text-stone-600">
                          {employee.phone || "-"}
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm text-stone-600">
                          {employee.hire_date}
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => openEditModal(employee)}
                              className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 transition-colors"
                            >
                              <Edit2 size={16} className="text-blue-600" />
                            </button>
                            <button
                              onClick={() => handleDelete(employee.emp_id)}
                              className="p-2 rounded-lg bg-red-100 hover:bg-red-200 transition-colors"
                            >
                              <Trash2 size={16} className="text-red-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
              {employees.map((employee) => (
                <div
                  key={employee.emp_id}
                  className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-stone-800 text-base">
                        {employee.name}
                      </h3>
                      <p className="text-xs text-stone-500">ID: #{employee.emp_id}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(employee)}
                        className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 transition-colors"
                      >
                        <Edit2 size={16} className="text-blue-600" />
                      </button>
                      <button
                        onClick={() => handleDelete(employee.emp_id)}
                        className="p-2 rounded-lg bg-red-100 hover:bg-red-200 transition-colors"
                      >
                        <Trash2 size={16} className="text-red-600" />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-stone-500">Role:</span>
                      <span className="text-stone-800 font-medium">{employee.role}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Salary:</span>
                      <span className="text-stone-800 font-medium">
                        ฿{Number(employee.salary).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Email:</span>
                      <span className="text-stone-800">{employee.email || "-"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Phone:</span>
                      <span className="text-stone-800">{employee.phone || "-"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Hire Date:</span>
                      <span className="text-stone-800">{employee.hire_date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl sm:text-2xl font-bold text-stone-800 mb-6">
                {editingEmployee ? "Edit Employee" : "Add Employee"}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-200"
                  >
                    <option value="Barista">Barista</option>
                    <option value="Manager">Manager</option>
                    <option value="Cashier">Cashier</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    Salary
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.salary || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        salary: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-4 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-200"
                  />
                </div>
                {!editingEmployee && (
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">
                      Hire Date
                    </label>
                    <input
                      type="date"
                      value={formData.hire_date}
                      onChange={(e) =>
                        setFormData({ ...formData, hire_date: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-200"
                    />
                  </div>
                )}
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingEmployee(null);
                  }}
                  className="flex-1 px-4 py-2 border border-stone-200 rounded-xl font-medium hover:bg-stone-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={editingEmployee ? handleUpdate : handleCreate}
                  className="flex-1 px-4 py-2 bg-stone-900 text-white rounded-xl font-medium hover:bg-stone-800 transition-colors"
                >
                  {editingEmployee ? "Update" : "Create"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function EmployeesPage() {
  return (
    <ProtectedRoute allowedRoles={['Manager']}>
      <EmployeesPageContent />
    </ProtectedRoute>
  );
}
