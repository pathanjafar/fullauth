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
            <div className="bg-orb" />
            <div className="auth-card">
                <div className="auth-header">
                    <div className="auth-brand">Pathan <span className="brand-accent">Jafar</span></div>
                    <div className="auth-subtitle">Welcome back! Please sign in.</div>
                </div>

                {error && <div className="alert alert-error">⚠ {error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input type="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <label style={{ marginBottom: 0 }}>Password</label>
                            <Link to="/forgot-password" style={{ fontSize: '0.75rem', fontWeight: 600, color: '#1D9E75', textDecoration: 'none' }}>Forgot?</Link>
                        </div>
                        <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <button type="submit" className="btn" disabled={loading}>
                        {loading && <div className="spinner" />}
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div className="link-row">
                    Don't have an account? <Link to="/register">Create one</Link>
                </div>
            </div>
        </div>
    );
}
