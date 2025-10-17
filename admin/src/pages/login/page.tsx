
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import Button from '../../components/base/Button';
import Input from '../../components/base/Input';
import { useToast } from '../../components/base/Toast';

export default function Login() {
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const { showToast, ToastContainer } = useToast();
  const [formData, setFormData] = useState({ email: '', password: '', role: 'admin' });
  const [loading, setLoading] = useState(false);

  // Mock users for demo
  const mockUsers = [
    { id: '1', name: 'Super Admin', email: 'admin@amcmanagement.com', role: 'admin' as const },
    { id: '2', name: 'ABC Electronics Pvt Ltd', email: 'contact@abcelectronics.com', role: 'distributor' as const },
    { id: '3', name: 'Tech Store Mumbai', email: 'owner@techstoremumbai.com', role: 'retailer' as const }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));

      // Find user by email and role (password is ignored for demo)
      const user = mockUsers.find(u => u.email === formData.email && u.role === formData.role);

      if (user) {
        login(user);
        showToast('Login successful!', 'success');
        setTimeout(() => {
          navigate('/dashboard');
        }, 500);
      } else {
        showToast('Invalid credentials. Please use demo accounts below.', 'error');
      }
    } catch (error) {
      showToast('Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (userEmail: string, userRole: string) => {
    setLoading(true);

    // Auto-fill form
    setFormData({
      email: userEmail,
      password: 'demo123',
      role: userRole
    });

    // Find and login user
    const user = mockUsers.find(u => u.email === userEmail && u.role === userRole);

    if (user) {
      await new Promise(resolve => setTimeout(resolve, 500));
      login(user);
      showToast(`Logged in as ${user.name}`, 'success');
      setTimeout(() => {
        navigate('/dashboard');
      }, 500);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <ToastContainer />

      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center">
            <i className="ri-file-shield-line text-white text-2xl w-8 h-8 flex items-center justify-center"></i>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">AMC Management System</h2>
          <p className="mt-2 text-sm text-gray-600">Sign in to your account</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <div className="relative">
                <select
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 pr-8"
                >
                  <option value="admin">Admin</option>
                  <option value="distributor">Distributor</option>
                  <option value="retailer">Retailer</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <i className="ri-arrow-down-s-line text-gray-400 w-4 h-4 flex items-center justify-center"></i>
                </div>
              </div>
            </div>

            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="Enter your email"
              icon="ri-mail-line"
              required
            />

            <Input
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              placeholder="Enter your password"
              icon="ri-lock-line"
              required
            />
          </div>

          <Button
            type="submit"
            loading={loading}
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>

        {/* Quick Login Demo */}
        <div className="mt-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">Demo Accounts - Click to Login</span>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {mockUsers.map((user) => (
              <button
                key={user.id}
                type="button"
                onClick={() => handleQuickLogin(user.email, user.role)}
                disabled={loading}
                className="w-full flex items-center justify-between p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${user.role === 'admin' ? 'bg-red-100 text-red-600' :
                      user.role === 'distributor' ? 'bg-blue-100 text-blue-600' :
                        'bg-green-100 text-green-600'
                    }`}>
                    <i className={`${user.role === 'admin' ? 'ri-shield-user-line' :
                        user.role === 'distributor' ? 'ri-building-line' :
                          'ri-store-line'
                      } w-4 h-4 flex items-center justify-center`}></i>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</p>
                  </div>
                </div>
                <i className="ri-arrow-right-s-line text-gray-400 w-4 h-4 flex items-center justify-center"></i>
              </button>
            ))}
          </div>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            Demo Application - Click any account above to login instantly
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Password: demo123 (for manual login)
          </p>
        </div>
      </div>
    </div>
  );
}
