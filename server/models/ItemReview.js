const mongoose = require('mongoose');

const itemReviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Item ID is required'],
      index: true
    },
    itemType: {
      type: String,
      required: [true, 'Item type is required'],
      enum: ['content', 'match', 'sport', 'platform', 'broadcaster'],
      index: true
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5']
    },
    body: {
      type: String,
      default: '',
      maxlength: [2000, 'Review cannot exceed 2000 characters'],
      trim: true
    },
    helpfulVotes: {
      type: Number,
      default: 0,
      min: 0
    },
    helpfulVoters: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    verified: {
      type: Boolean,
      default: false
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

// One review per user per item
itemReviewSchema.index({ userId: 1, itemId: 1, itemType: 1 }, { unique: true });
itemReviewSchema.index({ itemId: 1, itemType: 1, isActive: 1 });
itemReviewSchema.index({ itemId: 1, itemType: 1, rating: 1 });
itemReviewSchema.index({ helpfulVotes: -1 });

// Static method to get rating summary for an item
itemReviewSchema.statics.getRatingSummary = async function (itemId, itemType) {
  const result = await this.aggregate([
    { $match: { itemId: new mongoose.Types.ObjectId(itemId), itemType, isActive: true } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
        distribution: {
          $push: '$rating'
        }
      }
    }
  ]);

  if (result.length === 0) {
    return { averageRating: 0, totalReviews: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
  }

  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  result[0].distribution.forEach(r => {
    distribution[r] = (distribution[r] || 0) + 1;
  });

  return {
    averageRating: Math.round(result[0].averageRating * 10) / 10,
    totalReviews: result[0].totalReviews,
    distribution
  };
};

const ItemReview = mongoose.model('ItemReview', itemReviewSchema);

module.exports = ItemReview;
