
import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import DataTable from './ProductDataTable';
import Button from '../../components/base/Button';
import Modal from '../../components/base/Modal';
import SchemaForm from './ProductSchemaForm';
import ConfirmDialog from '../../components/base/ConfirmDialog';
import Input from '../../components/base/Input';
import { useToast } from '../../components/base/Toast';
import { mockCategories, mockBrands, mockTypes, mockModels } from '../../mocks/products';
import { getData } from '../../services/FetchNodeServices';



export default function ProductsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    sessionStorage.getItem('isAuthenticated') === 'true'
  );

  const [user, setUser] = useState(() => {
    const storedUser = sessionStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const { showToast, ToastContainer } = useToast();
  const [activeTab, setActiveTab] = useState('types' || 'brands' || 'categories');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [brandFilter, setBrandFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState({ categoryPage: 1, categoryLimit: 10, brandPage: 1, brandLimit: 10, typePage: 1, typeLimit: 10, });
  const [totalData, setTotalData] = useState({ categoryTotal: 0, brandTotal: 0, typeTotal: 0, modelTotal: 0 });

  // Mock data
  const [categories, setCategories] = useState(mockCategories);
  const [allCategories, setAllCategories] = useState([]);
  const [allCategoriesByBrand, setAllCategoriesByBrand] = useState([]);
  const [brands, setBrands] = useState(mockBrands);
  const [allBrands, setAllBrands] = useState([]);
  const [types, setTypes] = useState(mockTypes);
  const [allTypes, setAllTypes] = useState([]);
  const [filter, setFilter] = useState({});

  const getCurrentData = () => {
    switch (activeTab) {
      case 'categories': return categories;
      case 'brands': return brands;
      case 'types': return types;

      default: return [];
    }
  };

  // Filter data
  const filteredData = getCurrentData()
    .filter(item => {
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


      return matchesSearch && matchesStatus && matchesCategory && matchesBrand && matchesType;
    });

  const getFormFields = () => {
    const baseFields = [
      { name: 'name', label: 'Name', type: 'text', required: true },
      {
        name: 'status', label: 'Status', type: 'select', required: true, options: [
          { value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }
        ]
      }
    ];

    switch (activeTab) {
      case 'categories':
        return [
          ...baseFields,
          { name: 'description', label: 'Description', type: 'textarea' }
        ];
      case 'brands':
        return [
          { name: 'name', label: 'Brand Name', type: 'text', required: true },
          {
            name: 'categoryId', label: 'Category', type: 'select', required: true, options:
              allCategories.filter(c => c.status === 'active').map(c => ({ value: c.name, label: c.name }))
          },
          {
            name: 'status', label: 'Status', type: 'select', required: true, options: [
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' }
            ]
          }
        ];
      case 'types':
        return [
          { name: 'name', label: 'Type Name', type: 'text', required: true },
          {
            name: 'categoryId', label: 'Category', type: 'select', required: true, options:
              allCategories.filter(b => b.status === 'active').map(b => ({ value: b.name, label: b.name }))
          },
          {
            name: 'brandId', label: 'Brand', type: 'select', required: true, options:
              allBrands.filter(b => b.status === 'active').map(b => ({ value: b.name, label: b.name }))
          },
          {
            name: 'status', label: 'Status', type: 'select', required: true, options: [
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' }
            ]
          }
        ];
      default:
        return baseFields;
    }
  };

  const getColumns = () => {
    const baseColumns = [
      { key: 'name', title: 'Name', sortable: true },
      {
        key: 'status', title: 'Status', render: (value) => (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${value === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
            {value.charAt(0).toUpperCase() + value.slice(1)}
          </span>
        )
      }
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
          { key: 'categoryId', title: 'Category', sortable: true }
        ];
      case 'types':
        return [
          ...baseColumns,
          { key: 'brandId', title: 'Brand', sortable: true },
          { key: 'categoryId', title: 'Category', sortable: true }
        ];

      default:
        return baseColumns;
    }
  };


  const handleAdd = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = (item) => {
    setDeletingItem(item);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = async (formData) => {
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
      let q = '';
      if (activeTab === 'categories') {
        q = `api/category/delete-category-by-admin/${deletingItem?._id}`
      } else if (activeTab === 'brands') {
        q = `api/brand/delete-brand-by-admin/${deletingItem?._id}`
      } else if (activeTab === 'types') {
        q = `api/type/delete-type-by-admin/${deletingItem?._id}`
      }
      const response = await getData(q);
      if (response?.status === true) {
        fetchCategoryData()
        fetchBrandData()
        fetchTypeData()
        showToast(`${activeTab.slice(0, -1)} deleted successfully`, 'success');
        setIsDeleteDialogOpen(false);
        setDeletingItem(null);
      }

    } catch (error) {
      showToast('Delete failed', 'error');
    } finally {
      setLoading(false);
    }
  };
  // console.log("categories==>categories==>", statusFilter)

  const fetchCategoryData = async () => {
    try {
      const response = await getData(`api/category/get-category-by-admin-with-pagination?limit=${page.categoryLimit}&page=${page?.categoryPage}&search=${searchTerm}&status=${statusFilter}`);
      console.log("response==>", response)
      if (response?.status === true) {
        setCategories(response?.data);
        setTotalData((prev) => ({
          ...prev, categoryTotal: response?.pagination?.totalCategorys || 0,
        }))

      }
    } catch (error) {
      console.log(error)
    }
  }

  const fetchAllCategories = async () => {
    try {
      const response = await getData(`api/category/get-All-category`);
      console.log("response==>get-All-category=>", response)
      if (response?.status === true) {
        setAllCategories(response?.data);
      }
    } catch (error) {
      console.log(error)
    }
  }

  const fetchBrandData = async () => {
    try {
      const response = await getData(`api/brand/get-brand-by-admin-with-pagination?limit=${page.brandLimit}&page=${page?.brandPage}&search=${searchTerm}&status=${statusFilter}&category=${categoryFilter}`);
      console.log("response==>", response)
      if (response?.status === true) {
        setBrands(response?.data);
        setTotalData((prev) => ({
          ...prev, brandTotal: response?.pagination?.totalBrands || 0,
        }));
      }
    } catch (error) {
      console.log(error)
    }
  }

  const fetchAllBrand = async () => {
    try {
      const response = await getData(`api/brand/get-All-brand`);
      console.log("response==>get-All-category=>", response)
      if (response?.status === true) {
        setAllBrands(response?.data);
      }
    } catch (error) {
      console.log(error)
    }
  }


  const fetchTypeData = async () => {
    try {
      const response = await getData(`api/type/get-type-by-admin-with-pagination?limit=${page.typeLimit}&page=${page?.typePage}&search=${searchTerm}&status=${statusFilter}&category=${categoryFilter}&brand=${brandFilter}`);
      console.log("response==>yyyYYYY", response)
      if (response?.status === true) {
        setTypes(response?.data);
        setTotalData((prev) => ({
          ...prev, typeTotal: response?.pagination?.totalTypes || 0,
        }));
      }
    } catch (error) {
      console.log(error)
    }
  }

  const fetchAllType = async () => {
    try {
      const response = await getData(`api/type/get-All-type`);
      console.log("response==>get-All-category=>", response)
      if (response?.status === true) {
        setAllTypes(response?.data);
      }
    } catch (error) {
      console.log(error)
    }
  }
  useEffect(() => {
    fetchCategoryData()
    fetchAllCategories();

    fetchBrandData()
    fetchAllBrand();

    fetchTypeData()
    fetchAllType();

  }, [searchTerm, statusFilter, page?.categoryPage, page?.brandPage,
    page?.typePage, activeTab, categoryFilter, brandFilter, typeFilter]);
  const renderActions = (record) => (
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
  console.log("categories==>totalData", totalData)
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
          {(['categories', 'brands', 'types',
          ]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap cursor-pointer ${activeTab === tab
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)} ({tab === 'categories' && totalData?.categoryTotal || tab === 'brands' && totalData?.brandTotal || tab === 'types' && totalData?.typeTotal})
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
                {allCategories.map(category => (
                  <option key={category.name} value={category.name}>{category.name}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <i className="ri-arrow-down-s-line text-gray-400 w-4 h-4 flex items-center justify-center"></i>
              </div>
            </div>
          </div>
        )}

        {/* Brand Filter for Types */}
        {activeTab === 'types' && (<>
          <div className="w-full lg:w-48">
            <div className="relative">
              <select
                value={brandFilter}
                onChange={(e) => setBrandFilter(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 pr-8"
              >
                <option value="all">All Brands</option>
                {allBrands?.map(brand => (
                  <option key={brand?.name} value={brand?.name}>{brand?.name}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <i className="ri-arrow-down-s-line text-gray-400 w-4 h-4 flex items-center justify-center"></i>
              </div>
            </div>
          </div>
          {/* <div className="w-full lg:w-48">
            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 pr-8"
              >
                <option value="all">All Categories</option>
                {allCategories?.map(brand => (
                  <option key={brand?.name} value={brand?.name}>{brand?.name}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <i className="ri-arrow-down-s-line text-gray-400 w-4 h-4 flex items-center justify-center"></i>
              </div>
            </div>
          </div> */}
        </>
        )}
      </div>

      {/* Data Table */}
      {activeTab === 'categories' && (
        <DataTable
          data={categories}
          columns={getColumns()}
          actions={renderActions}
          setCurrentPage={(newPage) => setPage((prev) => ({ ...prev, categoryPage: newPage }))}
          currentPage={page.categoryPage}
          totalPages={Math.ceil(totalData.categoryTotal / page.categoryLimit)}
          pageSize={page.categoryLimit}
        />
      )}

      {activeTab === 'brands' && (
        <DataTable
          data={brands}
          columns={getColumns()}
          actions={renderActions}
          setCurrentPage={(newPage) => setPage((prev) => ({ ...prev, brandPage: newPage }))}
          currentPage={page.brandPage}
          totalPages={Math.ceil(totalData.brandTotal / page.brandLimit)}
          pageSize={page.brandLimit}
        />
      )}

      {activeTab === 'types' && (
        <DataTable
          data={types}
          columns={getColumns()}
          actions={renderActions}
          setCurrentPage={(newPage) => setPage((prev) => ({ ...prev, typePage: newPage }))}
          currentPage={page.typePage}
          totalPages={Math.ceil(totalData.typeTotal / page.typeLimit)}
          pageSize={page.typeLimit}
        />
      )}

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
          editingItem={editingItem}
          onCancel={() => setIsModalOpen(false)}
          loading={loading}
          activeTab={activeTab}
          allCategories={allCategories || ''}
          allBrands={allBrands || ''}
          fetchCategoryData={fetchCategoryData}
          fetchBrandData={fetchBrandData}
          fetchTypeData={fetchTypeData}
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
