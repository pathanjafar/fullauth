import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Dashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [expenseData, setExpenseData] = useState({ total: 0, budget: 0, loading: true });

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    useEffect(() => {
        const fetchExpenseSummary = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('/api/expenses', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                const currentMonth = new Date().toISOString().slice(0, 7);
                const expenses = res.data?.data || [];
                const total = Array.isArray(expenses) 
                    ? expenses.filter(e => e.date && e.date.startsWith(currentMonth)).reduce((sum, e) => sum + e.amount, 0)
                    : 0;
                
                setExpenseData({
                    total,
                    budget: res.data?.budget || 0,
                    loading: false
                });
            } catch (err) {
                console.error('Error fetching expense summary:', err);
                setExpenseData(prev => ({ ...prev, loading: false }));
            }
        };

        fetchExpenseSummary();
    }, []);

    const joinedDate = user?.createdAt
        ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : '—';

    const remainingBudget = expenseData.budget - expenseData.total;
    const budgetStatus = expenseData.budget > 0 
        ? (expenseData.total > expenseData.budget ? 'Over Budget 🚨' : 'On Track ✅')
        : 'No Budget Set';

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
                <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Hi, {user?.name} 👋</h1>
                        <p style={{ color: '#6b7280' }}>Welcome to your secure account dashboard.</p>
                    </div>
                    <button 
                        onClick={() => navigate('/expenses')}
                        className="btn" 
                        style={{ width: 'auto', height: '44px', padding: '0 20px', fontSize: '0.875rem' }}
                    >
                        💸 Manage Expenses
                    </button>
                </div>

                <div className="stats-grid">
                    <div className="stat-card">
                        <div style={{ color: '#6b7280', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>Email Address</div>
                        <div style={{ fontSize: '1.125rem', fontWeight: 700 }}>{user?.email}</div>
                    </div>
                    <div className="stat-card">
                        <div style={{ color: '#6b7280', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>Account Status</div>
                        <div style={{ fontSize: '1.125rem', fontWeight: 700, color: '#1D9E75' }}>Verified ✅</div>
                    </div>
                    
                    {/* Expense Tracker Highlights */}
                    <div className="stat-card" style={{ borderLeft: '4px solid var(--primary)' }}>
                        <div style={{ color: '#6b7280', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>Monthly Spending</div>
                        <div style={{ fontSize: '1.125rem', fontWeight: 700 }}>
                            {expenseData.loading ? '...' : `₹${expenseData.total.toLocaleString('en-IN')}`}
                        </div>
                    </div>
                    <div className="stat-card" style={{ borderLeft: '4px solid ' + (remainingBudget < 0 ? '#ef4444' : '#1D9E75') }}>
                        <div style={{ color: '#6b7280', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>Budget Status</div>
                        <div style={{ fontSize: '1.125rem', fontWeight: 700 }}>
                            {expenseData.loading ? '...' : budgetStatus}
                        </div>
                    </div>

                    <div className="stat-card">
                        <div style={{ color: '#6b7280', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>Account Role</div>
                        <div style={{ fontSize: '1.125rem', fontWeight: 700, textTransform: 'capitalize' }}>{user?.role}</div>
                    </div>
                    <div className="stat-card">
                        <div style={{ color: '#6b7280', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>Member Since</div>
                        <div style={{ fontSize: '1.125rem', fontWeight: 700 }}>{joinedDate}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
