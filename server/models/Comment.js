const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    discussionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Discussion',
      required: [true, 'Discussion ID is required'],
      index: true
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author is required'],
      index: true
    },
    body: {
      type: String,
      required: [true, 'Comment body is required'],
      maxlength: [5000, 'Comment cannot exceed 5000 characters'],
      trim: true
    },
    parentCommentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
      default: null,
      index: true
    },
    depth: {
      type: Number,
      default: 0,
      min: 0,
      max: 3
    },
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    likeCount: {
      type: Number,
      default: 0,
      min: 0
    },
    isHidden: {
      type: Boolean,
      default: false,
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

commentSchema.index({ discussionId: 1, createdAt: 1 });
commentSchema.index({ discussionId: 1, parentCommentId: 1 });
commentSchema.index({ authorId: 1, createdAt: -1 });
commentSchema.index({ likeCount: -1 });

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
