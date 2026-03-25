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
            <div className="auth-card">
                <div className="auth-header" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <div className="auth-brand" style={{ fontSize: '2.5rem', fontWeight: 800 }}>Pathan <span className="text-gradient">Jafar</span></div>
                    <div className="auth-subtitle" style={{ fontSize: '1rem', marginTop: '12px', color: 'var(--text-muted)' }}>Create your premium account.</div>
                </div>

                {error && <div className="alert alert-error" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#fca5a5', padding: '1rem', borderRadius: '16px', marginBottom: '1.5rem' }}>⚠ {error}</div>}
                {success && <div className="alert alert-success" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', color: '#6ee7b7', padding: '1rem', borderRadius: '16px', marginBottom: '1.5rem' }}>✓ {success}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {!otpSent ? (
                        <>
                            <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '8px', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>FULL NAME</label>
                                <input name="name" className="input-elegant" type="text" placeholder="John Doe" value={form.name} onChange={handleChange} required />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '8px', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>EMAIL ADDRESS</label>
                                <input name="email" className="input-elegant" type="email" placeholder="name@example.com" value={form.email} onChange={handleChange} required />
                            </div>
                            <button type="button" onClick={handleSendOTP} className="btn-premium btn-primary-gradient" disabled={otpLoading} style={{ marginTop: '0.5rem' }}>
                                {otpLoading ? 'Sending Code...' : 'Get Verification Code'}
                            </button>
                        </>
                    ) : (
                        <>
                            <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '8px', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>CREATE PASSWORD</label>
                                <input name="password" className="input-elegant" type="password" placeholder="••••••••" value={form.password} onChange={handleChange} required />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '8px', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>VERIFICATION CODE</label>
                                <input name="otp" className="input-elegant" type="text" placeholder="6-digit code" value={form.otp} onChange={handleChange} required maxLength="6" />
                            </div>
                            <button type="submit" className="btn-premium btn-primary-gradient" disabled={loading} style={{ marginTop: '0.5rem' }}>
                                {loading ? 'Finalizing Setup...' : 'Complete Registration'}
                            </button>
                        </>
                    )}
                </form>

                <div style={{ textAlign: 'center', marginTop: '2.5rem', fontSize: '0.938rem', color: 'var(--text-dim)' }}>
                    Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 800, textDecoration: 'none', marginLeft: '6px' }}>Sign In</Link>
                </div>
            </div>
        </div>
    );
}
