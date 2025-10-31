
import { useState } from 'react';
// import { useAuthStore } from '../../store/authStore';
import DataTable from '../../components/base/DataTable';
import Button from '../../components/base/Button';
import Modal from '../../components/base/Modal';
import SchemaForm from './AmcsForm';
import Input from '../../components/base/Input';
import { useToast } from '../../components/base/Toast';
import { mockAMCs } from '../../mocks/amcs';
import { mockCategories, mockBrands, mockTypes, mockModels } from '../../mocks/products';
import { getData, postData } from '../../services/FetchNodeServices';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';


export default function AMCsPage() {
  // const { user } = useAuthStore();
  const [isAuthenticated, setIsAuthenticated] = useState(
    sessionStorage.getItem('isAuthenticated') === 'true'
  );

  const [user, setUser] = useState(() => {
    const storedUser = sessionStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const { showToast, ToastContainer } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAMC, setEditingAMC] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [purchaseValue, setPurchaseValue] = useState('');
  const [amcPercentage, setAmcPercentage] = useState('8');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalData, setTotalData] = useState(0);
  const [totalActive, setTotalActive] = useState(0);
  const [totalExpiringSoon, setTotalExpiringSoon] = useState(0);
  const [totalExpired, setTotalExpired] = useState(0);
  const [allCategories, setAllCategories] = useState([]);
  const [allBrands, setAllBrands] = useState([]);
  const [allTypes, setAllTypes] = useState([]);
  const [teamAndConditions, setSetTeamAndConditions] = useState('');
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
    } else {
      return amcs;
    }
    return [];
  };

  const userAMCs = getUserAMCs();

  // Calculate AMC amount
  const calculateAMCAmount = () => {
    const value = parseFloat(purchaseValue) || 0;
    const percentage = parseFloat(amcPercentage) || 0;
    return (value * percentage) / 100;
  };

  const amcFields = [
    { name: 'customerName', label: 'Customer Name', type: 'text', required: true },
    { name: 'customerEmail', label: 'Customer Email', type: 'email', required: true },
    { name: 'customerMobile', label: 'Customer Mobile', type: 'tel', required: true },
    { name: 'customerAddress', label: 'Customer Address', type: 'textarea', required: true },
    { name: 'productPicture', label: 'Upload Product Picture', type: 'file', required: false, accept: '.pdf,.jpg,.jpeg,.png' },
    { name: 'purchaseProof', label: 'Upload Purchase Proof', type: 'file', required: false, accept: '.pdf,.jpg,.jpeg,.png' },
    { name: 'serialNumber', label: 'Serial / IMEI Number', type: 'text', required: true },
    { name: 'gst', label: 'GST Number', type: 'text', required: false },
  ];

  const columns = [
    { key: 'id', title: 'AMC ID', sortable: true },
    { key: 'customerName', title: 'Customer', sortable: true },
    { key: 'productCategory', title: 'Category' },
    { key: 'productBrand', title: 'Brand' },
    { key: 'productModel', title: 'Model' },
    { key: 'amcAmount', title: 'AMC Amount', render: (value) => `₹${value.toLocaleString()}` },
    { key: 'startDate', title: 'Start Date', render: (value) => new Date(value).toLocaleDateString('en-IN') },
    { key: 'endDate', title: 'End Date', render: (value) => new Date(value).toLocaleDateString('en-IN') },
    {
      key: 'status', title: 'Status', render: (value) => {
        const colors = {
          active: 'bg-green-100 text-green-800',
          expiring: 'bg-yellow-100 text-yellow-800',
          expired: 'bg-red-100 text-red-800',
          renewed: 'bg-blue-100 text-blue-800'
        };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[value] || 'bg-gray-100 text-gray-800'}`}>
            {value.charAt(0).toUpperCase() + value.slice(1)}
          </span>
        );
      }
    }
  ];

  // Add retailer/distributor columns for admin
  if (user?.role === 'admin') {
    columns.splice(-1, 0,
      { key: 'retailerName', title: 'Retailer' },
      { key: 'distributorName', title: 'Distributor' }
    );
  } else if (user?.role === 'distributor') {
    columns.splice(-1, 0, { key: 'retailerName', title: 'Retailer' }, { key: 'distributorName', title: 'Distributor' });

  } else if (user?.role !== 'retailer' && user?.role !== 'distributor') {
    columns.splice(-1, 0,
      { key: 'retailerName', title: 'Retailer' },
      { key: 'distributorName', title: 'Distributor' }
    );
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

  const handleEdit = (amc) => {
    setEditingAMC(amc);
    setIsModalOpen(true);
  };

  const handleRenew = async (amc) => {
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

  const handleSubmit = async (formData) => {
    if (!selectedCategory || !selectedBrand || !selectedType || !purchaseValue) {
      alert('Please fill all product details');
      showToast('Please fill all product details', 'error');
      return;
    }
    console.log("formData==>", formData)
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

      const category = allCategories.find(c => c._id === selectedCategory);
      const brand = allBrands.find(b => b._id === selectedBrand);
      const type = allTypes.find(t => t._id === selectedType);
      // const model = mockModels.find(m => m.id === selectedModel);

      const newAMC = {
        id: `AMC${String(Date.now()).slice(-3).padStart(3, '0')}`,
        ...formData,
        productCategory: category?.name || '',
        productBrand: brand?.name || '',
        productType: type?.name || '',
        categoryId: selectedCategory,
        brandId: selectedBrand,
        typeId: selectedType,
        productModel: selectedModel || '',
        purchaseValue: parseFloat(purchaseValue),
        amcPercentage: parseFloat(amcPercentage),
        amcAmount: calculateAMCAmount(),
        purchaseProof: formData.purchaseProof || `purchase_proof_${Date.now()}.pdf`,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1) - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'active',
        retailerId: user?.role === 'retailer' ? user.id : '',
        retailerName: user?.role === 'retailer' ? user.name : '',
        distributorId: user?.role === 'distributor' ? user.id : '',
        distributorName: user?.role === 'distributor' ? user.name : '',
        createdDate: new Date().toISOString().split('T')[0],
        renewalCount: 0,
        lastServiceDate: null,
      };
      console.log("newAMC==>newAMC==>", newAMC)
      const formDataToSend = new FormData();

      // Append all AMC fields correctly
      formDataToSend.append("id", newAMC?.id || ""); formDataToSend.append("customerName", newAMC?.customerName || "");
      formDataToSend.append("customerAddress", newAMC?.customerAddress || ""); formDataToSend.append("customerMobile", newAMC?.customerMobile || ""); formDataToSend.append("customerEmail", newAMC?.customerEmail || ""); formDataToSend.append("createdByEmail", JSON.stringify(newAMC?.createdByEmail || {}));
      formDataToSend.append("productCategory", newAMC?.productCategory || ""); formDataToSend.append("productBrand", newAMC?.productBrand || ""); formDataToSend.append("productType", newAMC?.productType || ""); formDataToSend.append("productModel", newAMC?.productModel || ""); formDataToSend.append("serialNumber", newAMC?.serialNumber || "");
      formDataToSend.append("purchaseValue", newAMC?.purchaseValue || ""); formDataToSend.append("amcPercentage", newAMC?.amcPercentage || ""); formDataToSend.append("amcAmount", newAMC?.amcAmount || "");
      formDataToSend.append("startDate", newAMC?.startDate || ""); formDataToSend.append("endDate", newAMC?.endDate || ""); formDataToSend.append("status", newAMC?.status || "active"); formDataToSend.append("retailerId", newAMC?.retailerId || "");
      formDataToSend.append("retailerName", newAMC?.retailerName || ""); formDataToSend.append("distributorId", newAMC?.distributorId || ""); formDataToSend.append("distributorName", newAMC?.distributorName || "");
      formDataToSend.append("createdDate", newAMC?.createdDate || ""); formDataToSend.append("renewalCount", newAMC?.renewalCount || 0); formDataToSend.append("lastServiceDate", newAMC?.lastServiceDate || "");
      formDataToSend.append("categoryId", newAMC?.categoryId || ""); formDataToSend.append("brandId", newAMC?.brandId || ""); formDataToSend.append("typeId", newAMC?.typeId || ""); formDataToSend.append("userId", user.id || "");
      formDataToSend.append("gst", newAMC?.gst || "");
      // ✅ Append purchase proof image only if provided
      if (newAMC?.purchaseProof) {
        formDataToSend.append("purchaseProof", newAMC.purchaseProof);
      }
      if (newAMC?.productPicture) {
        formDataToSend.append("productPicture", newAMC.productPicture);
      }

      const endpoint = editingAMC ? `api/amcs/update-amc-by-admin/${editingAMC?._id}` : "api/amcs/create-amc-by-admin";

      // Send API request
      const response = await postData(endpoint, formDataToSend);

      console.log("newAMC==>GGG", newAMC, response)
      if (response?.status === true) {
        fetchAMCs()
        showToast('AMC created successfully', 'success');
        setIsModalOpen(false);
      } else {
        showToast(response?.message || 'AMC creation failed', 'error');
      }

    } catch (error) {
      showToast('AMC creation failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const renderActions = (record) => (
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
        onClick={() => handleDownloadPDf(record)}
      >
        <i className="ri-download-line w-4 h-4 flex items-center justify-center"></i>
      </Button>
    </div>
  );

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // console.log("amcs==>", teamAndConditions.termsAndConditions)
  const handleDownloadPDf = (record) => {
    const doc = new jsPDF();
    const editingAMC = record;
    // Company Information
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('Emicare', 14, 15);

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text('C9/7 c-block dilshad colony Delhi-95 Powered by G&I ALLIANCE', 14, 22);
    doc.text('+91-8929391112', 14, 28);

    // Horizontal line
    doc.setLineWidth(0.5);
    doc.line(14, 32, 196, 32);

    // WEC Number and Date
    doc.text('WEC No:', 14, 38);
    doc.text(`[${editingAMC.id}]`, 30, 38);
    doc.text('Date:', 14, 44);
    doc.text(new Date().toLocaleDateString('en-IN'), 30, 44);

    // Warranty Extended Contract Title
    doc.setFont(undefined, 'bold');
    doc.text('Warranty Extended Contract (WEC)', 14, 54);

    // Customer Information Table - CORRECTED SYNTAX
    autoTable(doc, {
      startY: 58,
      head: [['Customer Name', 'Address', 'Contact No.', 'Email']],
      body: [[
        editingAMC.customerName,
        editingAMC.customerAddress,
        editingAMC.customerMobile,
        editingAMC.customerEmail
      ]],
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [240, 240, 240] }
    });

    // Product Information Table - CORRECTED SYNTAX
    const productTableY = doc.lastAutoTable.finalY + 10;

    autoTable(doc, {
      startY: productTableY,
      head: [['#', 'Product Name', 'Model', 'Serial No.', 'Original Warranty', 'Extended Till', 'Amount']],
      body: [[
        1,
        `${editingAMC.productCategory} - ${editingAMC.productBrand} ${editingAMC.productType}`,
        editingAMC.productModel,
        editingAMC.serialNumber || 'N/A',
        new Date(editingAMC.startDate).toLocaleDateString('en-IN'),
        new Date(editingAMC.endDate).toLocaleDateString('en-IN'),
        `₹${editingAMC.amcAmount.toLocaleString()}`
      ]],
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [240, 240, 240] }
    });

    // Financial Summary - CORRECTED SYNTAX
    const subtotal = editingAMC.amcAmount;
    const taxRate = 18;
    const taxAmount = (subtotal * taxRate) / 100;
    const totalAmount = subtotal + taxAmount;

    const financialY = doc.lastAutoTable.finalY + 10;

    autoTable(doc, {
      startY: financialY,
      body: [
        ['Subtotal', `₹${subtotal.toLocaleString()}`],
        [`Tax (${taxRate}%)`, `₹${taxAmount.toLocaleString()}`],
        ['Total', `₹${totalAmount.toLocaleString()}`]
      ],
      theme: 'plain',
      styles: { fontSize: 10, fontStyle: 'bold' },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 30, halign: 'right' }
      }
    });

    // Terms & Conditions
    const termsY = doc.lastAutoTable.finalY + 15;

    doc.setFont(undefined, 'bold');
    doc.text('Terms & Conditions:', 14, termsY);
    doc.setFont(undefined, 'normal');

    const terms = [
      teamAndConditions?.termsAndConditions?.replace(/<[^>]+>/g, '')?.replace(/\n/g, ' ')?.trim()
    ];

    let currentY = termsY + 6;
    terms.forEach(term => {
      // Split long text to fit in page
      const lines = doc.splitTextToSize(term, 180);
      lines.forEach(line => {
        doc.text(`- ${line}`, 14, currentY);
        currentY += 5;
      });
    });

    // Customer Signature
    const signatureY = currentY + 10;
    doc.text('Customer Signature', 14, signatureY);

    // Footer
    const footerY = signatureY + 15;
    doc.text(`Thank you for choosing Your Company. For support, call +91-8929391113 or sales :- 8929391112 `, 14, footerY);

    // Authorized Signatory
    doc.text('Authorized Signatory', 160, signatureY);

    // Save PDF
    doc.save(`WEC_${editingAMC.id}_${editingAMC.customerName.replace(/\s+/g, '_')}.pdf`);
    showToast('PDF downloaded successfully', 'success');
  };

  const fetchAMCs = async () => {
    try {
      let response = ''
      if (user?.role === 'retailer') {
        response = await getData(`api/amcs/get-amc-by-retailer-with-pagination/${user?.id}?page=${currentPage}&limit=${pageSize}&search=${searchTerm}&status=${statusFilter}&category=${categoryFilter}&brand=${'brandFilter'}&type=${'typeFilter'}`)
      } else if (user?.role === 'distributor') {
        response = await getData(`api/amcs/get-amc-by-distributor-with-pagination/${user?.id}?page=${currentPage}&limit=${pageSize}&search=${searchTerm}&status=${statusFilter}&category=${categoryFilter}&brand=${'brandFilter'}&type=${'typeFilter'}`);
      } else {
        response = response = await getData(`api/amcs/get-amc-by-admin-with-pagination?page=${currentPage}&limit=${pageSize}&search=${searchTerm}&status=${statusFilter}&category=${categoryFilter}&brand=${'brandFilter'}&type=${'typeFilter'}`);
      }


      console.log("response==>response==> response==>", response)
      if (response?.status === true) {
        setAmcs(response?.data);
        setCurrentPage(response?.pagination?.currentPage || 1);
        setTotalPages(response?.pagination?.totalPages || 1);
        setTotalData(response?.pagination?.totalAMCs || 0);
        setTotalActive(response?.pagination?.totalActiveAMCs || 0);
        setTotalExpired(response?.pagination?.totalExpiredAMCs || 0);
        setTotalExpiringSoon(response?.pagination?.totalExpiringSoonAMCs || 0);

      }
    } catch (error) {
      console.error('Error fetching AMC data:', error);
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

  const fetchTeamAndConditions = async () => {
    try {
      const response = await getData('api/company/get-AMC-settings');
      console.log("response==>get-team-and-conditions=>", response)
      if (response?.status === true) {
        setSetTeamAndConditions(response?.data);
      }
    } catch (error) {
      console.error('Error fetching team and conditions:', error);
    }
  }


  useEffect(() => {
    fetchAMCs()
    fetchAllCategories();
    fetchTeamAndConditions();
  }, [currentPage, pageSize, searchTerm, statusFilter, categoryFilter]);

  const fetchAllBrandsByCategory = async () => {
    try {
      const response = await getData(`api/brand/get-brand-by-category/${selectedCategory}`);
      console.log("response==>get-brand-by-category=>", response)
      if (response?.status === true) {
        setAllBrands(response?.data);
      }
    } catch (error) {
      console.log(error)
    }
  }
  const fetchAllTypesByBrand = async () => {
    try {
      const response = await getData(`api/type/get-type-by-brand/${selectedBrand}`);
      console.log("response==>get-brand-by-category=>", response)
      if (response?.status === true) {
        setAllTypes(response?.data);
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    fetchAllBrandsByCategory();
    fetchAllTypesByBrand();
  }, [selectedCategory, selectedBrand, selectedType]);

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  
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
              <p className="text-2xl font-bold text-gray-900">{totalData}</p>
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
              <p className="text-2xl font-bold text-green-600">{totalActive}</p>
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
              <p className="text-2xl font-bold text-yellow-600">{totalExpiringSoon}</p>
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
              <p className="text-2xl font-bold text-red-600">{totalExpired}</p>
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
              {allCategories.map(category => (
                <option key={category?._id} value={category?.name}>{category?.name}</option>
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
        data={userAMCs}
        columns={columns}
        actions={renderActions}
        currentPage={currentPage}
        pageSize={pageSize}
        total={totalData}
        setCurrentPage={setCurrentPage}
        totalPages={totalPages}
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
                  {editingAMC?.productPicture && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Product Picture</label>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                         {editingAMC?.productPicture?<img src={editingAMC?.productPicture} alt="Product Picture" className="w-full h-full object-cover rounded" />:  <i className="ri-file-line text-blue-600 w-4 h-4 flex items-center justify-center"></i>}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            try {
                              // 🧠 Force Cloudinary to download by adding `fl_attachment` to the URL
                              let downloadUrl = editingAMC.productPicture;

                              if (downloadUrl.includes("/upload/")) {
                                downloadUrl = downloadUrl.replace("/upload/", "/upload/fl_attachment/");
                              }

                              // Create and trigger a temporary link
                              const link = document.createElement("a");
                              link.href = downloadUrl;
                              link.download = editingAMC.purchaseProof.split("/").pop() || "purchase-proof";
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);

                              showToast("File downloaded successfully", "success");
                            } catch (error) {
                              console.error("Error downloading image:", error);
                              showToast("Failed to download file", "error");
                            }
                          }}
                        >
                          View / Download
                        </Button>
                      </div>
                    </div>
                  )}
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
                  {editingAMC?.purchaseProof && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Purchase Proof</label>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                          {editingAMC?.purchaseProof?<img src={editingAMC?.purchaseProof} alt="Purchase Proof" className="w-full h-full object-cover rounded" />:  <i className="ri-file-line text-blue-600 w-4 h-4 flex items-center justify-center"></i>}
                       
                       {/* <i className="ri-file-line text-blue-600 w-4 h-4 flex items-center justify-center"></i> */}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            try {
                              // 🧠 Force Cloudinary to download by adding `fl_attachment` to the URL
                              let downloadUrl = editingAMC.purchaseProof;

                              if (downloadUrl.includes("/upload/")) {
                                downloadUrl = downloadUrl.replace("/upload/", "/upload/fl_attachment/");
                              }

                              // Create and trigger a temporary link
                              const link = document.createElement("a");
                              link.href = downloadUrl;
                              link.download = editingAMC.purchaseProof.split("/").pop() || "purchase-proof";
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);

                              showToast("File downloaded successfully", "success");
                            } catch (error) {
                              console.error("Error downloading image:", error);
                              showToast("Failed to download file", "error");
                            }
                          }}
                        >
                          View / Download
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
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${editingAMC.status === 'active' ? 'bg-green-100 text-green-800' :
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
                onClick={() => handleDownloadPDf(editingAMC)}
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
                      {allCategories?.map(category => (
                        <option key={category._id} value={category._id}>{category.name}</option>
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
                      {allBrands?.map(brand => (
                        <option key={brand._id} value={brand._id}>{brand?.name}</option>
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
                      {allTypes?.map(type => (
                        <option key={type._id} value={type._id}>{type?.name}</option>
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
                    <input
                      type="text"
                      name="productModel"
                      disabled={!selectedType}
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value)}
                      placeholder="Enter model name"
                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <i className="ri-pencil-line text-gray-400 w-4 h-4 flex items-center justify-center"></i>
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

                {/* <Input
                  type="number"
                  label="AMC Percentage *"
                  hidden={true}
                  value={amcPercentage}
                  onChange={(e) => setAmcPercentage(e.target.value)}
                  placeholder="Enter AMC percentage"
                  icon="ri-percent-line"
                /> */}
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
