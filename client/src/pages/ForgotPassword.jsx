import { useState } from 'react';
import { Link } from 'react-router-dom';
import * as auth from '../api/auth';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);
        try {
            await auth.forgotPassword({ email });
            setSuccess('If that email exists, a reset link has been sent.');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send reset link');
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
                    <div className="auth-subtitle">Forgot password? No worries, we'll send a link.</div>
                </div>

                {error && <div className="alert alert-error">⚠ {error}</div>}
                {success && <div className="alert alert-success">✓ {success}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input type="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <button type="submit" className="btn" disabled={loading}>
                        {loading && <div className="spinner" />}
                        {loading ? 'Sending link...' : 'Send Reset Link'}
                    </button>
                </form>

                <div className="link-row">
                    Back to <Link to="/login">Sign in</Link>
                </div>
            </div>
        </div>
    );
}
