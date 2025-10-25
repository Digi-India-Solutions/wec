
// import { useAuthStore } from '../../store/authStore';
// import { clsx } from 'clsx';

// const menuItems = [
//   { key: 'dashboard', label: 'Dashboard', icon: 'ri-dashboard-line', path: '/dashboard', roles: ['admin', 'distributor', 'retailer'] },
//   { key: 'users', label: 'User Management', icon: 'ri-user-line', path: '/users', roles: ['admin', 'distributor'] },
//   { key: 'staff', label: 'Staff Management', icon: 'ri-team-line', path: '/staff', roles: ['admin'] },
//   { key: 'claims', label: 'Claims Management', icon: 'ri-file-shield-line', path: '/claims', roles: ['admin'] },
//   { key: 'products', label: 'Products', icon: 'ri-product-hunt-line', path: '/products', roles: ['admin'] },
//   { key: 'amcs', label: 'AMC Management', icon: 'ri-file-shield-line', path: '/amcs', roles: ['admin', 'distributor', 'retailer'] },
//   { key: 'customers', label: 'Customers', icon: 'ri-user-heart-line', path: '/customers', roles: ['admin', 'distributor', 'retailer'] },
//   { key: 'wallet', label: 'Wallet', icon: 'ri-wallet-line', path: '/wallet', roles: ['admin', 'distributor', 'retailer'] },
//   { key: 'reports', label: 'Reports', icon: 'ri-bar-chart-line', path: '/reports', roles: ['admin', 'distributor'] },
//   { key: 'settings', label: 'Settings', icon: 'ri-settings-line', path: '/settings', roles: ['admin'] },
// ];

// export default function Sidebar({ activeKey, onMenuClick }) {
//   const { user } = useAuthStore();

//   const filteredMenuItems = menuItems.filter(item => 
//     user && item.roles.includes(user.role)
//   );

//   return (
//     <div className="bg-gray-900 text-white w-64 min-h-screen flex flex-col">
//       <div className="p-6 border-b border-gray-700">
//         <h1 className="text-xl font-bold">AMC Management</h1>
//         <p className="text-sm text-gray-400 capitalize">{user?.role} Panel</p>
//       </div>
      
//       <nav className="flex-1 p-4">
//         <ul className="space-y-2">
//           {filteredMenuItems.map((item) => (
//             <li key={item.key}>
//               <button
//                 onClick={() => onMenuClick(item.key, item.path)}
//                 className={clsx(
//                   'w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors cursor-pointer',
//                   activeKey === item.key
//                     ? 'bg-blue-600 text-white'
//                     : 'text-gray-300 hover:bg-gray-800 hover:text-white'
//                 )}
//               >
//                 <i className={`${item.icon} mr-3 w-5 h-5 flex items-center justify-center`}></i>
//                 <span>{item.label}</span>
//               </button>
//             </li>
//           ))}
//         </ul>
//       </nav>
      
//       <div className="p-4 border-t border-gray-700">
//         <div className="flex items-center space-x-3 mb-4">
//           <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
//             <i className="ri-user-line w-5 h-5 flex items-center justify-center"></i>
//           </div>
//           <div>
//             <p className="font-medium">{user?.name}</p>
//             <p className="text-sm text-gray-400">{user?.email}</p>
//           </div>
//         </div>
//         <button
//           onClick={() => useAuthStore.getState().logout()}
//           className="w-full flex items-center px-4 py-2 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors cursor-pointer"
//         >
//           <i className="ri-logout-box-line mr-3 w-5 h-5 flex items-center justify-center"></i>
//           <span>Logout</span>
//         </button>
//       </div>
//     </div>
//   );
// }



import { useState } from 'react';
// import { useAuthStore } from '../../store/authStore';
import { clsx } from 'clsx';
import { useNavigate } from 'react-router-dom';

const menuItems = [
  { key: 'dashboard', label: 'Dashboard', icon: 'ri-dashboard-line', path: '/dashboard', roles: ['admin', 'distributor', 'retailer'] },
  { key: 'users', label: 'User Management', icon: 'ri-user-line', path: '/users', roles: ['admin', 'distributor'] },
  { key: 'staff', label: 'Staff Management', icon: 'ri-team-line', path: '/staff', roles: ['admin'] },
  { key: 'claims', label: 'Claims Management', icon: 'ri-file-shield-line', path: '/claims', roles: ['admin'] },
  { key: 'products', label: 'Products', icon: 'ri-product-hunt-line', path: '/products', roles: ['admin'] },
  { key: 'amcs', label: 'AMC Management', icon: 'ri-file-shield-line', path: '/amcs', roles: ['admin', 'distributor', 'retailer'] },
  { key: 'customers', label: 'Customers', icon: 'ri-user-heart-line', path: '/customers', roles: ['admin', 'distributor', 'retailer'] },
  { key: 'wallet', label: 'Wallet', icon: 'ri-wallet-line', path: '/wallet', roles: ['admin', 'distributor', 'retailer'] },
  { key: 'reports', label: 'Reports', icon: 'ri-bar-chart-line', path: '/reports', roles: ['admin', 'distributor'] },
  { key: 'settings', label: 'Settings', icon: 'ri-settings-line', path: '/settings', roles: ['admin'] },
];

export default function Sidebar({ activeKey, onMenuClick }) {
  // const { user } = useAuthStore();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(
    sessionStorage.getItem('isAuthenticated') === 'true'
  );

  const [user, setUser] = useState(() => {
    const storedUser = sessionStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const filteredMenuItems = menuItems.filter(item =>
    user && item.roles.includes(user.role)
  );


  const handleLogout = () => {
    // ✅ Clear only relevant items

    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    sessionStorage.setItem("isAuthenticated", 'false');
    setIsAuthenticated(false);
    navigate("/");
  };


  return (
    <div className="bg-gray-900 text-white w-64 min-h-screen flex flex-col">
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-xl font-bold">AMC Management</h1>
        <p className="text-sm text-gray-400 capitalize">{user?.role} Panel</p>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {filteredMenuItems.map((item) => (
            <li key={item.key}>
              <button
                onClick={() => onMenuClick(item.key, item.path)}
                className={clsx(
                  'w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors cursor-pointer',
                  activeKey === item.key
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                )}
              >
                <i className={`${item.icon} mr-3 w-5 h-5 flex items-center justify-center`}></i>
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
            <i className="ri-user-line w-5 h-5 flex items-center justify-center"></i>
          </div>
          <div>
            <p className="font-medium">{user?.name}</p>
            <p className="text-sm text-gray-400">{user?.email}</p>
          </div>
        </div>
        <button
          // onClick={() => useAuthStore.getState().logout()}
          onClick={handleLogout}
          className="w-full flex items-center px-4 py-2 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors cursor-pointer"
        >
          <i className="ri-logout-box-line mr-3 w-5 h-5 flex items-center justify-center"></i>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
