"use client";

import { useState, useCallback } from "react";
import { UserCircle, Plus, Edit2, Trash2, Search } from "lucide-react";
import {
  useCustomers,
  useSearchCustomers,
  useCreateCustomer,
  useUpdateCustomer,
  useDeleteCustomer,
} from "@/lib/hooks/useCustomers";
import { Customer, CustomerCreate, CustomerUpdate } from "@/lib/api/customers";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

function CustomersPageContent() {
  const { customers, isLoading } = useCustomers();
  const { customers: searchResults, search } = useSearchCustomers();
  const { createCustomer } = useCreateCustomer();
  const { updateCustomer } = useUpdateCustomer();
  const { deleteCustomer } = useDeleteCustomer();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState<CustomerCreate>({
    name: "",
    phone: "",
    email: "",
    loyalty_points: 0,
  });

  const displayCustomers = searchQuery ? searchResults : customers;

  const handleSearch = useCallback(
    (q: string) => {
      setSearchQuery(q);
      if (q) {
        search(q);
      }
    },
    [search]
  );

  const handleCreate = useCallback(async () => {
    try {
      await createCustomer(formData);
      setIsModalOpen(false);
      setFormData({ name: "", phone: "", email: "", loyalty_points: 0 });
    } catch (error) {
      console.error("Failed to create customer:", error);
      alert("Failed to create customer");
    }
  }, [formData, createCustomer]);

  const handleUpdate = useCallback(async () => {
    if (!editingCustomer) return;
    try {
      const updateData: CustomerUpdate = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        loyalty_points: formData.loyalty_points,
      };
      await updateCustomer(editingCustomer.customer_id, updateData);
      setIsModalOpen(false);
      setEditingCustomer(null);
    } catch (error) {
      console.error("Failed to update customer:", error);
      alert("Failed to update customer");
    }
  }, [editingCustomer, formData, updateCustomer]);

  const handleDelete = useCallback(
    async (id: number) => {
      if (!confirm("Are you sure you want to delete this customer?")) return;
      try {
        await deleteCustomer(id);
      } catch (error) {
        console.error("Failed to delete customer:", error);
        alert("Failed to delete customer");
      }
    },
    [deleteCustomer]
  );

  const openEditModal = useCallback((customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      phone: customer.phone || "",
      email: customer.email || "",
      loyalty_points: Number(customer.loyalty_points),
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
                <UserCircle className="text-amber-600" size={28} />
                Customer Management
              </h1>
              <p className="text-stone-500 mt-2 text-sm sm:text-base">
                Manage customer information and loyalty points
              </p>
            </div>
            <button
              onClick={() => {
                setEditingCustomer(null);
                setFormData({
                  name: "",
                  phone: "",
                  email: "",
                  loyalty_points: 0,
                });
                setIsModalOpen(true);
              }}
              className="bg-stone-900 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-stone-800 transition-colors text-sm sm:text-base"
            >
              <Plus size={20} />
              <span className="whitespace-nowrap">Add Customer</span>
            </button>
          </div>
        </header>

        {/* Search */}
        <div className="mb-4 sm:mb-6">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search customers..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 sm:py-3 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-200"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-stone-400">Loading customers...</div>
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
                        Phone
                      </th>
                      <th className="px-4 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold text-stone-700">
                        Email
                      </th>
                      <th className="px-4 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold text-stone-700">
                        Loyalty Points
                      </th>
                      <th className="px-4 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold text-stone-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayCustomers.map((customer) => (
                      <tr
                        key={customer.customer_id}
                        className="border-b border-stone-100 hover:bg-stone-50"
                      >
                        <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm font-medium text-stone-800">
                          #{customer.customer_id}
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm text-stone-600">
                          {customer.name}
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm text-stone-600">
                          {customer.phone || "-"}
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm text-stone-600">
                          {customer.email || "-"}
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm text-stone-600">
                          {Number(customer.loyalty_points).toFixed(0)}
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => openEditModal(customer)}
                              className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 transition-colors"
                            >
                              <Edit2 size={16} className="text-blue-600" />
                            </button>
                            <button
                              onClick={() => handleDelete(customer.customer_id)}
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
              {displayCustomers.map((customer) => (
                <div
                  key={customer.customer_id}
                  className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-stone-800 text-base">
                        {customer.name}
                      </h3>
                      <p className="text-xs text-stone-500">ID: #{customer.customer_id}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(customer)}
                        className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 transition-colors"
                      >
                        <Edit2 size={16} className="text-blue-600" />
                      </button>
                      <button
                        onClick={() => handleDelete(customer.customer_id)}
                        className="p-2 rounded-lg bg-red-100 hover:bg-red-200 transition-colors"
                      >
                        <Trash2 size={16} className="text-red-600" />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-stone-500">Phone:</span>
                      <span className="text-stone-800">{customer.phone || "-"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Email:</span>
                      <span className="text-stone-800">{customer.email || "-"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Loyalty Points:</span>
                      <span className="text-stone-800 font-bold">
                        {Number(customer.loyalty_points).toFixed(0)}
                      </span>
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
                {editingCustomer ? "Edit Customer" : "Add Customer"}
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
                    Loyalty Points
                  </label>
                  <input
                    type="number"
                    value={formData.loyalty_points || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        loyalty_points: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-4 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-200"
                  />
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingCustomer(null);
                  }}
                  className="flex-1 px-4 py-2 border border-stone-200 rounded-xl font-medium hover:bg-stone-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={editingCustomer ? handleUpdate : handleCreate}
                  className="flex-1 px-4 py-2 bg-stone-900 text-white rounded-xl font-medium hover:bg-stone-800 transition-colors"
                >
                  {editingCustomer ? "Update" : "Create"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CustomersPage() {
  return (
    <ProtectedRoute allowedRoles={['Manager', 'Cashier']}>
      <CustomersPageContent />
    </ProtectedRoute>
  );
}
