import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { API } from '../api/auth';

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
                const res = await API.get('/expenses');
                
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
        <div className="container-wide" style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingTop: '1rem' }}>
            <nav className="dashboard-nav" style={{ background: 'transparent', border: 'none', padding: '1.5rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>Pathan <span className="text-gradient">Jafar</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                    <a href="https://pathanjafar-61.vercel.app/" target="_blank" rel="noopener noreferrer" className="link" style={{ fontSize: '0.938rem', fontWeight: 600, color: 'var(--text-muted)', textDecoration: 'none' }}>Portfolio</a>
                    <a href="/expenses" className="link" style={{ fontSize: '0.938rem', fontWeight: 600, color: 'var(--primary)', textDecoration: 'none' }}>Expenses</a>
                    <button className="link" onClick={handleLogout} style={{ fontSize: '0.938rem', fontWeight: 600, color: '#f87171', background: 'none', border: 'none', cursor: 'pointer' }}>Logout</button>
                </div>
            </nav>

            <div style={{ padding: '2rem 0' }}>
                <div style={{ marginBottom: '3.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
                    <div>
                        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>Hi, {user?.name} 👋</h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem' }}>Your financial data is encrypted and secure.</p>
                    </div>
                    <button 
                        onClick={() => navigate('/expenses')}
                        className="btn-premium btn-primary-gradient" 
                        style={{ height: '56px', padding: '0 28px' }}
                    >
                        💸 AI Expense Tracker
                    </button>
                </div>

                <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
                    <div className="card-premium">
                        <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>MONTHLY SPENDING</div>
                        <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
                            {expenseData.loading ? '...' : `₹${expenseData.total.toLocaleString('en-IN')}`}
                        </div>
                        <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                             <span style={{ fontSize: '0.875rem', fontWeight: 700, color: remainingBudget < 0 ? '#f87171' : 'var(--primary)', background: remainingBudget < 0 ? 'rgba(248, 113, 113, 0.1)' : 'rgba(16, 185, 129, 0.1)', padding: '4px 10px', borderRadius: '8px' }}>
                                {expenseData.loading ? 'Calculating...' : budgetStatus}
                             </span>
                        </div>
                    </div>

                    <div className="card-premium">
                        <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>ACTIVE BUDGET</div>
                        <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)' }}>₹{expenseData.budget.toLocaleString('en-IN')}</div>
                        <p style={{ marginTop: '16px', fontSize: '0.938rem', color: 'var(--text-muted)' }}>
                            Remaining Space: <span style={{ color: remainingBudget < 0 ? '#f87171' : 'var(--text-main)', fontWeight: 700 }}>₹{remainingBudget.toLocaleString('en-IN')}</span>
                        </p>
                    </div>

                    <div className="card-premium">
                        <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>SECURE ACCESS</div>
                        <div style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '6px', wordBreak: 'break-all' }}>{user?.email}</div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ width: '8px', height: '8px', background: 'var(--primary)', borderRadius: '50%' }}></span>
                            Tier: Professional · Active since {new Date(user?.createdAt).getFullYear()}
                        </div>
                    </div>
                </div>

                <div className="card-premium" style={{ marginTop: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', borderStyle: 'dashed', flexWrap: 'wrap', gap: '1.5rem' }}>
                    <div>
                        <h3 style={{ fontWeight: 800, fontSize: '1.25rem', marginBottom: '4px' }}>Professional Portfolio</h3>
                        <p style={{ color: 'var(--text-dim)', fontSize: '0.938rem' }}>View Pathan Jafar's full stack expertise and recent projects.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <a href="/pathanjafar.pdf" target="_blank" className="btn-premium" style={{ background: 'rgba(255,255,255,0.05)', color: 'white' }}>
                            Resume PDF
                        </a>
                        <a href="https://pathanjafar-61.vercel.app/" target="_blank" rel="noopener noreferrer" className="btn-premium btn-primary-gradient">
                            Visit Portfolio
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
