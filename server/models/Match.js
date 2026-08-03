const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema(
  {
    homeTeam: {
      type: String,
      required: [true, 'Home team is required'],
      trim: true,
      index: true
    },
    awayTeam: {
      type: String,
      required: [true, 'Away team is required'],
      trim: true,
      index: true
    },
    competition: {
      type: String,
      required: [true, 'Competition name is required'],
      trim: true
    },
    sportType: {
      type: String,
      required: [true, 'Sport type is required'],
      enum: ['Football', 'Cricket', 'Basketball', 'Tennis', 'Baseball', 'Hockey', 'Soccer', 'MMA', 'Boxing', 'Golf', 'Rugby', 'Other'],
      index: true
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
      enum: ['scheduled', 'live', 'halftime', 'finished', 'postponed'],
      default: 'scheduled',
      index: true
    },
    minute: {
      type: Number,
      default: 0
    },
    kickoffTime: {
      type: Date,
      required: [true, 'Kickoff time is required'],
      index: true
    },
    venue: {
      type: String,
      default: '',
      trim: true
    },
    referee: {
      type: String,
      default: '',
      trim: true
    },
    // Possession, shots, fouls, corners, cards stats
    stats: {
      homePossession: { type: Number, default: 50 },
      awayPossession: { type: Number, default: 50 },
      homeShots: { type: Number, default: 0 },
      awayShots: { type: Number, default: 0 },
      homeShotsOnTarget: { type: Number, default: 0 },
      awayShotsOnTarget: { type: Number, default: 0 },
      homeFouls: { type: Number, default: 0 },
      awayFouls: { type: Number, default: 0 },
      homeCorners: { type: Number, default: 0 },
      awayCorners: { type: Number, default: 0 },
      homeYellowCards: { type: Number, default: 0 },
      awayYellowCards: { type: Number, default: 0 },
      homeRedCards: { type: Number, default: 0 },
      awayRedCards: { type: Number, default: 0 }
    },
    // External reference
    externalId: {
      type: String,
      default: null,
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

matchSchema.index({ status: 1, kickoffTime: -1 });
matchSchema.index({ sportType: 1, status: 1 });
matchSchema.index({ competition: 1, status: 1 });
matchSchema.index({ isActive: 1, status: 1 });
matchSchema.index({ homeTeam: 1, awayTeam: 1, kickoffTime: 1 });

const Match = mongoose.model('Match', matchSchema);

module.exports = Match;
