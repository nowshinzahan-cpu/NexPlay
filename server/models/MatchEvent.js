const mongoose = require('mongoose');

const matchEventSchema = new mongoose.Schema(
  {
    matchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Match',
      required: [true, 'Match ID is required'],
      index: true
    },
    minute: {
      type: Number,
      required: [true, 'Event minute is required'],
      min: 0
    },
    addedTime: {
      type: Number,
      default: 0
    },
    type: {
      type: String,
      required: [true, 'Event type is required'],
      enum: ['goal', 'yellow_card', 'red_card', 'substitution', 'penalty', 'own_goal', 'corner', 'foul', 'offside', 'shot', 'shot_on_target', 'save', 'injury_time'],
      index: true
    },
    team: {
      type: String,
      required: [true, 'Team is required'],
      enum: ['home', 'away']
    },
    playerName: {
      type: String,
      default: '',
      trim: true
    },
    assistedBy: {
      type: String,
      default: '',
      trim: true
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: 200
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

matchEventSchema.index({ matchId: 1, minute: 1 });
matchEventSchema.index({ matchId: 1, type: 1 });

const MatchEvent = mongoose.model('MatchEvent', matchEventSchema);

module.exports = MatchEvent;
