const mongoose = require('mongoose');

const streamAvailabilitySchema = new mongoose.Schema(
  {
    matchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Match',
      required: [true, 'Match ID is required'],
      index: true
    },
    broadcasterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Broadcaster',
      required: [true, 'Broadcaster ID is required']
    },
    region: {
      type: String,
      required: [true, 'Region is required'],
      trim: true,
      index: true
    },
    url: {
      type: String,
      required: [true, 'Stream URL is required'],
      trim: true
    },
    isOfficial: {
      type: Boolean,
      default: true
    },
    isFree: {
      type: Boolean,
      default: false
    },
    quality: {
      type: String,
      enum: ['SD', 'HD', '4K', 'Auto'],
      default: 'HD'
    },
    language: {
      type: String,
      default: 'English',
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

streamAvailabilitySchema.index({ matchId: 1, region: 1 });
streamAvailabilitySchema.index({ matchId: 1, broadcasterId: 1, region: 1 }, { unique: true });

const StreamAvailability = mongoose.model('StreamAvailability', streamAvailabilitySchema);

module.exports = StreamAvailability;
