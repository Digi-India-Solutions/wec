
import Modal from './Modal';
import Button from './Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  loading?: boolean;
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'info',
  loading = false
}: ConfirmDialogProps) {
  const icons = {
    danger: 'ri-error-warning-line',
    warning: 'ri-alert-line',
    info: 'ri-information-line'
  };

  const colors = {
    danger: 'text-red-600',
    warning: 'text-yellow-600',
    info: 'text-blue-600'
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="text-center">
        <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4`}>
          <i className={`${icons[variant]} ${colors[variant]} text-xl w-6 h-6 flex items-center justify-center`}></i>
        </div>
        
        <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-500 mb-6">{message}</p>
        
        <div className="flex space-x-3 justify-center">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            onClick={onConfirm}
            loading={loading}
            disabled={loading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
