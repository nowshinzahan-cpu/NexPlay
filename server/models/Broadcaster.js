const mongoose = require('mongoose');

const broadcasterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Broadcaster name is required'],
      unique: true,
      trim: true
    },
    logoUrl: {
      type: String,
      default: ''
    },
    website: {
      type: String,
      default: '',
      trim: true
    },
    regions: [{
      type: String,
      trim: true
    }],
    isOfficial: {
      type: Boolean,
      default: true
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

broadcasterSchema.index({ isActive: 1 });

const Broadcaster = mongoose.model('Broadcaster', broadcasterSchema);

module.exports = Broadcaster;
