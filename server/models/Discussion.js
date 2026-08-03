const mongoose = require('mongoose');

const discussionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Discussion title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    body: {
      type: String,
      required: [true, 'Discussion body is required'],
      maxlength: [10000, 'Body cannot exceed 10000 characters'],
      trim: true
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author is required'],
      index: true
    },
    pinned: {
      type: Boolean,
      default: false,
      index: true
    },
    locked: {
      type: Boolean,
      default: false,
      index: true
    },
    tags: [{
      type: String,
      trim: true
    }],
    viewCount: {
      type: Number,
      default: 0,
      min: 0
    },
    commentCount: {
      type: Number,
      default: 0,
      min: 0
    },
    lastActivityAt: {
      type: Date,
      default: Date.now,
      index: true
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

discussionSchema.index({ pinned: -1, lastActivityAt: -1 });
discussionSchema.index({ authorId: 1, createdAt: -1 });
discussionSchema.index({ tags: 1 });
discussionSchema.index({ isActive: 1, pinned: -1, lastActivityAt: -1 });
discussionSchema.index(
  { title: 'text', body: 'text', tags: 'text' },
  { weights: { title: 10, body: 5, tags: 8 }, default_language: 'none' }
);

const Discussion = mongoose.model('Discussion', discussionSchema);

module.exports = Discussion;
