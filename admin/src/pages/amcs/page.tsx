
import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import DataTable from '../../components/base/DataTable';
import Button from '../../components/base/Button';
import Modal from '../../components/base/Modal';
import SchemaForm from '../../components/base/SchemaForm';
import Input from '../../components/base/Input';
import { useToast } from '../../components/base/Toast';
import { mockAMCs } from '../../mocks/amcs';
import { mockCategories, mockBrands, mockTypes, mockModels } from '../../mocks/products';

export default function AMCsPage() {
  const { user } = useAuthStore();
  const { showToast, ToastContainer } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAMC, setEditingAMC] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [purchaseValue, setPurchaseValue] = useState('');
  const [amcPercentage, setAmcPercentage] = useState('8');

  // Mock data
  const [amcs, setAmcs] = useState(mockAMCs);

  // Filter AMCs based on user role
  const getUserAMCs = () => {
    if (user?.role === 'admin') {
      return amcs;
    } else if (user?.role === 'distributor') {
      return amcs.filter(amc => amc.distributorId === user.id);
    } else if (user?.role === 'retailer') {
      return amcs.filter(amc => amc.retailerId === user.id);
    }
    return [];
  };

  const userAMCs = getUserAMCs();

  // Filter data
  const filteredData = userAMCs.filter(amc => {
    const matchesSearch = amc.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         amc.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         amc.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || amc.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || amc.productCategory === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Get filtered brands, types, models based on selection
  const getFilteredBrands = () => {
    if (!selectedCategory) return [];
    return mockBrands.filter(b => b.categoryId === selectedCategory);
  };

  const getFilteredTypes = () => {
    if (!selectedBrand) return [];
    return mockTypes.filter(t => t.brandId === selectedBrand);
  };

  const getFilteredModels = () => {
    if (!selectedType) return [];
    return mockModels.filter(m => m.typeId === selectedType);
  };

  // Calculate AMC amount
  const calculateAMCAmount = () => {
    const value = parseFloat(purchaseValue) || 0;
    const percentage = parseFloat(amcPercentage) || 0;
    return (value * percentage) / 100;
  };

  const amcFields = [
    { name: 'customerName', label: 'Customer Name', type: 'text' as const, required: true },
    { name: 'customerEmail', label: 'Customer Email', type: 'email' as const, required: true },
    { name: 'customerMobile', label: 'Customer Mobile', type: 'tel' as const, required: true },
    { name: 'customerAddress', label: 'Customer Address', type: 'textarea' as const, required: true },
    { name: 'serialNumber', label: 'Serial / IMEI Number', type: 'text' as const, required: true },
    { name: 'purchaseProof', label: 'Upload Purchase Proof', type: 'file' as const, required: false, accept: '.pdf,.jpg,.jpeg,.png' }
  ];

  const columns = [
    { key: 'id', title: 'AMC ID', sortable: true },
    { key: 'customerName', title: 'Customer', sortable: true },
    { key: 'productCategory', title: 'Category' },
    { key: 'productBrand', title: 'Brand' },
    { key: 'productModel', title: 'Model' },
    { key: 'amcAmount', title: 'AMC Amount', render: (value: number) => `₹${value.toLocaleString()}` },
    { key: 'startDate', title: 'Start Date', render: (value: string) => new Date(value).toLocaleDateString('en-IN') },
    { key: 'endDate', title: 'End Date', render: (value: string) => new Date(value).toLocaleDateString('en-IN') },
    { key: 'status', title: 'Status', render: (value: string) => {
      const colors = {
        active: 'bg-green-100 text-green-800',
        expiring: 'bg-yellow-100 text-yellow-800',
        expired: 'bg-red-100 text-red-800',
        renewed: 'bg-blue-100 text-blue-800'
      };
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[value as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      );
    }}
  ];

  // Add retailer/distributor columns for admin
  if (user?.role === 'admin') {
    columns.splice(-1, 0, 
      { key: 'retailerName', title: 'Retailer' },
      { key: 'distributorName', title: 'Distributor' }
    );
  } else if (user?.role === 'distributor') {
    columns.splice(-1, 0, { key: 'retailerName', title: 'Retailer' });
  }

  const handleAdd = () => {
    setEditingAMC(null);
    setSelectedCategory('');
    setSelectedBrand('');
    setSelectedType('');
    setPurchaseValue('');
    setAmcPercentage('8');
    setIsModalOpen(true);
  };

  const handleEdit = (amc: any) => {
    setEditingAMC(amc);
    setIsModalOpen(true);
  };

  const handleRenew = async (amc: any) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

      const renewedAMC = {
        ...amc,
        id: `${amc.id}-R${(amc.renewalCount || 0) + 1}`,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'active',
        renewalCount: (amc.renewalCount || 0) + 1,
        createdDate: new Date().toISOString().split('T')[0]
      };

      setAmcs(prev => [renewedAMC, ...prev]);
      showToast('AMC renewed successfully', 'success');
    } catch (error) {
      showToast('Renewal failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData: any) => {
    if (!selectedCategory || !selectedBrand || !selectedType || !purchaseValue) {
      showToast('Please fill all product details', 'error');
      return;
    }

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

      const category = mockCategories.find(c => c.id === selectedCategory);
      const brand = mockBrands.find(b => b.id === selectedBrand);
      const type = mockTypes.find(t => t.id === selectedType);
      const model = mockModels.find(m => m.id === formData.productModel);

      const newAMC = {
        id: `AMC${String(Date.now()).slice(-3).padStart(3, '0')}`,
        ...formData,
        productCategory: category?.name || '',
        productBrand: brand?.name || '',
        productType: type?.name || '',
        productModel: model?.name || '',
        purchaseValue: parseFloat(purchaseValue),
        amcPercentage: parseFloat(amcPercentage),
        amcAmount: calculateAMCAmount(),
        purchaseProof: formData.purchaseProof || `purchase_proof_${Date.now()}.pdf`,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'active',
        retailerId: user?.role === 'retailer' ? user.id : '1',
        retailerName: user?.role === 'retailer' ? user.name : 'Tech Store Mumbai',
        distributorId: user?.role === 'distributor' ? user.id : '1',
        distributorName: user?.role === 'distributor' ? user.name : 'ABC Electronics Pvt Ltd',
        createdDate: new Date().toISOString().split('T')[0],
        renewalCount: 0,
        lastServiceDate: null
      };

      setAmcs(prev => [newAMC, ...prev]);
      showToast('AMC created successfully', 'success');
      setIsModalOpen(false);
    } catch (error) {
      showToast('AMC creation failed', 'error');
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
        <i className="ri-eye-line w-4 h-4 flex items-center justify-center"></i>
      </Button>
      {(record.status === 'expired' || record.status === 'expiring') && (
        <Button
          size="sm"
          onClick={() => handleRenew(record)}
          disabled={loading}
        >
          <i className="ri-refresh-line w-4 h-4 flex items-center justify-center"></i>
        </Button>
      )}
      <Button
        size="sm"
        variant="ghost"
        onClick={() => showToast('PDF generated successfully', 'success')}
      >
        <i className="ri-download-line w-4 h-4 flex items-center justify-center"></i>
      </Button>
    </div>
  );

  // Calculate stats
  const stats = {
    total: userAMCs.length,
    active: userAMCs.filter(a => a.status === 'active').length,
    expiring: userAMCs.filter(a => a.status === 'expiring').length,
    expired: userAMCs.filter(a => a.status === 'expired').length
  };

  return (
    <div className="p-6 space-y-6">
      <ToastContainer />
      
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">AMC Management</h1>
        {(user?.role === 'retailer' || user?.role === 'distributor') && (
          <Button onClick={handleAdd}>
            <i className="ri-add-line mr-2 w-4 h-4 flex items-center justify-center"></i>
            Create AMC
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total AMCs</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <i className="ri-file-shield-line text-white text-xl w-6 h-6 flex items-center justify-center"></i>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
              <i className="ri-checkbox-circle-line text-white text-xl w-6 h-6 flex items-center justify-center"></i>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.expiring}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
              <i className="ri-alarm-warning-line text-white text-xl w-6 h-6 flex items-center justify-center"></i>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Expired</p>
              <p className="text-2xl font-bold text-red-600">{stats.expired}</p>
            </div>
            <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
              <i className="ri-close-circle-line text-white text-xl w-6 h-6 flex items-center justify-center"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search by customer name, email, or AMC ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon="ri-search-line"
          />
        </div>
        <div className="w-full lg:w-48">
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 pr-8"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="expiring">Expiring</option>
              <option value="expired">Expired</option>
              <option value="renewed">Renewed</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <i className="ri-arrow-down-s-line text-gray-400 w-4 h-4 flex items-center justify-center"></i>
            </div>
          </div>
        </div>
        <div className="w-full lg:w-48">
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 pr-8"
            >
              <option value="all">All Categories</option>
              {mockCategories.map(category => (
                <option key={category.id} value={category.name}>{category.name}</option>
              ))}
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

      {/* Create/Edit AMC Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAMC ? 'AMC Details' : 'Create New AMC'}
        size="xl"
      >
        {editingAMC ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Name</label>
                    <p className="text-gray-900">{editingAMC.customerName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email</label>
                    <p className="text-gray-900">{editingAMC.customerEmail}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Mobile</label>
                    <p className="text-gray-900">{editingAMC.customerMobile}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Address</label>
                    <p className="text-gray-900">{editingAMC.customerAddress}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Product</label>
                    <p className="text-gray-900">{editingAMC.productCategory} - {editingAMC.productBrand} {editingAMC.productType}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Model</label>
                    <p className="text-gray-900">{editingAMC.productModel}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Serial / IMEI Number</label>
                    <p className="text-gray-900">{editingAMC.serialNumber || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Purchase Value</label>
                    <p className="text-gray-900">₹{editingAMC.purchaseValue.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">AMC Amount ({editingAMC.amcPercentage}%)</label>
                    <p className="text-gray-900 font-semibold">₹{editingAMC.amcAmount.toLocaleString()}</p>
                  </div>
                  {editingAMC.purchaseProof && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Purchase Proof</label>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                          <i className="ri-file-line text-blue-600 w-4 h-4 flex items-center justify-center"></i>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => showToast('File downloaded successfully', 'success')}
                        >
                          View/Download
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">AMC Details</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">AMC ID</label>
                    <p className="text-gray-900">{editingAMC.id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Start Date</label>
                    <p className="text-gray-900">{new Date(editingAMC.startDate).toLocaleDateString('en-IN')}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">End Date</label>
                    <p className="text-gray-900">{new Date(editingAMC.endDate).toLocaleDateString('en-IN')}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Status</label>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      editingAMC.status === 'active' ? 'bg-green-100 text-green-800' :
                      editingAMC.status === 'expiring' ? 'bg-yellow-100 text-yellow-800' :
                      editingAMC.status === 'expired' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {editingAMC.status.charAt(0).toUpperCase() + editingAMC.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Retailer</label>
                    <p className="text-gray-900">{editingAMC.retailerName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Distributor</label>
                    <p className="text-gray-900">{editingAMC.distributorName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Last Service</label>
                    <p className="text-gray-900">
                      {editingAMC.lastServiceDate ? new Date(editingAMC.lastServiceDate).toLocaleDateString('en-IN') : 'No service yet'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Renewal Count</label>
                    <p className="text-gray-900">{editingAMC.renewalCount || 0}</p>
                  </div>
                </div>
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
                onClick={() => showToast('PDF downloaded successfully', 'success')}
              >
                <i className="ri-download-line mr-2 w-4 h-4 flex items-center justify-center"></i>
                Download PDF
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Customer Information Form */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
              <SchemaForm
                fields={amcFields}
                initialData={{}}
                onSubmit={handleSubmit}
                onCancel={() => setIsModalOpen(false)}
                loading={loading}
                submitText="Create AMC"
              />
            </div>
            
            {/* Product Selection */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <div className="relative">
                    <select
                      value={selectedCategory}
                      onChange={(e) => {
                        setSelectedCategory(e.target.value);
                        setSelectedBrand('');
                        setSelectedType('');
                      }}
                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 pr-8"
                    >
                      <option value="">Select Category</option>
                      {mockCategories.map(category => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <i className="ri-arrow-down-s-line text-gray-400 w-4 h-4 flex items-center justify-center"></i>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Brand *</label>
                  <div className="relative">
                    <select
                      value={selectedBrand}
                      onChange={(e) => {
                        setSelectedBrand(e.target.value);
                        setSelectedType('');
                      }}
                      disabled={!selectedCategory}
                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 pr-8 disabled:bg-gray-100"
                    >
                      <option value="">Select Brand</option>
                      {getFilteredBrands().map(brand => (
                        <option key={brand.id} value={brand.id}>{brand.name}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <i className="ri-arrow-down-s-line text-gray-400 w-4 h-4 flex items-center justify-center"></i>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                  <div className="relative">
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      disabled={!selectedBrand}
                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 pr-8 disabled:bg-gray-100"
                    >
                      <option value="">Select Type</option>
                      {getFilteredTypes().map(type => (
                        <option key={type.id} value={type.id}>{type.name}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <i className="ri-arrow-down-s-line text-gray-400 w-4 h-4 flex items-center justify-center"></i>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                  <div className="relative">
                    <select
                      name="productModel"
                      disabled={!selectedType}
                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 pr-8 disabled:bg-gray-100"
                    >
                      <option value="">Select Model</option>
                      {getFilteredModels().map(model => (
                        <option key={model.id} value={model.id}>{model.name}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <i className="ri-arrow-down-s-line text-gray-400 w-4 h-4 flex items-center justify-center"></i>
                    </div>
                  </div>
                </div>
                
                <Input
                  type="number"
                  label="Purchase Value *"
                  value={purchaseValue}
                  onChange={(e) => setPurchaseValue(e.target.value)}
                  placeholder="Enter purchase value"
                  icon="ri-money-rupee-circle-line"
                />
                
                <Input
                  type="number"
                  label="AMC Percentage *"
                  value={amcPercentage}
                  onChange={(e) => setAmcPercentage(e.target.value)}
                  placeholder="Enter AMC percentage"
                  icon="ri-percent-line"
                />
              </div>
              
              {purchaseValue && amcPercentage && (
                <div className="mt-4 bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">AMC Amount:</span>
                    <span className="text-xl font-bold text-blue-600">
                      ₹{calculateAMCAmount().toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    ₹{parseFloat(purchaseValue).toLocaleString('en-IN')} × {amcPercentage}% = ₹{calculateAMCAmount().toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
