
import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import DataTable from '../../components/base/DataTable';
import Button from '../../components/base/Button';
import Modal from '../../components/base/Modal';
import SchemaForm from '../../components/base/SchemaForm';
import ConfirmDialog from '../../components/base/ConfirmDialog';
import Input from '../../components/base/Input';
import { useToast } from '../../components/base/Toast';
import { mockStaff } from '../../mocks/staff';

export default function StaffPage() {
  const { user } = useAuthStore();
  const { showToast, ToastContainer } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<any>(null);
  const [deletingStaff, setDeletingStaff] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [staff, setStaff] = useState(mockStaff);

  // Filter data
  const filteredData = staff.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || item.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const moduleOptions = [
    { value: 'users', label: 'User Management' },
    { value: 'products', label: 'Product Management' },
    { value: 'amcs', label: 'AMC Management' },
    { value: 'wallet', label: 'Wallet Management' },
    { value: 'claims', label: 'Claims Management' },
    { value: 'reports', label: 'Reports & Analytics' },
    { value: 'settings', label: 'Settings' }
  ];

  const staffFields = [
    { name: 'name', label: 'Staff Name', type: 'text' as const, required: true },
    { name: 'email', label: 'Email', type: 'email' as const, required: true },
    { name: 'password', label: 'Password', type: 'password' as const, required: !editingStaff },
    { name: 'role', label: 'Role', type: 'select' as const, required: true, options: [
      { value: 'support', label: 'Support' },
      { value: 'accounts', label: 'Accounts' },
      { value: 'supervisor', label: 'Supervisor' },
      { value: 'manager', label: 'Manager' }
    ]},
    { name: 'status', label: 'Status', type: 'select' as const, required: true, options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' }
    ]}
  ];

  const columns = [
    { key: 'name', title: 'Staff Name', sortable: true },
    { key: 'email', title: 'Email', sortable: true },
    { key: 'role', title: 'Role', render: (value: string) => (
      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
        {value.charAt(0).toUpperCase() + value.slice(1)}
      </span>
    )},
    { key: 'assignedModules', title: 'Assigned Modules', render: (value: string[]) => (
      <div className="flex flex-wrap gap-1">
        {value.slice(0, 2).map(module => (
          <span key={module} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
            {moduleOptions.find(m => m.value === module)?.label || module}
          </span>
        ))}
        {value.length > 2 && (
          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
            +{value.length - 2} more
          </span>
        )}
      </div>
    )},
    { key: 'status', title: 'Status', render: (value: string) => (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        value === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        {value.charAt(0).toUpperCase() + value.slice(1)}
      </span>
    )},
    { key: 'createdDate', title: 'Created Date', sortable: true }
  ];

  const handleAdd = () => {
    setEditingStaff(null);
    setIsModalOpen(true);
  };

  const handleEdit = (staffMember: any) => {
    // Remove password from editing data for security
    const { password, ...staffWithoutPassword } = staffMember;
    setEditingStaff(staffWithoutPassword);
    setIsModalOpen(true);
  };

  const handleDelete = (staffMember: any) => {
    setDeletingStaff(staffMember);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = async (formData: any) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (editingStaff) {
        setStaff(prev => prev.map(s => s.id === editingStaff.id ? { ...s, ...formData } : s));
        showToast('Staff member updated successfully', 'success');
      } else {
        const newStaff = {
          id: Date.now().toString(),
          ...formData,
          assignedModules: ['users', 'amcs'], // Default modules
          permissions: {
            users: { read: true, write: false, edit: false, delete: false },
            amcs: { read: true, write: true, edit: false, delete: false }
          },
          createdDate: new Date().toISOString().split('T')[0],
          lastLogin: null
        };
        setStaff(prev => [...prev, newStaff]);
        showToast('Staff member added successfully', 'success');
      }

      setIsModalOpen(false);
    } catch (error) {
      showToast('Operation failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStaff(prev => prev.filter(s => s.id !== deletingStaff.id));
      showToast('Staff member deleted successfully', 'success');
      setIsDeleteDialogOpen(false);
      setDeletingStaff(null);
    } catch (error) {
      showToast('Delete failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const renderActions = (record: any) => (
    <div className="flex space-x-2">
      <Button
        size="sm"
        variant="ghost"
        onClick={() => handleEdit(record)}
        title="Edit"
      >
        <i className="ri-edit-line w-4 h-4 flex items-center justify-center"></i>
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => handleDelete(record)}
        title="Delete"
      >
        <i className="ri-delete-bin-line w-4 h-4 flex items-center justify-center text-red-600"></i>
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => {/* Open permissions modal */}}
        title="Manage Permissions"
      >
        <i className="ri-shield-user-line w-4 h-4 flex items-center justify-center text-blue-600"></i>
      </Button>
    </div>
  );

  if (user?.role !== 'admin') {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <i className="ri-lock-line text-4xl text-gray-400 mb-4 w-16 h-16 flex items-center justify-center mx-auto"></i>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <ToastContainer />
      
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
        <Button onClick={handleAdd}>
          <i className="ri-add-line mr-2 w-4 h-4 flex items-center justify-center"></i>
          Add Staff Member
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <i className="ri-team-line text-blue-600 w-6 h-6 flex items-center justify-center"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Staff</p>
              <p className="text-2xl font-semibold text-gray-900">{staff.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <i className="ri-user-check-line text-green-600 w-6 h-6 flex items-center justify-center"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-semibold text-gray-900">{staff.filter(s => s.status === 'active').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <i className="ri-user-settings-line text-yellow-600 w-6 h-6 flex items-center justify-center"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Supervisors</p>
              <p className="text-2xl font-semibold text-gray-900">{staff.filter(s => s.role === 'supervisor').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <i className="ri-customer-service-line text-purple-600 w-6 h-6 flex items-center justify-center"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Support</p>
              <p className="text-2xl font-semibold text-gray-900">{staff.filter(s => s.role === 'support').length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon="ri-search-line"
          />
        </div>
        <div className="w-full sm:w-48">
          <div className="relative">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 pr-8"
            >
              <option value="all">All Roles</option>
              <option value="support">Support</option>
              <option value="accounts">Accounts</option>
              <option value="supervisor">Supervisor</option>
              <option value="manager">Manager</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <i className="ri-arrow-down-s-line text-gray-400 w-4 h-4 flex items-center justify-center"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={filteredData}
        columns={columns}
        actions={renderActions}
      />

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`${editingStaff ? 'Edit' : 'Add'} Staff Member`}
        size="lg"
      >
        <SchemaForm
          fields={staffFields}
          initialData={editingStaff || {}}
          onSubmit={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
          loading={loading}
        />
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Staff Member"
        message={`Are you sure you want to delete ${deletingStaff?.name}? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        loading={loading}
      />
    </div>
  );
}
