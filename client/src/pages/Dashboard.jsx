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
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <nav className="dashboard-nav">
                <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>Pathan <span style={{ color: '#1D9E75' }}>Jafar</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <a href="https://pathanjafar-61.vercel.app/" target="_blank" rel="noopener noreferrer" className="link" style={{ fontSize: '0.875rem' }}>Portfolio</a>
                    <a href="/expenses" className="link" style={{ fontSize: '0.875rem', color: '#1D9E75' }}>Expenses</a>
                    <a href="/pathanjafar.pdf" target="_blank" className="link" style={{ fontSize: '0.875rem' }}>Resume PDF</a>
                    <button className="link" onClick={handleLogout} style={{ fontSize: '0.875rem', color: '#ef4444' }}>Logout</button>
                </div>
            </nav>

            <div className="dashboard-content">
                <div style={{ marginBottom: '2.5rem' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Hi, {user?.name} 👋</h1>
                    <p style={{ color: '#6b7280' }}>Welcome to your secure account dashboard.</p>
                </div>

                <div className="stats-grid">
                    <div className="stat-card">
                        <div style={{ color: '#6b7280', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>Email Address</div>
                        <div style={{ fontSize: '1.125rem', fontWeight: 700 }}>{user?.email}</div>
                    </div>
                    <div className="stat-card">
                        <div style={{ color: '#6b7280', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>Account Role</div>
                        <div style={{ fontSize: '1.125rem', fontWeight: 700, textTransform: 'capitalize' }}>{user?.role}</div>
                    </div>
                    <div className="stat-card">
                        <div style={{ color: '#6b7280', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>Member Since</div>
                        <div style={{ fontSize: '1.125rem', fontWeight: 700 }}>{joinedDate}</div>
                    </div>
                    <div className="stat-card">
                        <div style={{ color: '#6b7280', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>Account Status</div>
                        <div style={{ fontSize: '1.125rem', fontWeight: 700, color: '#1D9E75' }}>Verified ✅</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
