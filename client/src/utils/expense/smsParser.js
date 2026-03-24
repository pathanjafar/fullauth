import { detectCategory } from './categories';

/**
 * Parse UPI/PhonePe/GPay/Paytm SMS into structured expense data.
 * Returns { title, amount, category, date } or null if unparseable.
 */
export function parseUpiSms(text) {
  if (!text || text.trim().length === 0) return null;

  let amount = null;
  let merchant = null;

  // === Amount extraction patterns ===

  // Pattern: "Rs.250.00" or "Rs 250" or "INR 500.00" or "₹350" or "Amt: 100"
  const amountMatch = text.match(/(?:Rs\.?|INR|₹|Amt:)\s*(\d[\d,]*(?:\.\d{1,2})?)/i);
  if (amountMatch) {
    amount = parseFloat(amountMatch[1].replace(/,/g, ''));
  }

  // === Merchant extraction patterns ===

  // Pattern 1: "paid to MERCHANT via" or "paid to MERCHANT using"
  const paidTo = text.match(/paid\s+to\s+(.+?)(?:\s+via|\s+using|\s+on|\s+Ref|\s*\.|\s*$)/i);
  if (paidTo) merchant = paidTo[1].trim();

  // Pattern 2: "debited...to MERCHANT" or "debited...towards MERCHANT" or "debited...at MERCHANT"
  if (!merchant) {
    const debitTo = text.match(/debited.*?(?:to|towards|at)\s+(.+?)(?:\s+from|\s+via|\s+UPI|\s+Ref|\s*\.|\s*$)/i);
    if (debitTo) merchant = debitTo[1].replace(/^VPA\s*/i, '').trim();
  }

  // Pattern 3: "spent on MERCHANT" or "spent at MERCHANT"
  if (!merchant) {
    const spentOn = text.match(/spent\s+(?:on|at)\s+(.+?)(?:\s+via|\s+using|\s+Ref|\s*\.|\s*$)/i);
    if (spentOn) merchant = spentOn[1].trim();
  }

  // Pattern 4: "to VPA merchant@ybl" or "to VPA merchant"
  if (!merchant) {
    const vpaMatch = text.match(/to\s+(?:VPA\s+)?([a-zA-Z0-9._]+(?:@[a-zA-Z]+)?)/i);
    if (vpaMatch) merchant = cleanMerchantName(vpaMatch[1]);
  }

  // Pattern 5: "transferred to MERCHANT"
  if (!merchant) {
    const transferTo = text.match(/transferred?\s+to\s+(.+?)(?:\s+Ref|\s+UPI|\s*\.|\s*$)/i);
    if (transferTo) merchant = transferTo[1].trim();
  }

  // Pattern 6: "at MERCHANT" (specifically for "Amt Rs... at MERCHANT")
  if (!merchant) {
    const atMerchant = text.match(/at\s+([a-zA-Z0-9\s&]+?)(?:\s+Ref|\s+on|\s*\.|\s*$)/i);
    if (atMerchant) merchant = atMerchant[1].trim();
  }

  if (!amount) return null;

  // Clean up merchant name
  merchant = merchant ? cleanMerchantName(merchant) : 'UPI Payment';

  // Detect date from SMS (or use today)
  const dateMatch = text.match(/(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})/);
  let date = new Date().toISOString().split('T')[0];
  if (dateMatch) {
    const day = dateMatch[1].padStart(2, '0');
    const month = dateMatch[2].padStart(2, '0');
    let year = dateMatch[3];
    if (year.length === 2) year = '20' + year;
    date = `${year}-${month}-${day}`;
  }

  const category = detectCategory(merchant);

  return {
    title: merchant,
    amount,
    category,
    date,
  };
}

function cleanMerchantName(name) {
  // Remove VPA suffixes like @ybl, @paytm, @upi
  let cleaned = name.replace(/@[a-zA-Z]+$/, '');
  // Remove extra whitespace
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  // Capitalize first letter of each word
  cleaned = cleaned
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
  return cleaned || 'UPI Payment';
}
