import { useMemo, useState } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { CATEGORIES } from '../../utils/expense/categories';
import { getSpendingAdvice, getSpendingForecast, hasApiKey } from '../../utils/expense/ai';

ChartJS.register(ArcElement, Tooltip);

export default function InsightsPanel({ expenses, budget, onBudgetChange }) {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const safeExpenses = Array.isArray(expenses) ? expenses : [];

  const monthSpent = useMemo(
    () => safeExpenses
      .filter(e => e.date && e.date.startsWith(currentMonth))
      .reduce((s, e) => s + e.amount, 0),
    [safeExpenses, currentMonth]
  );

  const catTotals = useMemo(() => {
    const totals = {};
    safeExpenses.forEach(e => {
      totals[e.category] = (totals[e.category] || 0) + e.amount;
    });
    return Object.entries(totals).sort((a, b) => b[1] - a[1]);
  }, [safeExpenses]);

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
      borderColor: '#050505',
      borderWidth: 4,
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
        <div style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="budgetInput" style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>MONTHLY BUDGET LIMIT (₹)</label>
          <input
            id="budgetInput"
            type="number"
            className="input-elegant"
            value={budget || ''}
            onChange={e => onBudgetChange(Number(e.target.value) || 0)}
            placeholder="e.g. 50000"
          />
        </div>
        <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden', marginBottom: '12px' }}>
          <div
            style={{ 
                height: '100%', 
                width: `${budgetPct}%`, 
                background: budgetPct >= 100 ? '#f87171' : budgetPct >= 80 ? '#fbbf24' : 'var(--primary)',
                transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: `0 0 10px ${budgetPct >= 100 ? 'rgba(248, 113, 113, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`
            }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.813rem', fontWeight: 600 }}>
          <span style={{ color: 'var(--text-main)' }}>₹{monthSpent.toLocaleString('en-IN')} spent</span>
          <span style={{ color: 'var(--text-muted)' }}>
            {budget > 0
              ? `${budgetPct.toFixed(0)}% of ₹${budget.toLocaleString('en-IN')}`
              : 'Limit not set'}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }} key={cat}>
              <div style={{ fontSize: '1.25rem' }}>{meta.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{cat}</span>
                  <span style={{ color: 'var(--text-muted)' }}>₹{amount.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div
                    style={{ width: `${pct}%`, height: '100%', background: meta.color }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Advice */}
      {hasApiKey() && (
        <div style={{ marginTop: 32, padding: '1.5rem', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '20px', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
          <h4 style={{ fontSize: '0.813rem', fontWeight: 800, color: 'var(--primary)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            ✨ AI FINANCIAL COACH
          </h4>
          <AdviceButton expenses={expenses} budget={budget} />
          <ForecastButton expenses={expenses} budget={budget} />
        </div>
      )}
    </>
  );
}

function ForecastButton({ expenses, budget }) {
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleGetForecast() {
    setLoading(true);
    try {
      const res = await getSpendingForecast(expenses, budget);
      setForecast(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ marginTop: 16, borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: 16 }}>
      {forecast && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginBottom: 4, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>PROJECTED MONTH-END</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: (forecast.projectedTotal > budget && budget > 0) ? '#f87171' : 'var(--primary)', marginBottom: 8 }}>
            ₹{forecast.projectedTotal.toLocaleString('en-IN')}
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontStyle: 'italic', lineHeight: '1.5' }}>
            "{forecast.advice}"
          </p>
        </div>
      )}
      <button 
        type="button" 
        className="btn-premium" 
        style={{ fontSize: '0.875rem', width: '100%', height: '48px', background: 'rgba(255,255,255,0.05)' }}
        onClick={handleGetForecast}
        disabled={loading}
      >
        {loading ? '🔮 Calculating...' : forecast ? '🔄 Refresh Predictor' : '🔮 Forecast Month End'}
      </button>
    </div>
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
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: 16, lineHeight: '1.5' }}>
          "{advice}"
        </p>
      ) : null}
      <button 
        type="button" 
        className="btn-premium btn-primary-gradient" 
        style={{ fontSize: '0.875rem', height: '48px', width: '100%', color: '#000' }}
        onClick={handleGetAdvice}
        disabled={loading}
      >
        {loading ? '⏳ Analyzing...' : advice ? '🔄 Get New Insight' : '💡 Get AI Spending Tip'}
      </button>
    </>
  );
}
