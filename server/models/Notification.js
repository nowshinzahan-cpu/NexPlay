const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    recipientType: {
      type: String,
      enum: ['User', 'Company'],
      required: true
    },
    type: {
      type: String,
      enum: ['verification', 'system', 'promotion', 'match_reminder', 'goal_alert', 'match_event', 'badge_earned', 'level_up', 'comment_reply', 'discussion_reply'],
      default: 'system'
    },
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      trim: true
    },
    isRead: {
      type: Boolean,
      default: false
    },
    link: {
      type: String,
      default: ''
    },
    relatedMatchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Match',
      default: null
    },
    relatedModel: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.__v;
        return ret;
      }
    }
  }
);

notificationSchema.index({ recipientId: 1, recipientType: 1 });
notificationSchema.index({ isRead: 1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ relatedMatchId: 1 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
