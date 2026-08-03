const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    targetType: {
      type: String,
      required: [true, 'Target type is required'],
      enum: ['discussion', 'comment', 'review', 'user'],
      index: true
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Target ID is required'],
      index: true
    },
    reporterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reporter is required']
    },
    reason: {
      type: String,
      required: [true, 'Reason is required'],
      enum: ['spam', 'harassment', 'inappropriate', 'misinformation', 'copyright', 'other']
    },
    description: {
      type: String,
      default: '',
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      trim: true
    },
    status: {
      type: String,
      enum: ['pending', 'resolved', 'dismissed'],
      default: 'pending'
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    resolvedAt: {
      type: Date,
      default: null
    },
    resolutionNote: {
      type: String,
      default: '',
      maxlength: [500, 'Resolution note cannot exceed 500 characters'],
      trim: true
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

reportSchema.index({ status: 1, createdAt: -1 });
reportSchema.index({ targetType: 1, targetId: 1 });
// Prevent duplicate reports from same user on same target
reportSchema.index({ targetType: 1, targetId: 1, reporterId: 1 }, { unique: true });

const Report = mongoose.model('Report', reportSchema);

module.exports = Report;
