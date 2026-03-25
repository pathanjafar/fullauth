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
    <div className="expense-tracker-page">
      {/* Header */}
      <header className="app-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button onClick={() => navigate('/dashboard')} className="btn btn-outline" style={{ width: 'auto' }}>← Back</button>
            <h1>💸 <span>Expense</span> Tracker</h1>
        </div>
        <div className="header-actions">
           <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>AI Powered & PhonePe Sync</span>
        </div>
      </header>

      {/* Summary Card */}
      <div className="summary-card card">
        <h3>Current Month Total</h3>
        <div className="total">
          ₹{monthlyTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </div>
      </div>

      {/* Spending Trends */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="section-title">📈 30-Day Spending Trend</div>
        <TrendChart expenses={expenses} />
      </div>

      {/* Dashboard Grid */}
      <div className="dashboard-grid">
        {/* Left — Form + SMS */}
        <div className="card">
          <div className="section-title">➕ Add Transaction</div>
          <ExpenseForm onAdd={addExpense} />
          <SmsParse onAdd={addExpense} />
        </div>

        {/* Right — Insights & Reports */}
        <div className="card">
          <div className="section-title">📊 Insights</div>
          <InsightsPanel
            expenses={expenses}
            budget={budget}
            onBudgetChange={handleBudgetChange}
          />

          <div className="sms-section" style={{ marginTop: 24 }}>
            <div className="section-title">📄 Report Generation</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
              <div className="form-group">
                <label>From</label>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
              </div>
              <div className="form-group">
                <label>To</label>
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <button type="button" className="btn btn-outline" onClick={handleDownloadPdf}>
                📥 Download PDF
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
              className="btn btn-secondary" 
              style={{ marginTop: 10, fontSize: '0.8rem' }} 
              onClick={exportCSV}
            >
              📊 Export CSV (Selected Range)
            </button>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="card" style={{ marginTop: 24 }}>
        <TransactionList expenses={expenses} onDelete={deleteExpense} />
      </div>
    </div>
  );
}
