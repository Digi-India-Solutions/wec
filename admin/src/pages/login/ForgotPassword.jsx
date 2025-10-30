import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/base/Button';
import Input from '../../components/base/Input';
import { useToast } from '../../components/base/Toast';
import { postData } from '../../services/FetchNodeServices';

export default function ForgotPassword({ emails }) {
    const navigate = useNavigate();
    const { showToast, ToastContainer } = useToast();
    const [email, setEmail] = useState(emails || '');
    const [loading, setLoading] = useState(false);

    const handleSendOtp = async (e) => {
        e.preventDefault();
        if (!email) return showToast('Please enter your email', 'error');
        setLoading(true);
        try {
            const res = await postData('api/admin/send-reset-password-email', { email });
            if (res.status === true) {
                showToast('OTP sent to your email', 'success');
                sessionStorage.setItem('resetEmail', email);
                setTimeout(() => navigate('/verify-otp'), 1000);
            } else {
                showToast(res.message || 'Failed to send OTP', 'error');
            }
        } catch (err) {
            showToast('Something went wrong', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6 py-12">
            <ToastContainer />
            <div className="max-w-md w-full bg-white p-8 rounded-lg shadow space-y-6">
                <div className="text-center">
                    <i className="ri-lock-password-line text-blue-600 text-4xl"></i>
                    <h2 className="mt-4 text-2xl font-bold text-gray-900">Forgot Password</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Enter your registered email to receive an OTP.
                    </p>
                </div>

                <form onSubmit={handleSendOtp} className="space-y-4">
                    <Input
                        label="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        icon="ri-mail-line"
                        required
                    />
                    <Button type="submit" loading={loading} disabled={loading} className="w-full">
                        {loading ? 'Sending OTP...' : 'Send OTP'}
                    </Button>
                </form>
            </div>
        </div>
    );
}
