import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser, getMe } from '../api/auth';
import { useAuth } from '../context/AuthContext';

export default function Login() {
    const [form, setForm]     = useState({ email: '', password: '' });
    const [error, setError]   = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate  = useNavigate();

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await loginUser(form);
            const token = res.data.token;
            localStorage.setItem('token', token);
            const meRes = await getMe();
            login(token, meRes.data.data);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-card">
                <div className="brand">
                    <div className="brand-icon">🔐</div>
                    <h1>Welcome Back</h1>
                    <p>Sign in to your account</p>
                </div>

                {error && <div className="alert alert-error">⚠ {error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input id="email" type="email" name="email" placeholder="you@example.com"
                            value={form.email} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input id="password" type="password" name="password" placeholder="••••••••"
                            value={form.password} onChange={handleChange} required />
                    </div>
                    <button id="login-btn" type="submit" className="btn btn-primary" disabled={loading}>
                        {loading && <span className="spinner" />}
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div className="link-row">
                    Don't have an account?<Link to="/register">Create one</Link>
                </div>
            </div>
        </div>
    );
}
