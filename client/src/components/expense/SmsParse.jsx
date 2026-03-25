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
          className="input-elegant"
          style={{ height: '120px', padding: '1rem', resize: 'none' }}
          value={text}
          onChange={e => { setText(e.target.value); setPreview(null); }}
        />
      </div>

      <button
        type="button"
        className="btn-premium"
        style={{ width: '100%', marginTop: '1rem', border: '1px solid var(--primary-glow)', color: 'var(--primary)' }}
        onClick={handleParse}
        disabled={parsing}
      >
        {parsing ? '⏳ Analyzing Patterns...' : '🔍 AI Parse Transaction'}
      </button>

      {preview && (
        <div style={{ marginTop: '1.5rem', padding: '1.5rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '20px', border: '1px solid var(--border-active)' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Parsed Preview</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '1.5rem' }}>
             <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', border: '1px solid var(--border-glass)' }}>
                {CATEGORIES[preview.category]?.emoji || '📦'}
             </div>
             <div>
                <strong style={{ display: 'block', fontSize: '1rem', color: 'var(--text-main)' }}>{preview.title}</strong>
                <span style={{ fontSize: '0.813rem', color: 'var(--text-muted)' }}>₹{Number(preview.amount).toFixed(2)} • {preview.category}</span>
             </div>
          </div>
          <button
            type="button"
            className="btn-premium btn-primary-gradient"
            style={{ height: '44px', width: '100%' }}
            onClick={handleAdd}
          >
            Confirm & Add
          </button>
        </div>
      )}
    </div>
  );
}
