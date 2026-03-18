# FullAuth: Modern Authentication System

A comprehensive, full-stack authentication system built with Node.js, Express, React (Vite), and MongoDB.  This project features a secure, OTP-based email verification flow and a modern glassmorphic UI.

## 🚀 Key Features

### Backend (Node.js/Express/MongoDB)
- **Email OTP Authentication**: Secure sign-up and sign-in using email-based one-time passwords via Nodemailer.
- **JWT-based Authentication**: Secure user sessions and protected routes.
- **Password Management**: Robust password hashing (bcryptjs) and forgot/reset password flows.
- **Security Enhancements**: 
  - `helmet` (HTTP headers security)
  - `express-mongo-sanitize` (NoSQL injection protection)
  - `express-rate-limit` (Brute-force protection)
  - `xss-clean` (Cross-site scripting protection)
- **Database Architecture**: Structured MongoDB models for Users and OTP storage.

### Frontend (React/Vite)
- **Modern UI**: Clean, premium white glassmorphic design theme.
- **Responsive Design**: Mobile-first approach for accessibility across devices.
- **Dynamic Routing**: Managed with `react-router-dom` for seamless state transitions.
- **Interactive Pages**: Redesigned login, sign-up, forgot password, and dashboard pages.
- **Protected Routes**: Ensuring secure access to user-specific content.

## 🛠 Tech Stack

- **Frontend**: React, Vite, Lucide React, Axios.
- **Backend**: Node.js, Express, Mongoose (MongoDB).
- **Communication**: Nodemailer (Email delivery).
- **Security**: JWT, bcryptjs, Helmet, Rate-limiting.

## ⚙️ Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/pathanjafar/fullauth.git
   cd fullauth
   ```

2. **Backend Setup**:
   - Create a `.env` file in the root directory and configure the following variables:
     ```env
     PORT=5000
     MONGO_URI=your_mongodb_uri
     JWT_SECRET=your_jwt_secret
     EMAIL_USER=your_email_address
     EMAIL_PASS=your_email_app_password
     ```
   - Install backend dependencies:
     ```bash
     npm install
     ```
   - Start the backend server:
     ```bash
     npm start
     ```

3. **Frontend Setup**:
   - Navigate to the `client` folder:
     ```bash
     cd client
     ```
   - Install frontend dependencies:
     ```bash
     npm install
     ```
   - Start the Vite development server:
     ```bash
     npm run dev
     ```

## 🏗 Project Structure

```text
fullauth/
├── client/              # React frontend (Vite)
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Login, Signup, Dashboard, ResetPassword, etc.
│   │   ├── App.jsx      # Main application entry
│   │   └── index.css    # Modern glassmorphic styles
├── src/                # Express backend
│   ├── models/          # User and OTP MongoDB models
│   ├── routes/          # API route definitions
│   ├── controllers/     # Authentication & OTP logic
│   ├── utils/           # Email & helper utilities
│   └── server.js        # Main server entry point
└── README.md
```

## 📜 License

This project is licensed under the [ISC](LICENSE) license.
