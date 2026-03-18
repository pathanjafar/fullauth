import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser, getMe } from '../api/auth';
import { useAuth } from '../context/AuthContext';

export default function Register() {
    const [form, setForm]     = useState({ name: '', email: '', password: '', role: 'user' });
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
            const res = await registerUser(form);
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
                    <div className="brand-icon">✨</div>
                    <h1>Create Account</h1>
                    <p>Join the platform today</p>
                </div>

                {error && <div className="alert alert-error">⚠ {error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">Full Name</label>
                        <input id="name" type="text" name="name" placeholder="John Doe"
                            value={form.name} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input id="email" type="email" name="email" placeholder="you@example.com"
                            value={form.email} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input id="password" type="password" name="password" placeholder="Min. 6 characters"
                            value={form.password} onChange={handleChange} required minLength={6} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="role">Account Role</label>
                        <input id="role" as="select" name="role" placeholder="user or admin"
                            value={form.role} onChange={handleChange} />
                    </div>
                    <button id="register-btn" type="submit" className="btn btn-primary" disabled={loading}>
                        {loading && <span className="spinner" />}
                        {loading ? 'Creating account...' : 'Create Account'}
                    </button>
                </form>

                <div className="link-row">
                    Already have an account?<Link to="/login">Sign in</Link>
                </div>
            </div>
        </div>
    );
}
