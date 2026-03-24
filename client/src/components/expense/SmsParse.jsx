import { useState } from 'react';
import { parseUpiSms } from '../../utils/expense/smsParser';
import { parseSmsByAI, hasApiKey } from '../../utils/expense/ai';
import { CATEGORIES } from '../../utils/expense/categories';
import { useToast } from '../../context/ToastContext';

export default function SmsParse({ onAdd }) {
  const showToast = useToast();
  const [text, setText] = useState('');
  const [preview, setPreview] = useState(null);
  const [parsing, setParsing] = useState(false);

  async function handleParse() {
    if (!text.trim()) return showToast('Paste SMS text first', 'error');
    setParsing(true);

    try {
      let parsed = null;

      // Try AI parsing first if API key is available
      if (hasApiKey()) {
        try {
          parsed = await parseSmsByAI(text);
          showToast('Parsed with AI ✨', 'info');
        } catch {
          // AI failed, fall back to regex
        }
      }

      // Fallback to regex parser
      if (!parsed) {
        parsed = parseUpiSms(text);
        if (parsed) {
          showToast('Parsed with pattern matching', 'info');
        }
      }

      if (!parsed) {
        showToast('Could not parse this SMS. Try a different format.', 'error');
        return;
      }

      setPreview(parsed);
    } catch (err) {
      showToast('Parse error: ' + err.message, 'error');
    } finally {
      setParsing(false);
    }
  }

  function handleAdd() {
    if (!preview) return;
    onAdd({
      ...preview,
    });
    setText('');
    setPreview(null);
    showToast('Transaction added from SMS!');
  }

  return (
    <div className="sms-section">
      <div className="section-title">📱 UPI / PhonePe SMS</div>

      <div className="form-group">
        <textarea
          placeholder="Paste your UPI / PhonePe / bank SMS here..."
          value={text}
          onChange={e => { setText(e.target.value); setPreview(null); }}
        />
      </div>

      <button
        type="button"
        className="btn btn-secondary"
        onClick={handleParse}
        disabled={parsing}
      >
        {parsing ? '⏳ Parsing...' : '🔍 AI Parse SMS'}
      </button>

      {preview && (
        <div className="sms-preview">
          <p><strong>{CATEGORIES[preview.category]?.emoji || '📦'} {preview.title}</strong></p>
          <p>Amount: <strong>₹{Number(preview.amount).toFixed(2)}</strong></p>
          <p>Category: <strong>{preview.category}</strong></p>
          <p>Date: <strong>{preview.date}</strong></p>
          <button
            type="button"
            className="btn btn-primary"
            style={{ marginTop: 10 }}
            onClick={handleAdd}
          >
            ✅ Add This Expense
          </button>
        </div>
      )}
    </div>
  );
}
