const { Notification, User } = require('../models');
const { sendSuccess, sendError, sendPaginated } = require('../utils/response');
const { parsePagination } = require('../utils/helpers');
const { HTTP_STATUS } = require('../constants');

/**
 * GET /api/notifications
 * Get notifications for the current user/company
 */
const getNotifications = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);

    const { read, category } = req.query;

    const filter = {
      recipientId: req.user.id,
      recipientType: req.user.type === 'company' ? 'Company' : 'User'
    };

    if (read === 'true') filter.isRead = true;
    if (read === 'false') filter.isRead = false;
    if (category) filter.type = category;

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Notification.countDocuments(filter),
      Notification.countDocuments({ ...filter, isRead: false })
    ]);

    return sendPaginated(res, notifications, total, page, limit, 'Notifications retrieved', { unreadCount });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/notifications/:id/read
 * Mark a notification as read
 */
const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      {
        _id: req.params.id,
        recipientId: req.user.id
      },
      { $set: { isRead: true } },
      { returnDocument: 'after' }
    );

    if (!notification) {
      return sendError(res, 'Notification not found', HTTP_STATUS.NOT_FOUND, 'NOTIFICATION_NOT_FOUND');
    }

    return sendSuccess(res, { notification }, 'Notification marked as read');
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/notifications/read-all
 * Mark all notifications as read
 */
const markAllAsRead = async (req, res, next) => {
  try {
    const result = await Notification.updateMany(
      {
        recipientId: req.user.id,
        recipientType: req.user.type === 'company' ? 'Company' : 'User',
        isRead: false
      },
      { isRead: true }
    );

    return sendSuccess(res, { updated: result.modifiedCount }, 'All notifications marked as read');
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/notifications/unread-count
 * Get unread notification count
 */
const getUnreadCount = async (req, res, next) => {
  try {
    const count = await Notification.countDocuments({
      recipientId: req.user.id,
      recipientType: req.user.type === 'company' ? 'Company' : 'User',
      isRead: false
    });

    return sendSuccess(res, { unreadCount: count }, 'Unread count retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/notifications/announcement
 * Company: publish a promotional announcement to all active users
 */
const createAnnouncement = async (req, res, next) => {
  try {
    const { title, message } = req.body;

    if (!title || !message) {
      return sendError(res, 'Title and message are required', HTTP_STATUS.BAD_REQUEST, 'MISSING_FIELDS');
    }

    // Send to all active users
    const activeUsers = await User.find({ isActive: true }).select('_id');

    const notifications = activeUsers.map(user => ({
      recipientId: user._id,
      recipientType: 'User',
      type: 'promotion',
      title,
      message,
      link: '/user/dashboard'
    }));

    await Notification.insertMany(notifications);

    return sendSuccess(res, { count: notifications.length }, 'Announcement published', HTTP_STATUS.CREATED);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/notifications/:id
 * Delete a notification
 */
const deleteNotification = async (req, res, next) => {
  try {
    const result = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipientId: req.user.id,
      recipientType: req.user.type === 'company' ? 'Company' : 'User'
    });

    if (!result) {
      return sendError(res, 'Notification not found', HTTP_STATUS.NOT_FOUND, 'NOTIFICATION_NOT_FOUND');
    }

    return sendSuccess(res, {}, 'Notification deleted');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  createAnnouncement,
  deleteNotification
};
