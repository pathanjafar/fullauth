import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as auth from '../api/auth';
import { useAuth } from '../context/AuthContext';

export default function Register() {
    const [form, setForm] = useState({ name: '', email: '', password: '', otp: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSendOTP = async () => {
        if (!form.email) return setError('Email is required to send OTP');
        setError('');
        setOtpLoading(true);
        try {
            await auth.sendOTP({ email: form.email, type: 'register' });
            setOtpSent(true);
            setSuccess('Verification code sent to your email!');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send OTP');
        } finally {
            setOtpLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await auth.register(form);
            const token = res.data.token;
            localStorage.setItem('token', token);
            const meRes = await auth.getMe();
            login(token, meRes.data.data);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="bg-orb" />
            <div className="auth-card">
                <div className="auth-header">
                    <div className="auth-brand">Pathan <span className="brand-accent">Jafar</span></div>
                    <div className="auth-subtitle">Create your account to get started.</div>
                </div>

                {error && <div className="alert alert-error">⚠ {error}</div>}
                {success && <div className="alert alert-success">✓ {success}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Full Name</label>
                        <input name="name" type="text" placeholder="John Doe" value={form.name} onChange={handleChange} required disabled={otpSent} />
                    </div>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input name="email" type="email" placeholder="name@example.com" value={form.email} onChange={handleChange} required disabled={otpSent} />
                    </div>
                    
                    {!otpSent ? (
                        <button type="button" onClick={handleSendOTP} className="btn" disabled={otpLoading}>
                            {otpLoading && <div className="spinner" /> }
                            {otpLoading ? 'Sending...' : 'Send Verification Code'}
                        </button>
                    ) : (
                        <>
                            <div className="form-group">
                                <label>Password</label>
                                <input name="password" type="password" placeholder="••••••••" value={form.password} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label>Verification Code</label>
                                <input name="otp" type="text" placeholder="6-digit code" value={form.otp} onChange={handleChange} required maxLength="6" />
                            </div>
                            <button type="submit" className="btn" disabled={loading}>
                                {loading && <div className="spinner" />}
                                {loading ? 'Creating Account...' : 'Complete Signup'}
                            </button>
                        </>
                    )}
                </form>

                <div className="link-row">
                    Already have an account? <Link to="/login">Sign in</Link>
                </div>
            </div>
        </div>
    );
}
