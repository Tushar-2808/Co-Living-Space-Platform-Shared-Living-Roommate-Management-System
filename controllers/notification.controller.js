const Notification = require('../models/Notification.model');

// GET /api/notifications
const getMyNotifications = async (req, res) => {
    const notifications = await Notification.find({ recipient: req.user._id })
        .sort({ createdAt: -1 })
        .limit(50);
    res.json({ success: true, notifications });
};

// PUT /api/notifications/:id/read
const markAsRead = async (req, res) => {
    const notification = await Notification.findOneAndUpdate(
        { _id: req.params.id, recipient: req.user._id },
        { isRead: true },
        { new: true }
    );
    if (!notification) return res.status(404).json({ success: false, message: 'Notification not found.' });
    res.json({ success: true, notification });
};

// PUT /api/notifications/read-all
const markAllAsRead = async (req, res) => {
    await Notification.updateMany(
        { recipient: req.user._id, isRead: false },
        { isRead: true }
    );
    res.json({ success: true, message: 'All notifications marked as read.' });
};

// Internal utility to create notification
const createNotification = async (recipientId, title, message, type, relatedId) => {
    try {
        await Notification.create({
            recipient: recipientId,
            title,
            message,
            type,
            relatedId
        });
    } catch (error) {
        console.error('Failed to create notification:', error);
    }
};

module.exports = { getMyNotifications, markAsRead, markAllAsRead, createNotification };
