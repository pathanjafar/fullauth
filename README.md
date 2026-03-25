# 💎 FullAuth + AI Expense Intelligence

A sophisticated, full-stack financial management ecosystem and authentication platform. This project combines a robust, secure authentication system with an AI-powered expense tracker, all wrapped in a **Dark Premium Obsidian** design system.

![UI Preview](https://via.placeholder.com/800x400?text=FullAuth+AI+Expense+Tracker+Premium+UI)

## 🚀 Key Modules

### 🔐 1. Universal Authentication (FullAuth)
- **Email OTP Verification**: High-deliverability sign-up and login flow powered by the **Resend API**.
- **JWT Protection**: Secure, stateless user sessions with cross-origin protection.
- **Password Security**: Multi-round `bcrypt` hashing and comprehensive account recovery flows.
- **Production Guardrails**: Rate-limiting, XSS protection, and NoSQL injection sanitization.

### 🧠 2. AI Expense Intelligence
- **Gemini Pro Integration**: Real-time spending analysis and automated categorization.
- **Smart SMS Parser**: Direct UPI/PhonePe SMS text-to-transaction conversion using AI.
- **Financial Coaching**: Generative AI advice on budget health and spending trends.
- **Dynamic Visuals**: High-contrast Chart.js trends with premium obsidian tooltips.

### 🍱 3. Design System (Dark Premium)
- **Obsidian Aesthetic**: Deep `#050505` backgrounds with neon emerald (`#10b981`) accents.
- **Glassmorphism**: 32px backdrop-blur cards with high-contrast subtle borders.
- **Mesh Gradients**: Multi-layered, animated radial backgrounds for a "smooth" interactive feel.
- **Fully Responsive**: Optimized for high-end desktop displays and mobile financial tracking.

## 🛠 Tech Stack

- **Frontend**: React (Vite), Axios, Chart.js, Lucide Icons.
- **Backend**: Node.js, Express, MongoDB Atlas (Mongoose).
- **AI Engine**: Google Gemini API.
- **Email Service**: Resend API.
- **Deployment**: Vercel (Frontend), Render (Backend).

## ⚙️ Quick Start

1. **Clone & Install**:
   ```bash
   git clone https://github.com/pathanjafar/fullauth.git
   cd fullauth
   npm install
   cd client && npm install
   ```

2. **Environment Configuration**:
   Create a `.env` file in the root and `/client` directories with your respective API keys (MongoDB, Gemini, Resend, JWT_SECRET).

3. **Run Dev Mode**:
   - Backend: `npm start` (from root)
   - Frontend: `npm run dev` (from /client)

## 🏗 Project Architecture

```text
fullauth/
├── client/              # React (Vite) Frontend
│   ├── src/
│   │   ├── components/  # AI & Expense specialized modules
│   │   ├── pages/       # Dashboard, ExpenseTracker, Auth flows
│   │   └── index.css    # Premium Obsidian Design System
├── src/                # Express Backend
│   ├── models/          # User, Expense, and OTP Mongo Schemas
│   ├── routes/          # Unified API endpoints
│   ├── utils/           # AI Parsers & Email Utilities
│   └── app.js           # Express configuration
└── package.json         # Full-stack dependency management
```

## 📜 License
Licensed under the [ISC](LICENSE) license. Built with ❤️ for modern financial tracking.
