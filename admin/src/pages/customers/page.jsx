
import { useState } from 'react';
import DataTable from '../../components/base/DataTable';
import Button from '../../components/base/Button';
import Modal from '../../components/base/Modal';
import Input from '../../components/base/Input';
import { useToast } from '../../components/base/Toast';
import { getData, serverURL } from '../../services/FetchNodeServices';


export const mockAMCs = [
  {
    id: 'AMC001',
    customerName: 'Rajesh Kumar',
    customerEmail: 'rajesh.kumar@email.com',
    customerMobile: '+91 9876543230',
    customerAddress: '123 Residential Complex, Mumbai, Maharashtra 400001',
    productCategory: 'Air Conditioner',
    productBrand: 'Samsung',
    productType: 'Split AC',
    productModel: 'AR18TY5QAWK',
    serialNumber: 'SAC2024001234',
    purchaseValue: 45000,
    amcPercentage: 8,
    amcAmount: 3600,
    purchaseProof: 'purchase_proof_rajesh.pdf',
    startDate: '2024-01-15',
    endDate: '2025-01-14',
    status: 'active',
    retailerId: '1',
    retailerName: 'Tech Store Mumbai',
    distributorId: '1',
    distributorName: 'ABC Electronics Pvt Ltd',
    createdDate: '2024-01-15',
    renewalCount: 0,
    lastServiceDate: '2024-06-15'
  },
  {
    id: 'AMC002',
    customerName: 'Priya Sharma',
    customerEmail: 'priya.sharma@email.com',
    customerMobile: '+91 9876543231',
    customerAddress: '456 Garden View, Bangalore, Karnataka 560001',
    productCategory: 'Refrigerator',
    productBrand: 'LG',
    productType: 'Double Door',
    productModel: 'GL-T292RPZY',
    serialNumber: 'LGR2024005678',
    purchaseValue: 32000,
    amcPercentage: 9,
    amcAmount: 2880,
    purchaseProof: 'purchase_proof_priya.jpg',
    startDate: '2024-02-01',
    endDate: '2025-01-31',
    status: 'active',
    retailerId: '3',
    retailerName: 'Electronics Plaza',
    distributorId: '2',
    distributorName: 'TechWorld Distribution',
    createdDate: '2024-02-01',
    renewalCount: 0,
    lastServiceDate: '2024-07-01'
  },
  {
    id: 'AMC003',
    customerName: 'Amit Patel',
    customerEmail: 'amit.patel@email.com',
    customerMobile: '+91 9876543232',
    customerAddress: '789 Tech Park, Pune, Maharashtra 411001',
    productCategory: 'Mobile Phone',
    productBrand: 'Apple',
    productType: 'iPhone',
    productModel: 'iPhone 15 Pro',
    serialNumber: '359123456789012',
    purchaseValue: 134900,
    amcPercentage: 8,
    amcAmount: 10792,
    purchaseProof: 'purchase_proof_amit.pdf',
    startDate: '2024-03-15',
    endDate: '2025-03-14',
    status: 'active',
    retailerId: '5',
    retailerName: 'Smart Solutions',
    distributorId: '3',
    distributorName: 'Digital Solutions Inc',
    createdDate: '2024-03-15',
    renewalCount: 0,
    lastServiceDate: '2024-08-15'
  },
  {
    id: 'AMC004',
    customerName: 'Sunita Reddy',
    customerEmail: 'sunita.reddy@email.com',
    customerMobile: '+91 9876543233',
    customerAddress: '321 IT Corridor, Chennai, Tamil Nadu 600001',
    productCategory: 'Laptop',
    productBrand: 'Dell',
    productType: 'Gaming',
    productModel: 'Alienware m15 R7',
    serialNumber: 'DELL2024789012',
    purchaseValue: 185000,
    amcPercentage: 9,
    amcAmount: 16650,
    purchaseProof: 'purchase_proof_sunita.png',
    startDate: '2023-12-01',
    endDate: '2024-11-30',
    status: 'expiring',
    retailerId: '7',
    retailerName: 'Tech Corner',
    distributorId: '5',
    distributorName: 'Smart Devices Hub',
    createdDate: '2023-12-01',
    renewalCount: 1,
    lastServiceDate: '2024-05-01'
  },
  {
    id: 'AMC005',
    customerName: 'Vikram Singh',
    customerEmail: 'vikram.singh@email.com',
    customerMobile: '+91 9876543234',
    customerAddress: '654 Business District, Delhi, Delhi 110001',
    productCategory: 'Washing Machine',
    productBrand: 'Samsung',
    productType: 'Front Load',
    productModel: 'WW80T504DAN',
    serialNumber: 'SWM2024345678',
    purchaseValue: 42000,
    amcPercentage: 8,
    amcAmount: 3360,
    purchaseProof: 'purchase_proof_vikram.pdf',
    startDate: '2023-10-15',
    endDate: '2024-10-14',
    status: 'expired',
    retailerId: '6',
    retailerName: 'Gadget Store',
    distributorId: '4',
    distributorName: 'Metro Electronics',
    createdDate: '2023-10-15',
    renewalCount: 0,
    lastServiceDate: '2024-03-15'
  },
  {
    id: 'AMC006',
    customerName: 'Meera Joshi',
    customerEmail: 'meera.joshi@email.com',
    customerMobile: '+91 9876543235',
    customerAddress: '987 Residential Area, Mumbai, Maharashtra 400050',
    productCategory: 'Television',
    productBrand: 'Samsung',
    productType: 'QLED',
    productModel: 'QA65Q80BAK',
    serialNumber: 'STV2024901234',
    purchaseValue: 89000,
    amcPercentage: 9,
    amcAmount: 8010,
    purchaseProof: 'purchase_proof_meera.jpg',
    startDate: '2024-04-01',
    endDate: '2025-03-31',
    status: 'active',
    retailerId: '2',
    retailerName: 'Mobile World',
    distributorId: '1',
    distributorName: 'ABC Electronics Pvt Ltd',
    createdDate: '2024-04-01',
    renewalCount: 0,
    lastServiceDate: '2024-09-01'
  },
  {
    id: 'AMC007',
    customerName: 'Arjun Nair',
    customerEmail: 'arjun.nair@email.com',
    customerMobile: '+91 9876543236',
    customerAddress: '147 Tech Hub, Bangalore, Karnataka 560002',
    productCategory: 'Air Conditioner',
    productBrand: 'LG',
    productType: 'Split AC',
    productModel: 'MS-Q18YNZA',
    serialNumber: 'LAC2024567890',
    purchaseValue: 38000,
    amcPercentage: 8,
    amcAmount: 3040,
    purchaseProof: 'purchase_proof_arjun.pdf',
    startDate: '2024-05-15',
    endDate: '2025-05-14',
    status: 'active',
    retailerId: '4',
    retailerName: 'Digital Hub',
    distributorId: '2',
    distributorName: 'TechWorld Distribution',
    createdDate: '2024-05-15',
    renewalCount: 0,
    lastServiceDate: null
  },
  {
    id: 'AMC008',
    customerName: 'Kavya Menon',
    customerEmail: 'kavya.menon@email.com',
    customerMobile: '+91 9876543237',
    customerAddress: '258 Shopping Complex, Chennai, Tamil Nadu 600002',
    productCategory: 'Mobile Phone',
    productBrand: 'Samsung',
    productType: 'Smartphone',
    productModel: 'Galaxy S23 Ultra',
    serialNumber: '358987654321098',
    purchaseValue: 124999,
    amcPercentage: 8,
    amcAmount: 9999,
    purchaseProof: 'purchase_proof_kavya.png',
    startDate: '2024-06-01',
    endDate: '2025-05-31',
    status: 'active',
    retailerId: '8',
    retailerName: 'Electronics Mart',
    distributorId: '5',
    distributorName: 'Smart Devices Hub',
    createdDate: '2024-06-01',
    renewalCount: 0,
    lastServiceDate: null
  }
];

export const mockCustomers = [
  {
    id: '1',
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@email.com',
    mobile: '+91 9876543230',
    address: '123 Residential Complex, Mumbai, Maharashtra 400001',
    totalAMCs: 2,
    activeAMCs: 1,
    totalSpent: 48600,
    joinedDate: '2024-01-15',
    lastPurchase: '2024-01-15'
  },
  {
    id: '2',
    name: 'Priya Sharma',
    email: 'priya.sharma@email.com',
    mobile: '+91 9876543231',
    address: '456 Garden View, Bangalore, Karnataka 560001',
    totalAMCs: 1,
    activeAMCs: 1,
    totalSpent: 34880,
    joinedDate: '2024-02-01',
    lastPurchase: '2024-02-01'
  },
  {
    id: '3',
    name: 'Amit Patel',
    email: 'amit.patel@email.com',
    mobile: '+91 9876543232',
    address: '789 Tech Park, Pune, Maharashtra 411001',
    totalAMCs: 1,
    activeAMCs: 1,
    totalSpent: 145692,
    joinedDate: '2024-03-15',
    lastPurchase: '2024-03-15'
  },
  {
    id: '4',
    name: 'Sunita Reddy',
    email: 'sunita.reddy@email.com',
    mobile: '+91 9876543233',
    address: '321 IT Corridor, Chennai, Tamil Nadu 600001',
    totalAMCs: 1,
    activeAMCs: 0,
    totalSpent: 201650,
    joinedDate: '2023-12-01',
    lastPurchase: '2023-12-01'
  },
  {
    id: '5',
    name: 'Vikram Singh',
    email: 'vikram.singh@email.com',
    mobile: '+91 9876543234',
    address: '654 Business District, Delhi, Delhi 110001',
    totalAMCs: 1,
    activeAMCs: 0,
    totalSpent: 45360,
    joinedDate: '2023-10-15',
    lastPurchase: '2023-10-15'
  }
];


export default function CustomersPage() {

  const [user, setUser] = useState(() => {
    const storedUser = sessionStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const { showToast, ToastContainer } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Mock data
  const [customers, setCustomers] = useState(mockCustomers);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalData, setTotalData] = useState(0);
  const [totalActive, setTotalActive] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalInActive, setTotalInActive] = useState(0);


  const [amcs, setAmcs] = useState(mockAMCs);

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
    { key: 'totalAMCs', title: 'Total AMCs', render: (value) => value || 0 },
    {
      key: 'activeAMCs', title: 'Active AMCs', render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${value > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
          {value || 0}
        </span>
      )
    },
    { key: 'totalSpent', title: 'Total Spent', render: (value) => `₹${value.toLocaleString()}` },
    {
      key: 'updatedAt', title: 'Last Purchase', render: (value) =>
        new Date(value).toLocaleDateString('en-IN')
    }
  ];

  const handleViewDetails = (customer) => {
    setSelectedCustomer(customer);
    setIsModalOpen(true);
  };

  const renderActions = (record) => (
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
  const getCustomerAMCs = async (customerEmail) => {
    try {
      const response = await getData(`api/amcs/get-amc-by-customer?customerEmail=${customerEmail}`);
      console.log("AMC response===>", response?.data)
      if (response?.status === true) {
        setAmcs(response?.data)
      }
    } catch (error) {
      console.log(error)
    }
  };

  useEffect(() => {
    if (selectedCustomer?.email) {
      getCustomerAMCs(selectedCustomer?.email);
    }
  }, [selectedCustomer]);

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  const fetchCustomers = async () => {
    try {
      const queryParamsObj = {
        limit: pageSize,
        page: currentPage,
        search: searchTerm
      };
      const queryParams = new URLSearchParams(queryParamsObj).toString();
      let response = await getData(`api/customer/get-customer-by-admin-with-pagination?${queryParams}`)

      console.log("CUSTOMER response===>", response)
      if (response?.status === true) {
        setCustomers(response?.data);
        setCurrentPage(response?.pagination?.currentPage || 1);
        setTotalPages(response?.pagination?.totalPages || 1);
        setTotalData(response?.pagination?.totalData || 0);
        setTotalActive(response?.pagination?.totalActive || 0);
        setTotalRevenue(response?.pagination?.totalRevenue || 0);
        setTotalInActive(response?.pagination?.totalInActive || 0);
      }
    } catch (error) {
      console.error('Error fetching AMC data:', error);
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [searchTerm, pageSize, currentPage])

  const formatAmount = (amount) => {
    if (amount >= 100000) return `${(amount / 100000).toFixed(2)}L`;
    if (amount >= 1000) return `${(amount / 1000).toFixed(2)}k`;
    return amount.toString();
  };

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  ////////////////////////////////// Export Data ///////////////////////////////////////////////////////////////////////////////////
  const handleExportData = async () => {
    try {
      // Use full URL or a wrapper that returns the raw Response object
      const url = `${serverURL}/api/customer/export-customers`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token') || ''}`,
        },
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Export failed: ${response.status} ${text}`);
      }

      const blob = await response.blob();

      // Detect filename from header if available
      const disposition = response.headers.get("content-disposition");
      let filename = "customers.xlsx";
      if (disposition && disposition.includes("filename=")) {
        const match = disposition.match(/filename\*?=(?:UTF-8'')?["']?([^;"']+)/i);
        if (match && match[1]) {
          filename = decodeURIComponent(match[1].replace(/['"]/g, ""));
        }
      }

      const urlObject = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = urlObject;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(urlObject);
    } catch (error) {
      console.error("Export Error:", error);
      // show toast or user-friendly message
    }
  };


  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  return (
    <div className="p-6 space-y-6">
      <ToastContainer />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Customer Database</h1>
        <Button onClick={handleExportData}>
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
              <p className="text-2xl font-bold text-gray-900">{totalData}</p>
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
              <p className="text-2xl font-bold text-green-600">{totalActive}</p>
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
              <p className="text-2xl font-bold text-gray-600">{totalInActive}</p>
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
              <p className="text-2xl font-bold text-purple-600">₹{formatAmount(totalRevenue)}</p>
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
        currentPage={currentPage}
        pageSize={pageSize}
        setCurrentPage={setCurrentPage}
        totalPages={totalPages}
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
                    <p className="text-gray-900 font-semibold">₹{selectedCustomer?.totalSpent.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Customer Since</label>
                    <p className="text-gray-900">{new Date(selectedCustomer?.createdAt).toLocaleDateString('en-IN')}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Last Purchase</label>
                    <p className="text-gray-900">{new Date(selectedCustomer?.updatedAt).toLocaleDateString('en-IN')}</p>
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
                    {amcs?.map((amc) => (
                      <tr key={amc?._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{amc?.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {amc?.productBrand} {amc?.productType}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₹{amc?.amcAmount?.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(amc?.startDate)?.toLocaleDateString('en-IN')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(amc?.endDate)?.toLocaleDateString('en-IN')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${amc?.status === 'active' ? 'bg-green-100 text-green-800' :
                            amc?.status === 'expiring' ? 'bg-yellow-100 text-yellow-800' :
                              amc?.status === 'expired' ? 'bg-red-100 text-red-800' :
                                'bg-blue-100 text-blue-800'
                            }`}>
                            {amc?.status?.charAt(0)?.toUpperCase() + amc?.status?.slice(1)}
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
