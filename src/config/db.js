const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        // Don't exit process in production to allow the server to stay up for diagnostics
        if (process.env.NODE_ENV === 'development') process.exit(1);
    }
};

module.exports = connectDB;
