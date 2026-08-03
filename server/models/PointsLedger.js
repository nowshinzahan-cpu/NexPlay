const mongoose = require('mongoose');

const pointsLedgerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true
    },
    action: {
      type: String,
      required: [true, 'Action is required'],
      enum: [
        'review_created', 'review_liked',
        'discussion_created', 'comment_created',
        'comment_liked', 'favorite_added',
        'login_streak', 'badge_earned',
        'level_up', 'daily_login',
        'profile_completed', 'watchlist_added'
      ],
      index: true
    },
    points: {
      type: Number,
      required: [true, 'Points are required']
    },
    refId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    refModel: {
      type: String,
      default: null
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    // Weekly/monthly tracking for leaderboards
    weekStart: {
      type: Date,
      default: null,
      index: true
    },
    monthStart: {
      type: Date,
      default: null,
      index: true
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

pointsLedgerSchema.index({ userId: 1, createdAt: -1 });
pointsLedgerSchema.index({ action: 1, createdAt: -1 });
pointsLedgerSchema.index({ weekStart: 1, points: -1 });
pointsLedgerSchema.index({ monthStart: 1, points: -1 });

const PointsLedger = mongoose.model('PointsLedger', pointsLedgerSchema);

module.exports = PointsLedger;
