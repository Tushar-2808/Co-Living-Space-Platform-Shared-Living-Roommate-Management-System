const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const { registerSchema, loginSchema, validate } = require('../utils/validators');

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

const setCookieAndRespond = (res, user, statusCode = 200) => {
    const token = signToken(user._id);
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax', // Changed from strict to lax for better localhost compatibility
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.status(statusCode).json({ success: true, user });
};

// POST /api/auth/register
const register = async (req, res, next) => {
    const { name, email, password, role, phone } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ success: false, message: 'Email already registered.' });

    const user = await User.create({ name, email, password, role, phone });
    setCookieAndRespond(res, user, 201);
};

// POST /api/auth/login
const login = async (req, res, next) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }
    setCookieAndRespond(res, user);
};

// POST /api/auth/logout
const logout = (req, res) => {
    res.clearCookie('token');
    res.json({ success: true, message: 'Logged out successfully.' });
};

// GET /api/auth/me
const getMe = (req, res) => {
    res.json({ success: true, user: req.user });
};

module.exports = { register, login, logout, getMe };
