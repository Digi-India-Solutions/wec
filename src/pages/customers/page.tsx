
import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import DataTable from '../../components/base/DataTable';
import Button from '../../components/base/Button';
import Modal from '../../components/base/Modal';
import Input from '../../components/base/Input';
import { useToast } from '../../components/base/Toast';
import { mockCustomers, mockAMCs } from '../../mocks/amcs';

export default function CustomersPage() {
  const { user } = useAuthStore();
  const { showToast, ToastContainer } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  // Mock data
  const [customers] = useState(mockCustomers);
  const [amcs] = useState(mockAMCs);

  // Filter customers based on user role
  const getUserCustomers = () => {
    if (user?.role === 'admin') {
      return customers;
    } else if (user?.role === 'distributor') {
      const distributorAMCs = amcs.filter(amc => amc.distributorId === user.id);
      const customerIds = [...new Set(distributorAMCs.map(amc => amc.customerEmail))];
      return customers.filter(customer => customerIds.includes(customer.email));
    } else if (user?.role === 'retailer') {
      const retailerAMCs = amcs.filter(amc => amc.retailerId === user.id);
      const customerIds = [...new Set(retailerAMCs.map(amc => amc.customerEmail))];
      return customers.filter(customer => customerIds.includes(customer.email));
    }
    return [];
  };

  const userCustomers = getUserCustomers();

  // Filter data
  const filteredData = userCustomers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.mobile.includes(searchTerm);
    
    let matchesStatus = true;
    if (statusFilter === 'active') {
      matchesStatus = customer.activeAMCs > 0;
    } else if (statusFilter === 'inactive') {
      matchesStatus = customer.activeAMCs === 0;
    }
    
    return matchesSearch && matchesStatus;
  });

  const columns = [
    { key: 'name', title: 'Customer Name', sortable: true },
    { key: 'email', title: 'Email', sortable: true },
    { key: 'mobile', title: 'Mobile' },
    { key: 'totalAMCs', title: 'Total AMCs', render: (value: number) => value || 0 },
    { key: 'activeAMCs', title: 'Active AMCs', render: (value: number) => (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        value > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
      }`}>
        {value || 0}
      </span>
    )},
    { key: 'totalSpent', title: 'Total Spent', render: (value: number) => `₹${value.toLocaleString()}` },
    { key: 'lastPurchase', title: 'Last Purchase', render: (value: string) => 
      new Date(value).toLocaleDateString('en-IN')
    }
  ];

  const handleViewDetails = (customer: any) => {
    setSelectedCustomer(customer);
    setIsModalOpen(true);
  };

  const renderActions = (record: any) => (
    <div className="flex space-x-2">
      <Button
        size="sm"
        variant="ghost"
        onClick={() => handleViewDetails(record)}
      >
        <i className="ri-eye-line w-4 h-4 flex items-center justify-center"></i>
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => showToast('Email sent successfully', 'success')}
      >
        <i className="ri-mail-line w-4 h-4 flex items-center justify-center"></i>
      </Button>
    </div>
  );

  // Get customer AMCs
  const getCustomerAMCs = (customerEmail: string) => {
    return amcs.filter(amc => amc.customerEmail === customerEmail);
  };

  // Calculate stats
  const stats = {
    total: userCustomers.length,
    active: userCustomers.filter(c => c.activeAMCs > 0).length,
    inactive: userCustomers.filter(c => c.activeAMCs === 0).length,
    totalRevenue: userCustomers.reduce((sum, c) => sum + c.totalSpent, 0)
  };

  return (
    <div className="p-6 space-y-6">
      <ToastContainer />
      
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Customer Database</h1>
        <Button onClick={() => showToast('Export completed successfully', 'success')}>
          <i className="ri-download-line mr-2 w-4 h-4 flex items-center justify-center"></i>
          Export Data
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <i className="ri-user-heart-line text-white text-xl w-6 h-6 flex items-center justify-center"></i>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Customers</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
              <i className="ri-user-star-line text-white text-xl w-6 h-6 flex items-center justify-center"></i>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Inactive Customers</p>
              <p className="text-2xl font-bold text-gray-600">{stats.inactive}</p>
            </div>
            <div className="w-12 h-12 bg-gray-500 rounded-lg flex items-center justify-center">
              <i className="ri-user-unfollow-line text-white text-xl w-6 h-6 flex items-center justify-center"></i>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-purple-600">₹{(stats.totalRevenue / 100000).toFixed(1)}L</p>
            </div>
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
              <i className="ri-money-dollar-circle-line text-white text-xl w-6 h-6 flex items-center justify-center"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search by name, email, or mobile..."
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
              <option value="all">All Customers</option>
              <option value="active">Active AMCs</option>
              <option value="inactive">No Active AMCs</option>
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

      {/* Customer Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Customer Details"
        size="xl"
      >
        {selectedCustomer && (
          <div className="space-y-6">
            {/* Customer Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Name</label>
                    <p className="text-gray-900">{selectedCustomer.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email</label>
                    <p className="text-gray-900">{selectedCustomer.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Mobile</label>
                    <p className="text-gray-900">{selectedCustomer.mobile}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Address</label>
                    <p className="text-gray-900">{selectedCustomer.address}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Purchase Summary</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Total AMCs</label>
                    <p className="text-gray-900">{selectedCustomer.totalAMCs}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Active AMCs</label>
                    <p className="text-gray-900">{selectedCustomer.activeAMCs}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Total Spent</label>
                    <p className="text-gray-900 font-semibold">₹{selectedCustomer.totalSpent.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Customer Since</label>
                    <p className="text-gray-900">{new Date(selectedCustomer.joinedDate).toLocaleDateString('en-IN')}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Last Purchase</label>
                    <p className="text-gray-900">{new Date(selectedCustomer.lastPurchase).toLocaleDateString('en-IN')}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* AMC History */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">AMC History</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">AMC ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {getCustomerAMCs(selectedCustomer.email).map((amc) => (
                      <tr key={amc.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{amc.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {amc.productBrand} {amc.productType}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₹{amc.amcAmount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(amc.startDate).toLocaleDateString('en-IN')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(amc.endDate).toLocaleDateString('en-IN')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            amc.status === 'active' ? 'bg-green-100 text-green-800' :
                            amc.status === 'expiring' ? 'bg-yellow-100 text-yellow-800' :
                            amc.status === 'expired' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {amc.status.charAt(0).toUpperCase() + amc.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => showToast('PDF downloaded successfully', 'success')}
                          >
                            <i className="ri-download-line w-4 h-4 flex items-center justify-center"></i>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <Button
                variant="secondary"
                onClick={() => setIsModalOpen(false)}
              >
                Close
              </Button>
              <Button
                onClick={() => showToast('Email sent to customer', 'success')}
              >
                <i className="ri-mail-line mr-2 w-4 h-4 flex items-center justify-center"></i>
                Send Email
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
