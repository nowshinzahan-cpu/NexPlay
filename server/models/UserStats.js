const mongoose = require('mongoose');

const userStatsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      unique: true,
      index: true
    },
    points: {
      type: Number,
      default: 0,
      min: 0
    },
    level: {
      type: Number,
      default: 1,
      min: 1
    },
    totalReviews: {
      type: Number,
      default: 0,
      min: 0
    },
    totalDiscussions: {
      type: Number,
      default: 0,
      min: 0
    },
    totalComments: {
      type: Number,
      default: 0,
      min: 0
    },
    totalFavorites: {
      type: Number,
      default: 0,
      min: 0
    },
    loginStreak: {
      type: Number,
      default: 0,
      min: 0
    },
    lastLoginDate: {
      type: Date,
      default: null
    },
    longestStreak: {
      type: Number,
      default: 0,
      min: 0
    },
    currentWeekPoints: {
      type: Number,
      default: 0,
      min: 0
    },
    currentMonthPoints: {
      type: Number,
      default: 0,
      min: 0
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

const UserStats = mongoose.model('UserStats', userStatsSchema);

module.exports = UserStats;
