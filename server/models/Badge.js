const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: [true, 'Badge key is required'],
      unique: true,
      trim: true
    },
    name: {
      type: String,
      required: [true, 'Badge name is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Badge description is required'],
      trim: true
    },
    iconUrl: {
      type: String,
      default: ''
    },
    category: {
      type: String,
      enum: ['reviewer', 'contributor', 'social', 'streak', 'milestone', 'achievement'],
      default: 'achievement',
      index: true
    },
    criteria: {
      type: String,
      required: [true, 'Badge criteria is required'],
      trim: true
    },
    pointsAwarded: {
      type: Number,
      default: 0,
      min: 0
    },
    isActive: {
      type: Boolean,
      default: true
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

const Badge = mongoose.model('Badge', badgeSchema);

module.exports = Badge;
