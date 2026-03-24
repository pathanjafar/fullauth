export const CATEGORIES = {
  Food:          { emoji: '🍕', color: '#059669' },
  Transport:     { emoji: '🚗', color: '#6366f1' },
  Shopping:      { emoji: '🛍️', color: '#f59e0b' },
  Bills:         { emoji: '📄', color: '#ef4444' },
  Health:        { emoji: '💊', color: '#3b82f6' },
  Entertainment: { emoji: '🎬', color: '#8b5cf6' },
  Other:         { emoji: '📦', color: '#64748b' },
};

export const CATEGORY_LIST = Object.keys(CATEGORIES);

// Keyword → category mapping for auto-detection
const CATEGORY_KEYWORDS = {
  Food: ['swiggy', 'zomato', 'restaurant', 'food', 'cafe', 'starbucks', 'dominos', 'pizza', 'mcdonald', 'kfc', 'burger', 'biryani', 'chai', 'tea', 'coffee', 'bakery', 'kitchen', 'dhaba', 'mess', 'canteen', 'eat', 'dine', 'blinkit', 'instamart', 'grofers', 'bigbasket', 'zepto'],
  Transport: ['uber', 'ola', 'rapido', 'metro', 'fuel', 'petrol', 'diesel', 'cab', 'auto', 'bus', 'train', 'irctc', 'parking', 'toll', 'yulu', 'bounce', 'vogo'],
  Shopping: ['amazon', 'flipkart', 'myntra', 'ajio', 'mall', 'store', 'mart', 'bazaar', 'dmart', 'reliance', 'meesho', 'nykaa', 'tatacliq', 'snapdeal', 'croma'],
  Bills: ['electricity', 'water', 'gas', 'internet', 'broadband', 'jio', 'airtel', 'vi', 'bsnl', 'recharge', 'rent', 'emi', 'loan', 'insurance', 'premium', 'bill', 'postpaid', 'prepaid'],
  Health: ['pharmacy', 'hospital', 'doctor', 'medical', 'apollo', 'medplus', '1mg', 'pharmeasy', 'netmeds', 'clinic', 'lab', 'diagnostic', 'health', 'wellness'],
  Entertainment: ['netflix', 'hotstar', 'spotify', 'movie', 'pvr', 'inox', 'prime', 'disney', 'gaming', 'game', 'play', 'youtube', 'jiocinema'],
};

export function detectCategory(merchantName) {
  if (!merchantName) return 'Other';
  const lower = merchantName.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(kw => lower.includes(kw))) return category;
  }
  return 'Other';
}
