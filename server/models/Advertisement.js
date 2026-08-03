const mongoose = require('mongoose');

const advertisementSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Company ID is required']
    },
    title: {
      type: String,
      required: [true, 'Advertisement title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
      type: String,
      default: '',
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    imageUrl: {
      type: String,
      default: ''
    },
    targetUrl: {
      type: String,
      default: '',
      trim: true
    },
    placement: {
      type: String,
      enum: ['banner', 'sidebar', 'popup', 'featured'],
      default: 'banner'
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'paused', 'rejected', 'expired'],
      default: 'pending'
    },
    startDate: {
      type: Date
    },
    endDate: {
      type: Date
    },
    budget: {
      type: Number,
      min: [0, 'Budget cannot be negative'],
      default: 0
    },
    rejectionReason: {
      type: String,
      default: '',
      maxlength: [500, 'Rejection reason cannot exceed 500 characters']
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

advertisementSchema.index({ companyId: 1 });
advertisementSchema.index({ status: 1 });
advertisementSchema.index({ placement: 1 });

const Advertisement = mongoose.model('Advertisement', advertisementSchema);

module.exports = Advertisement;
