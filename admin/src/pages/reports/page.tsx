
import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import Button from '../../components/base/Button';
import Input from '../../components/base/Input';
import { useToast } from '../../components/base/Toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { mockAMCs } from '../../mocks/amcs';
import { mockDistributors, mockRetailers } from '../../mocks/users';

export default function ReportsPage() {
  const { user } = useAuthStore();
  const { showToast, ToastContainer } = useToast();
  const [dateRange, setDateRange] = useState({ start: '2024-01-01', end: '2024-12-31' });
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [selectedProduct, setSelectedProduct] = useState('all');

  // Mock data
  const amcs = mockAMCs;
  const distributors = mockDistributors;
  const retailers = mockRetailers;

  // Filter data based on user role
  const getUserData = () => {
    if (user?.role === 'admin') {
      return { amcs, distributors, retailers };
    } else if (user?.role === 'distributor') {
      const filteredAMCs = amcs.filter(amc => amc.distributorId === user.id);
      const filteredRetailers = retailers.filter(r => r.distributorId === user.id);
      return { amcs: filteredAMCs, distributors: [distributors.find(d => d.id === user.id)!], retailers: filteredRetailers };
    }
    return { amcs: [], distributors: [], retailers: [] };
  };

  const userData = getUserData();

  // Calculate summary stats
  const calculateStats = () => {
    const totalAMCs = userData.amcs.length;
    const activeAMCs = userData.amcs.filter(amc => amc.status === 'active').length;
    const expiringAMCs = userData.amcs.filter(amc => amc.status === 'expiring').length;
    const renewedAMCs = userData.amcs.filter(amc => amc.renewalCount > 0).length;
    const totalRevenue = userData.amcs.reduce((sum, amc) => sum + amc.amcAmount, 0);
    const avgAMCValue = totalAMCs > 0 ? totalRevenue / totalAMCs : 0;

    return {
      totalAMCs,
      activeAMCs,
      expiringAMCs,
      renewedAMCs,
      totalRevenue,
      avgAMCValue,
      renewalRate: totalAMCs > 0 ? (renewedAMCs / totalAMCs) * 100 : 0
    };
  };

  const stats = calculateStats();

  // Monthly sales data
  const getMonthlySalesData = () => {
    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      month: new Date(2024, i).toLocaleDateString('en-US', { month: 'short' }),
      sales: 0,
      revenue: 0,
      count: 0
    }));

    userData.amcs.forEach(amc => {
      const month = new Date(amc.createdDate).getMonth();
      if (month >= 0 && month < 12) {
        monthlyData[month].sales += amc.amcAmount;
        monthlyData[month].revenue += amc.purchaseValue;
        monthlyData[month].count += 1;
      }
    });

    return monthlyData;
  };

  const monthlySalesData = getMonthlySalesData();

  // Product category distribution
  const getProductDistribution = () => {
    const categories = userData.amcs.reduce((acc, amc) => {
      acc[amc.productCategory] = (acc[amc.productCategory] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];
    
    return Object.entries(categories).map(([name, value], index) => ({
      name,
      value,
      color: colors[index % colors.length]
    }));
  };

  const productDistribution = getProductDistribution();

  // Distributor performance (Admin only)
  const getDistributorPerformance = () => {
    if (user?.role !== 'admin') return [];

    return userData.distributors.map(distributor => {
      const distributorAMCs = userData.amcs.filter(amc => amc.distributorId === distributor.id);
      const revenue = distributorAMCs.reduce((sum, amc) => sum + amc.amcAmount, 0);
      
      return {
        name: distributor.name,
        amcs: distributorAMCs.length,
        revenue,
        retailers: userData.retailers.filter(r => r.distributorId === distributor.id).length
      };
    });
  };

  const distributorPerformance = getDistributorPerformance();

  // Retailer performance
  const getRetailerPerformance = () => {
    return userData.retailers.map(retailer => {
      const retailerAMCs = userData.amcs.filter(amc => amc.retailerId === retailer.id);
      const revenue = retailerAMCs.reduce((sum, amc) => sum + amc.amcAmount, 0);
      
      return {
        name: retailer.name,
        amcs: retailerAMCs.length,
        revenue
      };
    }).sort((a, b) => b.revenue - a.revenue).slice(0, 10);
  };

  const retailerPerformance = getRetailerPerformance();

  const handleExport = (format: 'pdf' | 'excel') => {
    showToast(`Report exported as ${format.toUpperCase()} successfully`, 'success');
  };

  const StatCard = ({ title, value, icon, color, change }: {
    title: string;
    value: string | number;
    icon: string;
    color: string;
    change?: string;
  }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className="text-sm text-green-600 mt-1">
              <i className="ri-arrow-up-line w-4 h-4 inline-flex items-center justify-center"></i>
              {change}
            </p>
          )}
        </div>
        <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center`}>
          <i className={`${icon} text-white text-xl w-6 h-6 flex items-center justify-center`}></i>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <ToastContainer />
      
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
        <div className="flex space-x-3">
          <Button
            variant="secondary"
            onClick={() => handleExport('excel')}
          >
            <i className="ri-file-excel-line mr-2 w-4 h-4 flex items-center justify-center"></i>
            Export Excel
          </Button>
          <Button
            onClick={() => handleExport('pdf')}
          >
            <i className="ri-file-pdf-line mr-2 w-4 h-4 flex items-center justify-center"></i>
            Export PDF
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            type="date"
            label="Start Date"
            value={dateRange.start}
            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
          />
          <Input
            type="date"
            label="End Date"
            value={dateRange.end}
            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
            <div className="relative">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 pr-8"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <i className="ri-arrow-down-s-line text-gray-400 w-4 h-4 flex items-center justify-center"></i>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Category</label>
            <div className="relative">
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 pr-8"
              >
                <option value="all">All Products</option>
                <option value="Air Conditioner">Air Conditioner</option>
                <option value="Refrigerator">Refrigerator</option>
                <option value="Mobile Phone">Mobile Phone</option>
                <option value="Laptop">Laptop</option>
                <option value="Washing Machine">Washing Machine</option>
                <option value="Television">Television</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <i className="ri-arrow-down-s-line text-gray-400 w-4 h-4 flex items-center justify-center"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total AMCs"
          value={stats.totalAMCs.toLocaleString()}
          icon="ri-file-shield-line"
          color="bg-blue-500"
          change="+12% from last period"
        />
        <StatCard
          title="Active AMCs"
          value={stats.activeAMCs.toLocaleString()}
          icon="ri-checkbox-circle-line"
          color="bg-green-500"
          change="+8% from last period"
        />
        <StatCard
          title="Total Revenue"
          value={`₹${(stats.totalRevenue / 100000).toFixed(1)}L`}
          icon="ri-money-dollar-circle-line"
          color="bg-purple-500"
          change="+15% from last period"
        />
        <StatCard
          title="Renewal Rate"
          value={`${stats.renewalRate.toFixed(1)}%`}
          icon="ri-refresh-line"
          color="bg-indigo-500"
          change="+5% from last period"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Sales Trend */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly AMC Sales Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlySalesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value, name) => [
                name === 'sales' ? `₹${Number(value).toLocaleString()}` : Number(value).toLocaleString(),
                name === 'sales' ? 'AMC Revenue' : 'AMC Count'
              ]} />
              <Line type="monotone" dataKey="sales" stroke="#3B82F6" strokeWidth={2} name="sales" />
              <Line type="monotone" dataKey="count" stroke="#10B981" strokeWidth={2} name="count" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Product Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">AMC Distribution by Product</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={productDistribution}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {productDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Performance Tables */}
      {user?.role === 'admin' && distributorPerformance.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Distributor Performance</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Distributor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total AMCs</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Retailers</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg per Retailer</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {distributorPerformance.map((distributor, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {distributor.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {distributor.amcs}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{distributor.revenue.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {distributor.retailers}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{distributor.retailers > 0 ? Math.round(distributor.revenue / distributor.retailers).toLocaleString() : 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {retailerPerformance.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Retailers</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Retailer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total AMCs</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg AMC Value</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {retailerPerformance.map((retailer, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
                        index === 0 ? 'bg-yellow-100 text-yellow-800' :
                        index === 1 ? 'bg-gray-100 text-gray-800' :
                        index === 2 ? 'bg-orange-100 text-orange-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {retailer.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {retailer.amcs}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{retailer.revenue.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{retailer.amcs > 0 ? Math.round(retailer.revenue / retailer.amcs).toLocaleString() : 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Revenue Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Revenue Comparison</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={monthlySalesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value, name) => [
              `₹${Number(value).toLocaleString()}`,
              name === 'sales' ? 'AMC Revenue' : 'Product Revenue'
            ]} />
            <Bar dataKey="sales" fill="#3B82F6" name="sales" />
            <Bar dataKey="revenue" fill="#10B981" name="revenue" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
