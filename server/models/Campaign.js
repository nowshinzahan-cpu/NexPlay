const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Company ID is required']
    },
    name: {
      type: String,
      required: [true, 'Campaign name is required'],
      trim: true,
      minlength: [3, 'Campaign name must be at least 3 characters'],
      maxlength: [100, 'Campaign name cannot exceed 100 characters']
    },
    description: {
      type: String,
      default: '',
      maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    advertisements: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Advertisement'
      }
    ],
    status: {
      type: String,
      enum: ['draft', 'active', 'paused', 'completed', 'rejected'],
      default: 'draft'
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
    targetAudience: {
      type: String,
      default: '',
      maxlength: [500, 'Target audience description cannot exceed 500 characters']
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

campaignSchema.index({ companyId: 1 });
campaignSchema.index({ status: 1 });

const Campaign = mongoose.model('Campaign', campaignSchema);

module.exports = Campaign;
