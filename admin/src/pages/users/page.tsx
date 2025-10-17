
import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import DataTable from '../../components/base/DataTable';
import Button from '../../components/base/Button';
import Modal from '../../components/base/Modal';
import SchemaForm from '../../components/base/SchemaForm';
import ConfirmDialog from '../../components/base/ConfirmDialog';
import Input from '../../components/base/Input';
import { useToast } from '../../components/base/Toast';
import { mockDistributors, mockRetailers } from '../../mocks/users';

type UserType = 'distributors' | 'retailers';

export default function UsersPage() {
  const { user } = useAuthStore();
  const { showToast, ToastContainer } = useToast();
  const [activeTab, setActiveTab] = useState<UserType>('distributors');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [deletingUser, setDeletingUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Mock data
  const [distributors, setDistributors] = useState(mockDistributors);
  const [retailers, setRetailers] = useState(mockRetailers);

  // Filter retailers for distributors to only show their assigned retailers
  const getFilteredRetailers = () => {
    if (user?.role === 'distributor') {
      return retailers.filter(retailer => retailer.distributorId === user.id);
    }
    return retailers;
  };

  const currentData = activeTab === 'distributors' ? distributors : getFilteredRetailers();

  // Filter data
  const filteredData = currentData.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const distributorFields = [
    { name: 'name', label: 'Company Name', type: 'text' as const, required: true },
    { name: 'email', label: 'Email', type: 'email' as const, required: true },
    { name: 'mobile', label: 'Mobile', type: 'tel' as const, required: true },
    { name: 'password', label: 'Password', type: 'password' as const, required: !editingUser },
    { name: 'address', label: 'Address', type: 'textarea' as const, required: true },
    { name: 'dateOfJoining', label: 'Date of Joining', type: 'date' as const, required: true },
    { name: 'status', label: 'Status', type: 'select' as const, required: true, options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' }
    ]}
  ];

  const retailerFields = [
    { name: 'name', label: 'Store Name', type: 'text' as const, required: true },
    { name: 'email', label: 'Email', type: 'email' as const, required: true },
    { name: 'mobile', label: 'Mobile', type: 'tel' as const, required: true },
    { name: 'password', label: 'Password', type: 'password' as const, required: !editingUser },
    { name: 'address', label: 'Address', type: 'textarea' as const, required: false },
    { name: 'dateOfJoining', label: 'Date of Joining', type: 'date' as const, required: true },
    ...(user?.role === 'admin' ? [{
      name: 'distributorId', label: 'Assigned Distributor', type: 'select' as const, required: true, options: 
        distributors.filter(d => d.status === 'active').map(d => ({ value: d.id, label: d.name }))
    }] : []),
    { name: 'status', label: 'Status', type: 'select' as const, required: true, options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' }
    ]}
  ];

  const distributorColumns = [
    { key: 'name', title: 'Company Name', sortable: true },
    { key: 'email', title: 'Email', sortable: true },
    { key: 'mobile', title: 'Mobile' },
    { key: 'dateOfJoining', title: 'Date of Joining', render: (value: string) => new Date(value).toLocaleDateString('en-IN') },
    { key: 'totalRetailers', title: 'Retailers', render: (value: number) => value || 0 },
    { key: 'totalAMCs', title: 'Total AMCs', render: (value: number) => value || 0 },
    { key: 'walletBalance', title: 'Wallet Balance', render: (value: number) => `₹${value.toLocaleString()}` },
    { key: 'status', title: 'Status', render: (value: string) => (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        value === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        {value.charAt(0).toUpperCase() + value.slice(1)}
      </span>
    )}
  ];

  const retailerColumns = [
    { key: 'name', title: 'Store Name', sortable: true },
    { key: 'email', title: 'Email', sortable: true },
    { key: 'mobile', title: 'Mobile' },
    { key: 'dateOfJoining', title: 'Date of Joining', render: (value: string) => new Date(value).toLocaleDateString('en-IN') },
    ...(user?.role === 'admin' ? [{ key: 'assignedDistributor', title: 'Distributor', sortable: true }] : []),
    { key: 'totalAMCs', title: 'Total AMCs', render: (value: number) => value || 0 },
    { key: 'walletBalance', title: 'Wallet Balance', render: (value: number) => `₹${value.toLocaleString()}` },
    { key: 'status', title: 'Status', render: (value: string) => (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        value === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        {value.charAt(0).toUpperCase() + value.slice(1)}
      </span>
    )}
  ];

  const handleAdd = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleEdit = (user: any) => {
    // Remove password from editing data for security
    const { password, ...userWithoutPassword } = user;
    setEditingUser(userWithoutPassword);
    setIsModalOpen(true);
  };

  const handleDelete = (user: any) => {
    setDeletingUser(user);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = async (formData: any) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

      // Set default date of joining if not provided
      if (!formData.dateOfJoining) {
        formData.dateOfJoining = new Date().toISOString().split('T')[0];
      }

      if (activeTab === 'distributors') {
        if (editingUser) {
          setDistributors(prev => prev.map(d => d.id === editingUser.id ? { ...d, ...formData } : d));
          showToast('Distributor updated successfully', 'success');
        } else {
          const newDistributor = {
            id: Date.now().toString(),
            ...formData,
            walletBalance: 0,
            joinedDate: formData.dateOfJoining,
            totalRetailers: 0,
            totalAMCs: 0
          };
          setDistributors(prev => [...prev, newDistributor]);
          showToast('Distributor added successfully', 'success');
        }
      } else {
        const distributorId = user?.role === 'distributor' ? user.id : formData.distributorId;
        const distributor = distributors.find(d => d.id === distributorId);
        
        if (editingUser) {
          setRetailers(prev => prev.map(r => r.id === editingUser.id ? { 
            ...r, 
            ...formData, 
            distributorId,
            assignedDistributor: distributor?.name || '' 
          } : r));
          showToast('Retailer updated successfully', 'success');
        } else {
          const newRetailer = {
            id: Date.now().toString(),
            ...formData,
            distributorId,
            assignedDistributor: distributor?.name || '',
            walletBalance: 0,
            joinedDate: formData.dateOfJoining,
            totalAMCs: 0
          };
          setRetailers(prev => [...prev, newRetailer]);
          showToast('Retailer added successfully', 'success');
        }
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
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

      if (activeTab === 'distributors') {
        setDistributors(prev => prev.filter(d => d.id !== deletingUser.id));
        showToast('Distributor deleted successfully', 'success');
      } else {
        setRetailers(prev => prev.filter(r => r.id !== deletingUser.id));
        showToast('Retailer deleted successfully', 'success');
      }

      setIsDeleteDialogOpen(false);
      setDeletingUser(null);
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
      >
        <i className="ri-edit-line w-4 h-4 flex items-center justify-center"></i>
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => handleDelete(record)}
      >
        <i className="ri-delete-bin-line w-4 h-4 flex items-center justify-center text-red-600"></i>
      </Button>
    </div>
  );

  // Check permissions
  if (user?.role === 'retailer') {
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
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <Button onClick={handleAdd}>
          <i className="ri-add-line mr-2 w-4 h-4 flex items-center justify-center"></i>
          Add {activeTab === 'distributors' ? 'Distributor' : 'Retailer'}
        </Button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {user?.role === 'admin' && (
            <button
              onClick={() => setActiveTab('distributors')}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap cursor-pointer ${
                activeTab === 'distributors'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Distributors ({distributors.length})
            </button>
          )}
          <button
            onClick={() => setActiveTab('retailers')}
            className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap cursor-pointer ${
              activeTab === 'retailers'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Retailers ({getFilteredRetailers().length})
          </button>
        </nav>
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
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 pr-8"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
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
        columns={activeTab === 'distributors' ? distributorColumns : retailerColumns}
        actions={renderActions}
      />

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`${editingUser ? 'Edit' : 'Add'} ${activeTab === 'distributors' ? 'Distributor' : 'Retailer'}`}
        size="lg"
      >
        <SchemaForm
          fields={activeTab === 'distributors' ? distributorFields : retailerFields}
          initialData={editingUser || {}}
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
        title="Delete User"
        message={`Are you sure you want to delete ${deletingUser?.name}? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        loading={loading}
      />
    </div>
  );
}
