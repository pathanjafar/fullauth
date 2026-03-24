import { useMemo, useState } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { CATEGORIES } from '../../utils/expense/categories';
import { getSpendingAdvice, hasApiKey } from '../../utils/expense/ai';

ChartJS.register(ArcElement, Tooltip);

export default function InsightsPanel({ expenses, budget, onBudgetChange }) {
  const currentMonth = new Date().toISOString().slice(0, 7);

  const monthSpent = useMemo(
    () => expenses
      .filter(e => e.date.startsWith(currentMonth))
      .reduce((s, e) => s + e.amount, 0),
    [expenses, currentMonth]
  );

  const catTotals = useMemo(() => {
    const totals = {};
    expenses.forEach(e => {
      totals[e.category] = (totals[e.category] || 0) + e.amount;
    });
    return Object.entries(totals).sort((a, b) => b[1] - a[1]);
  }, [expenses]);

  const totalAll = catTotals.reduce((s, [, v]) => s + v, 0) || 1;

  // Budget bar
  const budgetPct = budget > 0 ? Math.min((monthSpent / budget) * 100, 100) : 0;
  const barClass = budgetPct >= 100 ? 'danger' : budgetPct >= 80 ? 'warn' : '';

  // Chart data
  const chartData = {
    labels: catTotals.map(([cat]) => cat),
    datasets: [{
      data: catTotals.map(([, val]) => val),
      backgroundColor: catTotals.map(([cat]) => CATEGORIES[cat]?.color || '#94a3b8'),
      borderColor: '#ffffff',
      borderWidth: 2,
    }],
  };

  const chartOptions = {
    cutout: '72%',
    plugins: { legend: { display: false }, tooltip: { enabled: true } },
    maintainAspectRatio: true,
    animation: { duration: 600 },
  };

  return (
    <>
      {/* Budget */}
      <div className="budget-section">
        <div className="form-group">
          <label htmlFor="budgetInput">Monthly Budget (₹)</label>
          <input
            id="budgetInput"
            type="number"
            value={budget || ''}
            onChange={e => onBudgetChange(Number(e.target.value) || 0)}
            placeholder="Set your budget"
          />
        </div>
        <div className="budget-bar-outer">
          <div
            className={`budget-bar-inner ${barClass}`}
            style={{ width: `${budgetPct}%` }}
          />
        </div>
        <div className="budget-meta">
          <span>₹{monthSpent.toLocaleString('en-IN')} spent</span>
          <span>
            {budget > 0
              ? `${budgetPct.toFixed(0)}% of ₹${budget.toLocaleString('en-IN')}`
              : 'No budget set'}
          </span>
        </div>
      </div>

      {/* Chart */}
      {catTotals.length > 0 && (
        <div className="chart-container">
          <Doughnut data={chartData} options={chartOptions} />
        </div>
      )}

      {/* Category breakdown */}
      <div className="cat-list">
        {catTotals.map(([cat, amount]) => {
          const meta = CATEGORIES[cat] || CATEGORIES.Other;
          const pct = ((amount / totalAll) * 100).toFixed(1);
          return (
            <div className="cat-row" key={cat}>
              <div className="cat-emoji">{meta.emoji}</div>
              <div className="cat-info">
                <div className="cat-top">
                  <span className="cat-name">{cat}</span>
                  <span className="cat-amount">₹{amount.toLocaleString('en-IN')} · {pct}%</span>
                </div>
                <div className="cat-bar-bg">
                  <div
                    className="cat-bar-fill"
                    style={{ width: `${pct}%`, background: meta.color }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Advice */}
      {hasApiKey() && (
        <div style={{ marginTop: 24, padding: 16, background: 'var(--primary-50)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--primary-light)' }}>
          <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            ✨ AI Financial Coach
          </h4>
          <AdviceButton expenses={expenses} budget={budget} />
        </div>
      )}
    </>
  );
}

function AdviceButton({ expenses, budget }) {
  const [advice, setAdvice] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleGetAdvice() {
    setLoading(true);
    try {
      const tip = await getSpendingAdvice(expenses, budget);
      setAdvice(tip);
    } catch (err) {
      setAdvice('Could not get AI advice at this time.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {advice ? (
        <p style={{ fontSize: '0.88rem', color: 'var(--text)', fontStyle: 'italic', marginBottom: 12 }}>
          "{advice}"
        </p>
      ) : null}
      <button 
        type="button" 
        className="btn btn-secondary" 
        style={{ fontSize: '0.8rem', padding: '8px 12px' }}
        onClick={handleGetAdvice}
        disabled={loading}
      >
        {loading ? '⏳ Analyzing...' : advice ? '🔄 Get New Tip' : '💡 Get Spending Tip'}
      </button>
    </>
  );
}
