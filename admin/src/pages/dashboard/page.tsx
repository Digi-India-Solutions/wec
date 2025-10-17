import { useAuthStore } from '../../store/authStore';
import { DashboardStats } from '../../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const mockStats: Record<string, DashboardStats> = {
  admin: {
    totalAMCs: 1247,
    activeContracts: 1089,
    expiringThisMonth: 45,
    totalRevenue: 2847500,
    totalDistributors: 25,
    totalRetailers: 156
  },
  distributor: {
    totalAMCs: 89,
    activeContracts: 76,
    expiringThisMonth: 8,
    totalRevenue: 234500,
    totalRetailers: 12
  },
  retailer: {
    totalAMCs: 23,
    activeContracts: 19,
    expiringThisMonth: 2,
    totalRevenue: 45600
  }
};

const salesData = [
  { month: 'Jan', sales: 45, revenue: 180000 },
  { month: 'Feb', sales: 52, revenue: 208000 },
  { month: 'Mar', sales: 48, revenue: 192000 },
  { month: 'Apr', sales: 61, revenue: 244000 },
  { month: 'May', sales: 55, revenue: 220000 },
  { month: 'Jun', sales: 67, revenue: 268000 },
];

const productData = [
  { name: 'AC', value: 35, color: '#3B82F6' },
  { name: 'Refrigerator', value: 25, color: '#10B981' },
  { name: 'Mobile', value: 20, color: '#F59E0B' },
  { name: 'Laptop', value: 12, color: '#EF4444' },
  { name: 'Others', value: 8, color: '#8B5CF6' },
];

export default function Dashboard() {
  const { user } = useAuthStore();
  const stats = mockStats[user?.role || 'admin'];

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
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex items-center space-x-3">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap">
            <i className="ri-download-line mr-2 w-4 h-4 inline-flex items-center justify-center"></i>
            Export Report
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total AMCs"
          value={stats.totalAMCs.toLocaleString()}
          icon="ri-file-shield-line"
          color="bg-blue-500"
          change="+12% from last month"
        />
        <StatCard
          title="Active Contracts"
          value={stats.activeContracts.toLocaleString()}
          icon="ri-checkbox-circle-line"
          color="bg-green-500"
          change="+8% from last month"
        />
        <StatCard
          title="Expiring This Month"
          value={stats.expiringThisMonth}
          icon="ri-alarm-warning-line"
          color="bg-yellow-500"
        />
        <StatCard
          title="Total Revenue"
          value={`₹${(stats.totalRevenue / 100000).toFixed(1)}L`}
          icon="ri-money-dollar-circle-line"
          color="bg-purple-500"
          change="+15% from last month"
        />
      </div>

      {user?.role === 'admin' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <StatCard
            title="Total Distributors"
            value={stats.totalDistributors || 0}
            icon="ri-building-line"
            color="bg-indigo-500"
          />
          <StatCard
            title="Total Retailers"
            value={stats.totalRetailers || 0}
            icon="ri-store-line"
            color="bg-pink-500"
          />
        </div>
      )}

      {user?.role === 'distributor' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <StatCard
            title="My Retailers"
            value={stats.totalRetailers || 0}
            icon="ri-store-line"
            color="bg-indigo-500"
          />
          <StatCard
            title="Commission Earned"
            value={`₹${(25000).toLocaleString()}`}
            icon="ri-hand-coin-line"
            color="bg-pink-500"
          />
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">AMC Sales Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="sales" stroke="#3B82F6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Revenue</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Revenue']} />
              <Bar dataKey="revenue" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Product Distribution */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">AMC Distribution by Product Category</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={productData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {productData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          
          <div className="space-y-4">
            {productData.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="font-medium text-gray-900">{item.name}</span>
                </div>
                <span className="text-gray-600">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {[
            { action: 'New AMC created for Samsung AC', user: 'Retailer John Doe', time: '2 hours ago', icon: 'ri-add-circle-line', color: 'text-green-600' },
            { action: 'AMC renewal completed', user: 'Customer Jane Smith', time: '4 hours ago', icon: 'ri-refresh-line', color: 'text-blue-600' },
            { action: 'Commission credited to wallet', user: 'Distributor ABC Corp', time: '6 hours ago', icon: 'ri-wallet-line', color: 'text-purple-600' },
            { action: 'New retailer registered', user: 'Tech Solutions Ltd', time: '1 day ago', icon: 'ri-user-add-line', color: 'text-indigo-600' },
          ].map((activity, index) => (
            <div key={index} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg">
              <div className={`w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center`}>
                <i className={`${activity.icon} ${activity.color} w-5 h-5 flex items-center justify-center`}></i>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                <p className="text-xs text-gray-500">{activity.user} • {activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}