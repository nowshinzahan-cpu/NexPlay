const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true
    },
    type: {
      type: String,
      required: [true, 'Favorite type is required'],
      enum: ['team', 'tournament', 'match', 'content'],
      index: true
    },
    refId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Reference ID is required']
    },
    refName: {
      type: String,
      default: '',
      trim: true
    },
    // For teams, store the sport type
    sportType: {
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

// A user can only favorite a specific item once
favoriteSchema.index({ userId: 1, type: 1, refId: 1 }, { unique: true });
favoriteSchema.index({ userId: 1, type: 1 });
favoriteSchema.index({ refId: 1, type: 1 });

const Favorite = mongoose.model('Favorite', favoriteSchema);

module.exports = Favorite;
