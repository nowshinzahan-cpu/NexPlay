const mongoose = require('mongoose');

const notificationPreferenceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      unique: true,
      index: true
    },
    matchReminders: {
      type: Boolean,
      default: true
    },
    reminderMinutesBefore: {
      type: Number,
      default: 30,
      min: 5,
      max: 1440
    },
    goalAlerts: {
      type: Boolean,
      default: true
    },
    tournamentAnnouncements: {
      type: Boolean,
      default: true
    },
    reviewReplies: {
      type: Boolean,
      default: true
    },
    discussionReplies: {
      type: Boolean,
      default: true
    },
    forumDigest: {
      type: Boolean,
      default: false
    },
    emailNotifications: {
      type: Boolean,
      default: false
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

const NotificationPreference = mongoose.model('NotificationPreference', notificationPreferenceSchema);

module.exports = NotificationPreference;
