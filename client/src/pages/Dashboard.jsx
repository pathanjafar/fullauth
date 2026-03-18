import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const joinedDate = user?.createdAt
        ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : '—';

    return (
        <div className="dashboard-wrapper">
            <nav className="navbar">
                <div className="navbar-brand">
                    <div className="nav-logo">🔐</div>
                    <span>FullAuth</span>
                </div>
                <button id="logout-btn" className="logout-btn" onClick={handleLogout}>Logout</button>
            </nav>

            <div className="dashboard-content">
                <div className="welcome-banner">
                    <div className="welcome-text">
                        <h2>Welcome back, {user?.name} 👋</h2>
                        <p>You're successfully authenticated. Here's your account overview.</p>
                    </div>
                    <span className={`badge ${user?.role === 'admin' ? 'badge-admin' : 'badge-user'}`}>
                        {user?.role}
                    </span>
                </div>

                <div className="cards-grid">
                    <div className="info-card">
                        <div className="info-card-icon icon-indigo">👤</div>
                        <div className="info-card-label">Full Name</div>
                        <div className="info-card-value">{user?.name}</div>
                    </div>
                    <div className="info-card">
                        <div className="info-card-icon icon-green">📧</div>
                        <div className="info-card-label">Email Address</div>
                        <div className="info-card-value">{user?.email}</div>
                    </div>
                    <div className="info-card">
                        <div className="info-card-icon icon-purple">🛡️</div>
                        <div className="info-card-label">Role</div>
                        <div className="info-card-value" style={{ textTransform: 'capitalize' }}>{user?.role}</div>
                    </div>
                    <div className="info-card">
                        <div className="info-card-icon icon-indigo">📅</div>
                        <div className="info-card-label">Member Since</div>
                        <div className="info-card-value">{joinedDate}</div>
                    </div>
                    <div className="info-card">
                        <div className="info-card-icon icon-green">🔑</div>
                        <div className="info-card-label">User ID</div>
                        <div className="info-card-value" style={{ fontSize: '0.8rem' }}>{user?._id}</div>
                    </div>
                    <div className="info-card">
                        <div className="info-card-icon icon-purple">✅</div>
                        <div className="info-card-label">Account Status</div>
                        <div className="info-card-value" style={{ color: '#6ee7b7' }}>Active</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
