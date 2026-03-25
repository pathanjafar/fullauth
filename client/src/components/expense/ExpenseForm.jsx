import { useState } from 'react';
import { CATEGORIES, CATEGORY_LIST } from '../../utils/expense/categories';
import { predictCategory, hasApiKey } from '../../utils/expense/ai';
import { useToast } from '../../context/ToastContext';

export default function ExpenseForm({ onAdd }) {
  const showToast = useToast();
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [predicting, setPredicting] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (!title || !amount || !category) return;

    onAdd({
      title,
      amount: parseFloat(amount),
      category,
      date,
    });

    setTitle('');
    setAmount('');
    setCategory('');
    setDate(new Date().toISOString().split('T')[0]);
    showToast('Expense saved!');
  }

  async function handlePredict() {
    if (!title) return showToast('Enter a title first', 'error');
    if (!hasApiKey()) return showToast('Add VITE_GEMINI_API_KEY to .env', 'error');

    setPredicting(true);
    try {
      const cat = await predictCategory(title);
      if (CATEGORY_LIST.includes(cat)) {
        setCategory(cat);
        showToast(`AI suggests: ${CATEGORIES[cat].emoji} ${cat}`, 'info');
      } else {
        setCategory('Other');
        showToast(`AI returned "${cat}", defaulting to Other`, 'info');
      }
    } catch (err) {
      showToast('AI error: ' + err.message, 'error');
    } finally {
      setPredicting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div>
        <label htmlFor="title" style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '6px', color: 'var(--text-muted)' }}>Transaction Title</label>
        <div style={{ display: 'flex', gap: '8px' }}>
            <input
                id="title"
                type="text"
                className="input-elegant"
                placeholder="e.g. Starbucks Coffee"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
            />
            <button
                type="button"
                className="btn-premium"
                style={{ height: '54px', width: '54px', padding: 0, background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--border-glass)', color: 'var(--primary)', boxShadow: 'none' }}
                onClick={handlePredict}
                disabled={predicting}
            >
                {predicting ? '...' : '✨'}
            </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        <div>
            <label htmlFor="amount" style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '6px', color: 'var(--text-muted)' }}>Amount (₹)</label>
            <input
                id="amount"
                type="number"
                className="input-elegant"
                placeholder="0.00"
                step="0.01"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                required
            />
        </div>

        <div>
            <label htmlFor="date" style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '6px', color: 'var(--text-muted)' }}>Date</label>
            <input
                id="date"
                className="input-elegant"
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                required
            />
        </div>
      </div>

      <div>
        <label htmlFor="category" style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '6px', color: 'var(--text-muted)' }}>Category</label>
        <select
          id="category"
          className="input-elegant"
          style={{ appearance: 'none', background: 'rgba(255, 255, 255, 0.04)' }}
          value={category}
          onChange={e => setCategory(e.target.value)}
          required
        >
          <option value="" style={{ background: '#111' }}>Select Category</option>
          {CATEGORY_LIST.map(cat => (
            <option key={cat} value={cat} style={{ background: '#111' }}>
              {CATEGORIES[cat].emoji} {cat}
            </option>
          ))}
        </select>
      </div>

      <button type="submit" className="btn-premium btn-primary-gradient">
        Save Transaction
      </button>
    </form>
  );
}
