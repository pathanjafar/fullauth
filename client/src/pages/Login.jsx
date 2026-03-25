import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as auth from '../api/auth';
import { useAuth } from '../context/AuthContext';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await auth.login({ email, password });
            const token = res.data.token;
            localStorage.setItem('token', token);
            const meRes = await auth.getMe();
            login(token, meRes.data.data);
            navigate('/dashboard');
        } catch (err) {
            if (err.code === 'ECONNABORTED') {
                setError('Login timed out. Is the backend server running?');
            } else {
                setError(err.response?.data?.message || 'Login failed. Please check connectivity.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <div className="auth-brand" style={{ fontSize: '2.5rem', fontWeight: 800 }}>Pathan <span className="text-gradient">Jafar</span></div>
                    <div className="auth-subtitle" style={{ fontSize: '1rem', marginTop: '12px', color: 'var(--text-muted)' }}>Secure Access · Cloud Savings</div>
                </div>

                {error && <div className="alert alert-error" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#fca5a5', padding: '1rem', borderRadius: '16px', marginBottom: '1.5rem', fontSize: '0.875rem' }}>⚠ {error}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '10px', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>EMAIL ADDRESS</label>
                        <input className="input-elegant" type="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>PASSWORD</label>
                            <Link to="/forgot-password" style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', textDecoration: 'none' }}>Forgot password?</Link>
                        </div>
                        <input className="input-elegant" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <button type="submit" className="btn-premium btn-primary-gradient" disabled={loading} style={{ marginTop: '0.5rem' }}>
                        {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '2.5rem', fontSize: '0.938rem', color: 'var(--text-dim)' }}>
                    Don't have an account? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 800, textDecoration: 'none', marginLeft: '6px' }}>Create one</Link>
                </div>
            </div>
        </div>
    );
}
