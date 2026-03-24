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
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="title">Title</label>
        <input
          id="title"
          type="text"
          placeholder="e.g. Swiggy Order"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
        />
        <button
          type="button"
          className="btn btn-secondary"
          style={{ marginTop: 6 }}
          onClick={handlePredict}
          disabled={predicting}
        >
          {predicting ? '⏳ Predicting...' : '✨ AI Predict Category'}
        </button>
      </div>

      <div className="form-group">
        <label htmlFor="amount">Amount (₹)</label>
        <input
          id="amount"
          type="number"
          placeholder="0.00"
          step="0.01"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="category">Category</label>
        <select
          id="category"
          value={category}
          onChange={e => setCategory(e.target.value)}
          required
        >
          <option value="">Select Category</option>
          {CATEGORY_LIST.map(cat => (
            <option key={cat} value={cat}>
              {CATEGORIES[cat].emoji} {cat}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="date">Date</label>
        <input
          id="date"
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          required
        />
      </div>

      <button type="submit" className="btn btn-primary">
        Save Expense
      </button>
    </form>
  );
}
