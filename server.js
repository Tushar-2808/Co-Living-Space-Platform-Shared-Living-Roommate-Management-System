require('dotenv').config();
require('express-async-errors');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/error.middleware');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const propertyRoutes = require('./routes/property.routes');
const roomRoutes = require('./routes/room.routes');
const applicationRoutes = require('./routes/application.routes');
const adminRoutes = require('./routes/admin.routes');
const notificationRoutes = require('./routes/notification.routes');
const matchingRoutes = require('./routes/matching.routes');

const app = express();

// Connect to MongoDB Atlas
connectDB();

// DB Readiness Middleware
const checkDB = (req, res, next) => {
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({
            success: false,
            message: 'Database connection is not ready. Please ensure your MongoDB Atlas credentials are correct and your IP is whitelisted.',
        });
    }
    next();
};

// Middleware
const clientUrl = process.env.CLIENT_URL ? process.env.CLIENT_URL.replace(/\/$/, '') : 'http://localhost:5173';
app.use(cors({
    origin: clientUrl,
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check
app.get('/api/health', (req, res) => res.json({ success: true, message: 'Co-Living API is running 🏠' }));

// Root route
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Welcome to the Co-Living API 🏠',
        links: {
            health: '/api/health',
            documentation: 'https://github.com/your-repo/unified-mentor'
        }
    });
});

// Routes
app.use('/api/auth', checkDB, authRoutes);
app.use('/api/users', checkDB, userRoutes);
app.use('/api/properties', checkDB, propertyRoutes);
app.use('/api/rooms', checkDB, roomRoutes);
app.use('/api/applications', checkDB, applicationRoutes);
app.use('/api/admin', checkDB, adminRoutes);
app.use('/api/notifications', checkDB, notificationRoutes);
app.use('/api/matching', checkDB, matchingRoutes);

// 404 & Error handlers
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Co-Living API running on http://localhost:${PORT}`);
});
