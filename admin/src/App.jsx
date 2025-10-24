import { BrowserRouter, useRoutes, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import routes from './router/config';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import  {jwtDecode}  from 'jwt-decode';

// Type for user (adjust based on your JWT structure)

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const routing = useRoutes(routes);

  const [isAuthenticated, setIsAuthenticated] = useState(
    sessionStorage.getItem('isAuthenticated') === 'true'
  );

  const [user, setUser] = useState(() => {
    const storedUser = sessionStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [activeMenuKey, setActiveMenuKey] = useState('dashboard');

  /** 🔄 Sync navigation globally (for legacy usage) */
  useEffect(() => {
    window.REACT_APP_NAVIGATE = navigate;
  }, [navigate]);

  /** 🔑 Handle Authentication + Redirection Logic */
  useEffect(() => {
    const token = sessionStorage.getItem('token');

    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser(decoded);
        sessionStorage.setItem('user', JSON.stringify(decoded));
        setIsAuthenticated(true);

        // Optional: Token expiry check
        if (decoded.exp && Date.now() >= decoded.exp * 1000) {
          console.warn('Token expired');
          sessionStorage.clear();
          setIsAuthenticated(false);
          navigate('/');
        }
      } catch (err) {
        console.warn('Invalid token:', err);
        sessionStorage.clear();
        setIsAuthenticated(false);
        navigate('/');
      }
    } else {
      setIsAuthenticated(false);
    }

    // Redirect logic
    if (!isAuthenticated && location.pathname !== '/' && location.pathname !== '/login') {
      navigate('/');
    } else if (isAuthenticated && (location.pathname === '/' || location.pathname === '/login')) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, location.pathname, navigate]);

  /** 📍 Menu Highlight Logic */
  useEffect(() => {
    const pathToKeyMap = {
      '/dashboard': 'dashboard',
      '/users': 'users',
      '/distributors': 'users',
      '/retailers': 'users',
      '/products': 'products',
      '/amcs': 'amcs',
      '/customers': 'customers',
      '/wallet': 'wallet',
      '/reports': 'reports',
      '/settings': 'settings',
    };

    const matchedKey =
      Object.entries(pathToKeyMap).find(([path]) => location.pathname.startsWith(path))?.[1] ??
      'dashboard';

    setActiveMenuKey(matchedKey);
  }, [location.pathname]);

  /** 🧭 Handle Sidebar Menu Clicks */
  const handleMenuClick = useCallback(
    (key, path) => {
      setActiveMenuKey(key);
      navigate(path);
    },
    [navigate]
  );

  /** 🧱 Conditional Layout Rendering */
  const isLoginPage = location.pathname === '/' || location.pathname === '/login';

  if (!isAuthenticated && isLoginPage) {
    return <div className="min-h-screen bg-gray-50">{routing}</div>;
  }

  if (!isAuthenticated && !isLoginPage) {
    return null; // prevents flashing while redirecting
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar activeKey={activeMenuKey} onMenuClick={handleMenuClick} />
      <div className="flex-1 flex flex-col">
        <Header user={user} />
        <main className="flex-1 overflow-auto p-4">{routing}</main>
      </div>
    </div>
  );
}

/** 🌍 App Root */
function App() {
  // Replace with your actual base path constant or string if needed
  const basePath = (window ).__BASE_PATH__ || '/';

  return (
    <BrowserRouter basename={basePath}>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
