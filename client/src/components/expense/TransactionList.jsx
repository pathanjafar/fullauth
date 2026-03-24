import { useMemo, useState } from 'react';
import { CATEGORIES } from '../../utils/expense/categories';

export default function TransactionList({ expenses, onDelete }) {
  const [filterMonth, setFilterMonth] = useState('all');

  // Build unique month options
  const months = useMemo(() => {
    const set = new Set(expenses.map(e => e.date ? e.date.slice(0, 7) : ''));
    return [...set].sort().reverse();
  }, [expenses]);

  const filtered = useMemo(() => {
    if (filterMonth === 'all') return expenses;
    return expenses.filter(e => e.date && e.date.startsWith(filterMonth));
  }, [expenses, filterMonth]);

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
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <p>No transactions yet. Add one above!</p>
        </div>
      ) : (
        filtered.map(e => {
          const meta = CATEGORIES[e.category] || CATEGORIES.Other;
          return (
            <div className="tx-item" key={e._id}>
              <div className="tx-emoji">{meta.emoji}</div>
              <div className="tx-info">
                <strong>{e.title}</strong>
                <span>{e.category} · {formatDate(e.date)}</span>
              </div>
              <div className="tx-amount">
                -₹{e.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <button className="btn btn-danger-sm" onClick={() => onDelete(e._id)}>
                ✕
              </button>
            </div>
          );
        })
      )}
    </>
  );
}
