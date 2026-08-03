const mongoose = require('mongoose');

const sportSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true
    },
    sportType: {
      type: String,
      required: [true, 'Sport type is required'],
      enum: ['Football', 'Cricket', 'Basketball', 'Tennis', 'Baseball', 'Hockey', 'Soccer', 'MMA', 'Boxing', 'Golf', 'Rugby', 'Other'],
      index: true
    },
    tournamentName: {
      type: String,
      default: '',
      trim: true
    },
    homeTeam: {
      type: String,
      required: [true, 'Home team is required'],
      trim: true
    },
    awayTeam: {
      type: String,
      required: [true, 'Away team is required'],
      trim: true
    },
    homeScore: {
      type: Number,
      default: 0
    },
    awayScore: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['Upcoming', 'Live', 'Completed'],
      default: 'Upcoming',
      index: true
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
      index: true
    },
    endDate: {
      type: Date
    },
    venue: {
      type: String,
      default: '',
      trim: true
    },
    streamingLinks: [{
      name: { type: String, required: true },
      url: { type: String, required: true }
    }],
    poster: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      default: '',
      maxlength: [1000, 'Description cannot exceed 1000 characters']
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

// Indexes for efficient queries
sportSchema.index({ status: 1, startDate: -1 });
sportSchema.index({ sportType: 1, status: 1 });
sportSchema.index({ isActive: 1, status: 1 });

const Sport = mongoose.model('Sport', sportSchema);

module.exports = Sport;
