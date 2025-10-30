import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../../components/base/Button';
import Input from '../../components/base/Input';
import { useToast } from '../../components/base/Toast';
import { postData } from '../../services/FetchNodeServices';

export default function ResetPassword() {
  const navigate = useNavigate();
  const { token } = useParams(); // ✅ Extract token from URL
  const { showToast, ToastContainer } = useToast();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();

    if (!password || !confirm) {
      return showToast('Please fill in all fields.', 'error');
    }
    if (password !== confirm) {
      return showToast('Passwords do not match.', 'error');
    }

    setLoading(true);
    try {
      const res = await postData('api/admin/reset-password', {
        token, // ✅ Send token to API
        new_password: password,
      });

      if (res?.status === true) {
        showToast('Password reset successfully!', 'success');
        sessionStorage.removeItem('resetEmail');
        setTimeout(() => navigate('/login'), 1000);
      } else {
        showToast(res?.message || 'Failed to reset password.', 'error');
      }
    } catch (err) {
      console.error('Reset error:', err);
      showToast('Error resetting password.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6 py-12">
      <ToastContainer />
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow space-y-6">
        <div className="text-center">
          <i className="ri-lock-unlock-line text-blue-600 text-4xl"></i>
          <h2 className="mt-4 text-2xl font-bold text-gray-900">Reset Password</h2>
          <p className="mt-2 text-sm text-gray-600">
            Create your new password below.
          </p>
        </div>

        <form onSubmit={handleReset} className="space-y-4">
          <Input
            label="New Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter new password"
            icon="ri-lock-line"
            required
          />

          <Input
            label="Confirm Password"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Confirm new password"
            icon="ri-lock-password-line"
            required
          />

          <Button
            type="submit"
            loading={loading}
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </Button>
        </form>
      </div>
    </div>
  );
}
