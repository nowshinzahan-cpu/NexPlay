const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      index: true
    },
    originalTitle: {
      type: String,
      default: '',
      trim: true
    },
    type: {
      type: String,
      enum: ['MOVIE', 'TV_SERIES', 'WEB_SERIES', 'ANIME', 'DOCUMENTARY'],
      required: [true, 'Content type is required'],
      index: true
    },
    description: {
      type: String,
      default: '',
      maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    poster: {
      type: String,
      default: ''
    },
    backdrop: {
      type: String,
      default: ''
    },
    genres: [{
      type: String,
      trim: true
    }],
    tags: [{
      type: String,
      trim: true
    }],
    spokenLanguage: {
      type: String,
      default: 'English',
      trim: true,
      index: true
    },
    languages: [{
      type: String,
      trim: true
    }],
    releaseYear: {
      type: Number,
      index: true
    },
    releaseMonth: {
      type: Number,
      min: 0,
      max: 11,
      default: null,
      index: true
    },
    rating: {
      type: Number,
      min: 0,
      max: 10,
      default: 0
    },
    status: {
      type: String,
      enum: ['Released', 'Upcoming', 'Ongoing', 'Completed'],
      default: 'Released',
      index: true
    },
    platforms: [{
      type: String,
      trim: true
    }],
    // TV Series specific fields
    episodeCount: {
      type: Number,
      default: 0
    },
    currentEpisode: {
      type: Number,
      default: 0
    },
    // Trending/Popularity
    popularity: {
      type: Number,
      default: 0,
      index: true
    },
    trending: {
      type: Number,
      default: 0,
      index: true
    },
    // Featured content (admin-managed)
    isFeatured: {
      type: Boolean,
      default: false,
      index: true
    },
    // Company that published this content
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      default: null
    },
    // TMDB integration (FR-48)
    tmdbId: {
      type: Number,
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

// Text index for search (default_language: 'none' disables stemming so custom
// language names like 'Korean', 'Hindi', 'Bangla' don't cause errors)
contentSchema.index(
  { title: 'text', originalTitle: 'text', tags: 'text', genres: 'text', description: 'text' },
  {
    weights: { title: 10, originalTitle: 8, tags: 6, genres: 4, description: 2 },
    default_language: 'none'
  }
);

// Compound indexes for filtering — isActive leads all query patterns
contentSchema.index({ isActive: 1, trending: -1 });
contentSchema.index({ isActive: 1, popularity: -1 });
contentSchema.index({ isActive: 1, rating: -1, popularity: -1 });
contentSchema.index({ isActive: 1, updatedAt: -1 });
contentSchema.index({ isActive: 1, status: 1, releaseYear: 1, createdAt: -1 });
contentSchema.index({ isActive: 1, title: 1 });
contentSchema.index({ type: 1, status: 1, releaseYear: -1 });
contentSchema.index({ type: 1, genres: 1, spokenLanguage: 1 });
contentSchema.index({ platforms: 1 });
contentSchema.index({ createdAt: -1 });

const Content = mongoose.model('Content', contentSchema);

module.exports = Content;
