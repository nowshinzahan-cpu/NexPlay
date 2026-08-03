const mongoose = require('mongoose');

const lineupSchema = new mongoose.Schema(
  {
    matchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Match',
      required: [true, 'Match ID is required'],
      index: true
    },
    team: {
      type: String,
      required: [true, 'Team is required'],
      enum: ['home', 'away']
    },
    formation: {
      type: String,
      default: '',
      trim: true
    },
    players: [{
      name: { type: String, required: true, trim: true },
      number: { type: Number, required: true },
      position: { type: String, default: '', trim: true },
      isCaptain: { type: Boolean, default: false },
      isGoalkeeper: { type: Boolean, default: false }
    }],
    substitutes: [{
      name: { type: String, required: true, trim: true },
      number: { type: Number, required: true },
      position: { type: String, default: '', trim: true }
    }],
    coach: {
      type: String,
      default: '',
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

lineupSchema.index({ matchId: 1, team: 1 }, { unique: true });

const Lineup = mongoose.model('Lineup', lineupSchema);

module.exports = Lineup;
