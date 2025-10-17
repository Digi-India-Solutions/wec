
import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import DataTable from '../../components/base/DataTable';
import Button from '../../components/base/Button';
import Modal from '../../components/base/Modal';
import SchemaForm from '../../components/base/SchemaForm';
import ConfirmDialog from '../../components/base/ConfirmDialog';
import Input from '../../components/base/Input';
import { useToast } from '../../components/base/Toast';
import { mockCategories, mockBrands, mockTypes, mockModels } from '../../mocks/products';

type ProductLevel = 'categories' | 'brands' | 'types' | 'models';

export default function ProductsPage() {
  const { user } = useAuthStore();
  const { showToast, ToastContainer } = useToast();
  const [activeTab, setActiveTab] = useState<ProductLevel>('categories');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [brandFilter, setBrandFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [deletingItem, setDeletingItem] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Mock data
  const [categories, setCategories] = useState(mockCategories);
  const [brands, setBrands] = useState(mockBrands);
  const [types, setTypes] = useState(mockTypes);
  const [models, setModels] = useState(mockModels);

  const getCurrentData = () => {
    switch (activeTab) {
      case 'categories': return categories;
      case 'brands': return brands.map(b => ({
        ...b,
        categoryName: categories.find(c => c.id === b.categoryId)?.name || 'Unknown'
      }));
      case 'types': return types.map(t => ({
        ...t,
        brandName: brands.find(b => b.id === t.brandId)?.name || 'Unknown',
        categoryName: categories.find(c => c.id === brands.find(b => b.id === t.brandId)?.categoryId)?.name || 'Unknown'
      }));
      case 'models': return models.map(m => {
        const type = types.find(t => t.id === m.typeId);
        const brand = brands.find(b => b.id === type?.brandId);
        const category = categories.find(c => c.id === brand?.categoryId);
        return {
          ...m,
          typeName: type?.name || 'Unknown',
          brandName: brand?.name || 'Unknown',
          categoryName: category?.name || 'Unknown'
        };
      });
      default: return [];
    }
  };

  // Filter data
  const filteredData = getCurrentData().filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    
    let matchesCategory = true;
    let matchesBrand = true;
    let matchesType = true;

    if (activeTab === 'brands' && categoryFilter !== 'all') {
      matchesCategory = item.categoryId === categoryFilter;
    }
    if (activeTab === 'types' && brandFilter !== 'all') {
      matchesBrand = item.brandId === brandFilter;
    }
    if (activeTab === 'models' && typeFilter !== 'all') {
      matchesType = item.typeId === typeFilter;
    }

    return matchesSearch && matchesStatus && matchesCategory && matchesBrand && matchesType;
  });

  const getFormFields = () => {
    const baseFields = [
      { name: 'name', label: 'Name', type: 'text' as const, required: true },
      { name: 'status', label: 'Status', type: 'select' as const, required: true, options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' }
      ]}
    ];

    switch (activeTab) {
      case 'categories':
        return [
          ...baseFields,
          { name: 'description', label: 'Description', type: 'textarea' as const }
        ];
      case 'brands':
        return [
          { name: 'name', label: 'Brand Name', type: 'text' as const, required: true },
          { name: 'categoryId', label: 'Category', type: 'select' as const, required: true, options: 
            categories.filter(c => c.status === 'active').map(c => ({ value: c.id, label: c.name }))
          },
          { name: 'status', label: 'Status', type: 'select' as const, required: true, options: [
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' }
          ]}
        ];
      case 'types':
        return [
          { name: 'name', label: 'Type Name', type: 'text' as const, required: true },
          { name: 'brandId', label: 'Brand', type: 'select' as const, required: true, options: 
            brands.filter(b => b.status === 'active').map(b => ({ value: b.id, label: b.name }))
          },
          { name: 'status', label: 'Status', type: 'select' as const, required: true, options: [
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' }
          ]}
        ];
      case 'models':
        return [
          { name: 'name', label: 'Model Name', type: 'text' as const, required: true },
          { name: 'typeId', label: 'Type', type: 'select' as const, required: true, options: 
            types.filter(t => t.status === 'active').map(t => ({ value: t.id, label: t.name }))
          },
          { name: 'description', label: 'Description', type: 'textarea' as const },
          { name: 'status', label: 'Status', type: 'select' as const, required: true, options: [
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' }
          ]}
        ];
      default:
        return baseFields;
    }
  };

  const getColumns = () => {
    const baseColumns = [
      { key: 'name', title: 'Name', sortable: true },
      { key: 'status', title: 'Status', render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      )}
    ];

    switch (activeTab) {
      case 'categories':
        return [
          ...baseColumns,
          { key: 'description', title: 'Description' }
        ];
      case 'brands':
        return [
          ...baseColumns,
          { key: 'categoryName', title: 'Category', sortable: true }
        ];
      case 'types':
        return [
          ...baseColumns,
          { key: 'brandName', title: 'Brand', sortable: true },
          { key: 'categoryName', title: 'Category', sortable: true }
        ];
      case 'models':
        return [
          ...baseColumns,
          { key: 'typeName', title: 'Type', sortable: true },
          { key: 'brandName', title: 'Brand', sortable: true },
          { key: 'categoryName', title: 'Category', sortable: true },
          { key: 'description', title: 'Description' }
        ];
      default:
        return baseColumns;
    }
  };

  const handleAdd = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = (item: any) => {
    setDeletingItem(item);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = async (formData: any) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

      const newItem = {
        id: editingItem?.id || Date.now().toString(),
        ...formData
      };

      switch (activeTab) {
        case 'categories':
          if (editingItem) {
            setCategories(prev => prev.map(c => c.id === editingItem.id ? newItem : c));
          } else {
            setCategories(prev => [...prev, newItem]);
          }
          break;
        case 'brands':
          if (editingItem) {
            setBrands(prev => prev.map(b => b.id === editingItem.id ? newItem : b));
          } else {
            setBrands(prev => [...prev, newItem]);
          }
          break;
        case 'types':
          if (editingItem) {
            setTypes(prev => prev.map(t => t.id === editingItem.id ? newItem : t));
          } else {
            setTypes(prev => [...prev, newItem]);
          }
          break;
        case 'models':
          if (editingItem) {
            setModels(prev => prev.map(m => m.id === editingItem.id ? newItem : m));
          } else {
            setModels(prev => [...prev, newItem]);
          }
          break;
      }

      showToast(`${activeTab.slice(0, -1)} ${editingItem ? 'updated' : 'added'} successfully`, 'success');
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

      switch (activeTab) {
        case 'categories':
          setCategories(prev => prev.filter(c => c.id !== deletingItem.id));
          break;
        case 'brands':
          setBrands(prev => prev.filter(b => b.id !== deletingItem.id));
          break;
        case 'types':
          setTypes(prev => prev.filter(t => t.id !== deletingItem.id));
          break;
        case 'models':
          setModels(prev => prev.filter(m => m.id !== deletingItem.id));
          break;
      }

      showToast(`${activeTab.slice(0, -1)} deleted successfully`, 'success');
      setIsDeleteDialogOpen(false);
      setDeletingItem(null);
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
        <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
        <Button onClick={handleAdd}>
          <i className="ri-add-line mr-2 w-4 h-4 flex items-center justify-center"></i>
          Add {activeTab.slice(0, -1)}
        </Button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {(['categories', 'brands', 'types', 'models'] as ProductLevel[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap cursor-pointer ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)} ({getCurrentData().length})
            </button>
          ))}
        </nav>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search by name..."
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
              <option value="inactive">Inactive</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <i className="ri-arrow-down-s-line text-gray-400 w-4 h-4 flex items-center justify-center"></i>
            </div>
          </div>
        </div>
        
        {/* Category Filter for Brands */}
        {activeTab === 'brands' && (
          <div className="w-full lg:w-48">
            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 pr-8"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <i className="ri-arrow-down-s-line text-gray-400 w-4 h-4 flex items-center justify-center"></i>
              </div>
            </div>
          </div>
        )}
        
        {/* Brand Filter for Types */}
        {activeTab === 'types' && (
          <div className="w-full lg:w-48">
            <div className="relative">
              <select
                value={brandFilter}
                onChange={(e) => setBrandFilter(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 pr-8"
              >
                <option value="all">All Brands</option>
                {brands.map(brand => (
                  <option key={brand.id} value={brand.id}>{brand.name}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <i className="ri-arrow-down-s-line text-gray-400 w-4 h-4 flex items-center justify-center"></i>
              </div>
            </div>
          </div>
        )}
        
        {/* Type Filter for Models */}
        {activeTab === 'models' && (
          <div className="w-full lg:w-48">
            <div className="relative">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 pr-8"
              >
                <option value="all">All Types</option>
                {types.map(type => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <i className="ri-arrow-down-s-line text-gray-400 w-4 h-4 flex items-center justify-center"></i>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Data Table */}
      <DataTable
        data={filteredData}
        columns={getColumns()}
        actions={renderActions}
      />

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`${editingItem ? 'Edit' : 'Add'} ${activeTab.slice(0, -1)}`}
        size="lg"
      >
        <SchemaForm
          fields={getFormFields()}
          initialData={editingItem || {}}
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
        title={`Delete ${activeTab.slice(0, -1)}`}
        message={`Are you sure you want to delete ${deletingItem?.name}? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        loading={loading}
      />
    </div>
  );
}
