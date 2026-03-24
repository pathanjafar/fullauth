/**
 * Gemini API utility for AI-powered expense features.
 * API key loaded from .env via Vite's import.meta.env
 */

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

async function callGemini(prompt) {
  if (!API_KEY) throw new Error('Gemini API key not found in .env');

// Using v1beta endpoint and gemini-2.5-flash as verified by diagnostic script
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }]
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Gemini API error: ${res.status}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty response from Gemini');
  return text;
}

/**
 * AI-predict category from expense title.
 * Returns one of: Food, Transport, Shopping, Bills, Health, Entertainment, Other
 */
export async function predictCategory(title) {
  const prompt = `You are an expense categorizer. Given an expense title, respond with ONLY one of these categories:
Food, Transport, Shopping, Bills, Health, Entertainment, Other.

Expense Title: "${title}"
Category:`;
  const result = await callGemini(prompt);
  return result.trim().replace(/[*_]/g, ''); // Clean formatting if any
}

/**
 * AI-parse transaction SMS into structured data.
 * Handles various Indian Bank/UPI/PhonePe/Paytm formats.
 */
export async function parseSmsByAI(smsText) {
  const today = new Date().toISOString().split('T')[0];
  const prompt = `You are a financial data parser. Extract transaction details from this Indian Bank/UPI/PhonePe SMS into a JSON object.
SMS can be in various formats: "Paid Rs. 100 to X", "Debited from A/c... to Y", "Sent to Z", etc.

Fields:
- "title": Clean merchant or payee name (e.g., "Swiggy", "Zomato", "Uber", "Airtel"). Remove "VPA", "UPI", or transaction IDs.
- "amount": The numeric amount (no symbols).
- "category": Choose one: Food, Transport, Shopping, Bills, Health, Entertainment, Other.
- "date": Date in YYYY-MM-DD. Use ${today} if not mentioned.

SMS: "${smsText}"

Respond with ONLY the JSON object, NO markdown, NO code blocks, NO extra text.`;

  const result = await callGemini(prompt);
  
  // Clean potential markdown code blocks
  const jsonStr = result.replace(/```json|```/g, '').trim();
  const parsed = JSON.parse(jsonStr);

  // Validate and format
  if (!parsed.title || !parsed.amount) throw new Error('Incomplete parse');
  parsed.amount = Number(parsed.amount);
  if (isNaN(parsed.amount)) throw new Error('Invalid amount');

  return parsed;
}

/**
 * AI spending advice based on expense data.
 */
export async function getSpendingAdvice(expenses, budget) {
  if (expenses.length === 0) return 'Start adding expenses to get personalized advice!';

  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthExpenses = expenses.filter(e => e.date.startsWith(currentMonth));
  const total = monthExpenses.reduce((s, e) => s + e.amount, 0);

  const catTotals = {};
  monthExpenses.forEach(e => {
    catTotals[e.category] = (catTotals[e.category] || 0) + e.amount;
  });

  const prompt = `You are a friendly personal finance advisor. Give a brief (2 sentences max) spending tip based on this data:
- Monthly budget: ₹${budget}
- Monthly spend so far: ₹${total}
- Category breakdown: ${JSON.stringify(catTotals)}

Keep it casual and specific. Use ₹ for currency.`;

  return await callGemini(prompt);
}

export function hasApiKey() {
  return !!API_KEY;
}
