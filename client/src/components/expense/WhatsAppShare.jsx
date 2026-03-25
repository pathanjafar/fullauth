import { CATEGORIES } from '../../utils/expense/categories';

const WHATSAPP_NUMBER = '9182641412';

export default function WhatsAppShare({ expenses, budget, startDate, endDate }) {
  function buildMessage() {
    const rangeLabel = startDate && endDate ? `${startDate} to ${endDate}` : 'Custom Range';
    const safeExpenses = Array.isArray(expenses) ? expenses : [];

    const filteredExpenses = safeExpenses.filter(e => {
      const d = e.date;
      return d && (!startDate || d >= startDate) && (!endDate || d <= endDate);
    });

    const total = filteredExpenses.reduce((s, e) => s + e.amount, 0);

    // Category breakdown
    const catTotals = {};
    filteredExpenses.forEach(e => {
      catTotals[e.category] = (catTotals[e.category] || 0) + e.amount;
    });
    const sorted = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);

    let msg = `💰 *Expense Report — ${rangeLabel}*\n\n`;
    msg += `📊 Total Spent: ₹${total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}\n`;
    
    if (sorted.length > 0) {
      msg += `\n📋 *Category Breakdown:*\n`;
      sorted.forEach(([cat, amt]) => {
        const emoji = CATEGORIES[cat]?.emoji || '📦';
        msg += `${emoji} ${cat}: ₹${amt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}\n`;
      });
    }

    // Recent 10 transactions
    const recent = filteredExpenses.slice(0, 10);
    if (recent.length > 0) {
      msg += `\n📜 *Details (up to 10):*\n`;
      recent.forEach(e => {
        msg += `• ${e.date} | ${e.title}: ₹${e.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}\n`;
      });
    }

    msg += `\n_Generated via Expense Tracker_`;
    return msg;
  }

  function handleShare() {
    const message = buildMessage();
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  }

  return (
    <button type="button" className="btn btn-whatsapp" onClick={handleShare}>
      💬 WhatsApp Summary
    </button>
  );
}
