import { useMemo, useState } from 'react';
import { CATEGORIES } from '../../utils/expense/categories';

export default function TransactionList({ expenses, onDelete }) {
  const [filterMonth, setFilterMonth] = useState('all');

  const safeExpenses = Array.isArray(expenses) ? expenses : [];

  // Build unique month options
  const months = useMemo(() => {
    const set = new Set(safeExpenses.map(e => e.date ? e.date.slice(0, 7) : ''));
    return [...set].sort().reverse();
  }, [safeExpenses]);

  const filtered = useMemo(() => {
    if (filterMonth === 'all') return safeExpenses;
    return safeExpenses.filter(e => e.date && e.date.startsWith(filterMonth));
  }, [safeExpenses, filterMonth]);

  function formatDate(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function formatMonthLabel(m) {
    const [y, mo] = m.split('-');
    return new Date(y, mo - 1).toLocaleString('default', { month: 'long', year: 'numeric' });
  }

  return (
    <>
      <div className="history-header">
        <div className="section-title">📜 Transaction History</div>
        <div className="history-controls">
          <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)}>
            <option value="all">All Months</option>
            {months.map(m => (
              <option key={m} value={m}>{formatMonthLabel(m)}</option>
            ))}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', opacity: 0.5 }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
          <p style={{ fontWeight: 600 }}>No transactions yet.</p>
        </div>
      ) : (
        <div className="tx-list">
          {filtered.map(e => {
            const meta = CATEGORIES[e.category] || CATEGORIES.Other;
            return (
              <div className="tx-item-new" key={e._id}>
                <div className="tx-icon">{meta.emoji}</div>
                <div className="tx-body">
                  <span className="tx-title">{e.title}</span>
                  <span className="tx-meta">{e.category} • {formatDate(e.date)}</span>
                </div>
                <div className="tx-price">-₹{e.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                <button 
                  className="btn-premium" 
                  onClick={() => onDelete(e._id)}
                  style={{ width: '32px', height: '32px', padding: 0, borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.2)', boxShadow: 'none' }}
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
