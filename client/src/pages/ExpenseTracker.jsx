import { useState, useEffect } from 'react';
import { API } from '../api/auth';
import ExpenseForm from '../components/expense/ExpenseForm';
import SmsParse from '../components/expense/SmsParse';
import InsightsPanel from '../components/expense/InsightsPanel';
import TransactionList from '../components/expense/TransactionList';
import WhatsAppShare from '../components/expense/WhatsAppShare';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { generatePdfReport } from '../utils/expense/pdfGenerator';
import { useNavigate } from 'react-router-dom';
import TrendChart from '../components/expense/TrendChart';

export default function ExpenseTracker() {
  const showToast = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [expenses, setExpenses] = useState([]);
  const [budget, setBudget] = useState(10000);
  const [loading, setLoading] = useState(true);

  // Date range for reports
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1); // Start of current month
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  const token = localStorage.getItem('token');

  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  async function fetchExpenses() {
    try {
      const res = await API.get('/expenses');
      setExpenses(res.data.data);
      setBudget(res.data.budget);
      setLoading(false);
    } catch (err) {
      showToast('Error fetching expenses', 'error');
      setLoading(false);
    }
  }

  // Handlers
  async function addExpense(expense) {
    try {
      const res = await API.post('/expenses', expense);
      setExpenses(prev => [res.data.data, ...prev]);
      showToast('Expense added');
    } catch (err) {
      showToast('Error adding expense', 'error');
    }
  }

  async function deleteExpense(id) {
    try {
      await API.delete(`/expenses/${id}`);
      setExpenses(prev => prev.filter(e => e._id !== id));
      showToast('Deleted', 'info');
    } catch (err) {
      showToast('Error deleting expense', 'error');
    }
  }

  async function handleBudgetChange(newBudget) {
    try {
      const res = await API.put('/expenses/budget', { budget: newBudget });
      setBudget(res.data.budget);
      showToast('Budget updated');
    } catch (err) {
      showToast('Error updating budget', 'error');
    }
  }

  function handleDownloadPdf() {
    const safeExpenses = Array.isArray(expenses) ? expenses : [];
    const filtered = safeExpenses.filter(e => {
      const d = e.date;
      return d && (!startDate || d >= startDate) && (!endDate || d <= endDate);
    });
    if (filtered.length === 0) return showToast('No data for this range', 'error');
    generatePdfReport(filtered, startDate, endDate);
    showToast('PDF report generated!');
  }

  function exportCSV() {
    const safeExpenses = Array.isArray(expenses) ? expenses : [];
    const filtered = safeExpenses.filter(e => {
      const d = e.date;
      return d && (!startDate || d >= startDate) && (!endDate || d <= endDate);
    });
    if (filtered.length === 0) return showToast('No data for this range', 'error');

    const header = 'Title,Amount,Category,Date';
    const rows = filtered.map(e => `"${e.title}",${e.amount},"${e.category}","${e.date}"`);
    const csv = [header, ...rows].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `expenses_${startDate}_to_${endDate}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('CSV exported!');
  }

  if (loading) return <div className="loading">Loading...</div>;

  const currentMonth = new Date().toISOString().slice(0, 7);
  const safeExpenses = Array.isArray(expenses) ? expenses : [];
  
  const monthlyTotal = safeExpenses
    .filter(e => e.date && e.date.startsWith(currentMonth))
    .reduce((s, e) => s + e.amount, 0);

  return (
    <div className="container-wide" style={{ paddingBottom: '6rem' }}>
      {/* Header */}
      <header className="app-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2.5rem 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <button onClick={() => navigate('/dashboard')} className="btn-premium" style={{ height: '48px', width: '48px', padding: 0 }}>←</button>
            <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.25rem)', fontWeight: 800, letterSpacing: '-0.02em' }}>💸 <span className="text-gradient">Expense</span> Intelligence</h1>
        </div>
        <div className="header-actions" style={{ textAlign: 'right', display: 'none' /* Hidden on mobile if needed */ }}>
           <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.1em' }}>AI ENGINE ACTIVE</div>
           <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{user?.name}'s Workspace</div>
        </div>
      </header>

      {/* Summary Banner */}
      <section className="summary-banner">
        <div className="content">
            <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Live Spending Analysis</p>
            <h2 style={{ fontSize: 'clamp(2.5rem, 8vw, 4.5rem)', fontWeight: 800, lineHeight: 1 }}>₹{monthlyTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h2>
            <div style={{ marginTop: '2.5rem', display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
                <div className="stat-card-mini">
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 700, marginBottom: '4px' }}>MONTHLY LIMIT</p>
                    <p style={{ fontSize: '1.25rem', fontWeight: 800 }}>₹{budget.toLocaleString('en-IN')}</p>
                </div>
                <div className="stat-card-mini">
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 700, marginBottom: '4px' }}>DAILY VELOCITY</p>
                    <p style={{ fontSize: '1.25rem', fontWeight: 800 }}>₹{(monthlyTotal / 30).toFixed(0)}</p>
                </div>
                <div className="stat-card-mini" style={{ borderLeft: `4px solid ${monthlyTotal > budget ? '#f87171' : 'var(--primary)'}` }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 700, marginBottom: '4px' }}>BUDGET HEALTH</p>
                    <p style={{ fontSize: '1.25rem', fontWeight: 800, color: monthlyTotal > budget ? '#f87171' : 'var(--primary)' }}>{monthlyTotal > budget ? 'Warning' : 'Excellent'}</p>
                </div>
            </div>
        </div>
      </section>

      {/* Main Dashboard Layout */}
      <main className="dashboard-layout">
        {/* Left Column — History & Trends */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="card-premium">
                <div className="section-title"><span>📈</span> 30-Day Spending Trend</div>
                <TrendChart expenses={expenses} />
            </div>

            <div className="card-premium">
                <TransactionList expenses={expenses} onDelete={deleteExpense} />
            </div>
        </div>

        {/* Right Column — Insights & Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="card-premium">
                <div className="section-title"><span>📊</span> Financial Insights</div>
                <InsightsPanel
                    expenses={expenses}
                    budget={budget}
                    onBudgetChange={handleBudgetChange}
                />
            </div>

            <div className="card-premium">
                <div className="section-title"><span>➕</span> Add Transaction</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <ExpenseForm onAdd={addExpense} />
                    <div style={{ height: '1px', background: 'rgba(0,0,0,0.05)' }}></div>
                    <SmsParse onAdd={addExpense} />
                </div>
            </div>

            <div className="card-premium">
                <div className="section-title"><span>📄</span> Export Reports</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <div>
                            <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>From</label>
                            <input type="date" className="input-elegant" value={startDate} onChange={e => setStartDate(e.target.value)} />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>To</label>
                            <input type="date" className="input-elegant" value={endDate} onChange={e => setEndDate(e.target.value)} />
                        </div>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <button type="button" className="btn-premium" onClick={handleDownloadPdf} style={{ background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--border-glass)' }}>
                            PDF Document
                        </button>
                        <WhatsAppShare 
                            expenses={expenses} 
                            budget={budget} 
                            startDate={startDate} 
                            endDate={endDate} 
                        />
                    </div>
                    
                    <button 
                        type="button" 
                        className="btn-premium" 
                        style={{ fontSize: '0.875rem', width: '100%', background: 'transparent', border: '1px solid rgba(255,255,255,0.05)', height: '44px' }}
                        onClick={exportCSV}
                    >
                        Export CSV Spreadsheet
                    </button>
                </div>
            </div>
        </div>
      </main>
    </div>
  );
}
