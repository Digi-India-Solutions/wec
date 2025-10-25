
import { useEffect, useState } from 'react';
import { clsx } from 'clsx';

export default function Toast({ message, type, duration = 5000, onClose }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: 'ri-check-line',
    error: 'ri-close-line',
    warning: 'ri-alert-line',
    info: 'ri-information-line'
  };

  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500'
  };

  return (
    <div className={clsx(
      'fixed top-4 right-4 z-50 flex items-center p-4 rounded-lg shadow-lg text-white transition-all duration-300',
      colors[type],
      isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    )}>
      <i className={`${icons[type]} mr-3 w-5 h-5 flex items-center justify-center`}></i>
      <span className="text-sm font-medium">{message}</span>
      <button
        onClick={() => {
          setIsVisible(false);
          setTimeout(onClose, 300);
        }}
        className="ml-4 text-white hover:text-gray-200 w-4 h-4 flex items-center justify-center cursor-pointer"
      >
        <i className="ri-close-line w-4 h-4 flex items-center justify-center"></i>
      </button>
    </div>
  );
}

// Toast Manager Hook
export function useToast() {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const ToastContainer = () => (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );

  return {
    showToast,
    ToastContainer,
    success: (message) => showToast(message, 'success'),
    error: (message) => showToast(message, 'error'),
    warning: (message) => showToast(message, 'warning'),
    info: (message) => showToast(message, 'info')
  };
}
