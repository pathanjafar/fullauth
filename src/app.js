const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');

const app = express();

// Enable CORS
app.use(cors());

// Body parser
app.use(express.json());

// Set security headers (relaxed CSP for cross-origin API use)
app.use(helmet({
    contentSecurityPolicy: false
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 mins
    max: 100
});
app.use(limiter);

// Mount routes
const auth = require('./routes/authRoutes');
const expenses = require('./routes/expenseRoutes');

app.use('/api/auth', auth);
app.use('/api/expenses', expenses);

// Default route
app.get('/', (req, res) => {
    res.send('API is running...');
});

module.exports = app;
