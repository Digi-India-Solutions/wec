
import { BrowserRouter, useRoutes, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useEffect, useState } from 'react';
import routes from './router/config';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';

function AppContent() {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const routing = useRoutes(routes);
  const [activeMenuKey, setActiveMenuKey] = useState('dashboard');

  // Set up global navigation
  useEffect(() => {
    window.REACT_APP_NAVIGATE = navigate;
  }, [navigate]);

  // Redirect logic
  useEffect(() => {
    if (!isAuthenticated && location.pathname !== '/login' && location.pathname !== '/') {
      navigate('/');
    } else if (isAuthenticated && (location.pathname === '/login' || location.pathname === '/')) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, location.pathname, navigate]);

  // Update active menu based on current path
  useEffect(() => {
    const path = location.pathname;
    if (path === '/dashboard') setActiveMenuKey('dashboard');
    else if (path === '/users' || path === '/distributors' || path === '/retailers') setActiveMenuKey('users');
    else if (path === '/products') setActiveMenuKey('products');
    else if (path === '/amcs') setActiveMenuKey('amcs');
    else if (path === '/customers') setActiveMenuKey('customers');
    else if (path === '/wallet') setActiveMenuKey('wallet');
    else if (path === '/reports') setActiveMenuKey('reports');
    else if (path === '/settings') setActiveMenuKey('settings');
  }, [location.pathname]);

  const handleMenuClick = (key: string, path: string) => {
    setActiveMenuKey(key);
    navigate(path);
  };

  // Show login page or home page if not authenticated
  if (!isAuthenticated && (location.pathname === '/login' || location.pathname === '/')) {
    return <div className="min-h-screen bg-gray-50">{routing}</div>;
  }

  // Show main layout for authenticated users
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar 
        activeKey={activeMenuKey}
        onMenuClick={handleMenuClick}
      />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-auto">
          {routing}
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter basename={__BASE_PATH__}>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
