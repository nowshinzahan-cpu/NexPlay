const mongoose = require('mongoose');

const platformSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Platform name is required'],
      unique: true,
      trim: true
    },
    logo: {
      type: String,
      default: ''
    },
    website: {
      type: String,
      default: '',
      trim: true
    },
    description: {
      type: String,
      default: '',
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    supportedRegions: [{
      type: String,
      trim: true
    }],
    contentTypes: [{
      type: String,
      enum: ['MOVIE', 'TV_SERIES', 'ANIME', 'DOCUMENTARY', 'SPORTS', 'ALL'],
      default: 'ALL'
    }],
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

platformSchema.index({ isActive: 1 }); // name index is auto-created via unique:true

const Platform = mongoose.model('Platform', platformSchema);

module.exports = Platform;
