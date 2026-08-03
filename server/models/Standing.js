const mongoose = require('mongoose');

const standingSchema = new mongoose.Schema(
  {
    competition: {
      type: String,
      required: [true, 'Competition name is required'],
      trim: true,
      index: true
    },
    teamName: {
      type: String,
      required: [true, 'Team name is required'],
      trim: true
    },
    played: {
      type: Number,
      default: 0,
      min: 0
    },
    wins: {
      type: Number,
      default: 0,
      min: 0
    },
    draws: {
      type: Number,
      default: 0,
      min: 0
    },
    losses: {
      type: Number,
      default: 0,
      min: 0
    },
    goalsFor: {
      type: Number,
      default: 0,
      min: 0
    },
    goalsAgainst: {
      type: Number,
      default: 0,
      min: 0
    },
    goalDifference: {
      type: Number,
      default: 0
    },
    points: {
      type: Number,
      default: 0,
      min: 0
    },
    position: {
      type: Number,
      default: 0,
      min: 0
    },
    form: [{
      type: String,
      enum: ['W', 'D', 'L']
    }],
    season: {
      type: String,
      default: new Date().getFullYear().toString()
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

standingSchema.index({ competition: 1, points: -1, goalDifference: -1, goalsFor: -1 });
standingSchema.index({ competition: 1, teamName: 1 }, { unique: true });
standingSchema.index({ competition: 1, position: 1 });

const Standing = mongoose.model('Standing', standingSchema);

module.exports = Standing;
