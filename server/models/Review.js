const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required']
    },
    contentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Content',
      required: [true, 'Content ID is required']
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [10, 'Rating cannot exceed 10']
    },
    review: {
      type: String,
      default: '',
      maxlength: [1000, 'Review cannot exceed 1000 characters'],
      trim: true
    },
    isModerated: {
      type: Boolean,
      default: false
    },
    moderatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
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

// A user can only review a specific content once
reviewSchema.index({ userId: 1, contentId: 1 }, { unique: true });
reviewSchema.index({ contentId: 1, isActive: 1 });
reviewSchema.index({ userId: 1 });

// Static method to calculate average rating for a content
reviewSchema.statics.calculateAverageRating = async function (contentId) {
  const result = await this.aggregate([
    { $match: { contentId: new mongoose.Types.ObjectId(contentId), isActive: true } },
    { $group: { _id: '$contentId', averageRating: { $avg: '$rating' }, count: { $sum: 1 } } }
  ]);
  return result.length > 0
    ? { averageRating: Math.round(result[0].averageRating * 10) / 10, count: result[0].count }
    : { averageRating: 0, count: 0 };
};

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
