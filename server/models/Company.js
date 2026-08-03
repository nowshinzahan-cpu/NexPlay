const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const companySchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      minlength: [2, 'Company name must be at least 2 characters'],
      maxlength: [100, 'Company name cannot exceed 100 characters']
    },
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [30, 'Username cannot exceed 30 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false
    },
    description: {
      type: String,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: ''
    },
    industry: {
      type: String,
      default: '',
      trim: true
    },
    website: {
      type: String,
      default: '',
      trim: true
    },
    logo: {
      type: String,
      default: ''
    },
    foundedYear: {
      type: Number,
      min: [1800, 'Invalid founding year'],
      validate: {
        validator: function(v) {
          return !v || v <= new Date().getFullYear();
        },
        message: 'Founding year cannot be in the future'
      }
    },
    location: {
      type: String,
      default: '',
      trim: true
    },
    socialMediaLinks: {
      facebook: { type: String, default: '' },
      twitter: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      instagram: { type: String, default: '' }
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending'
    },
    rejectionReason: {
      type: String,
      default: '',
      maxlength: [500, 'Rejection reason cannot exceed 500 characters']
    },
    approvedAt: {
      type: Date,
      default: null
    },
    rejectedAt: {
      type: Date,
      default: null
    },
    isActive: {
      type: Boolean,
      default: true
    },
    lastLogin: {
      type: Date
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.password;
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Indexes: unique constraints on email and username already create indexes automatically
companySchema.index({ verificationStatus: 1 });
companySchema.index({ isActive: 1 });

companySchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(
    parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 12
  );
  this.password = await bcrypt.hash(this.password, salt);
});

companySchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

companySchema.methods.toPublicProfile = function () {
  return {
    id: this._id,
    companyName: this.companyName,
    username: this.username,
    email: this.email,
    description: this.description,
    industry: this.industry,
    website: this.website,
    logo: this.logo,
    foundedYear: this.foundedYear,
    location: this.location,
    socialMediaLinks: this.socialMediaLinks,
    verificationStatus: this.verificationStatus,
    rejectionReason: this.rejectionReason,
    approvedAt: this.approvedAt,
    rejectedAt: this.rejectedAt,
    isActive: this.isActive,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

const Company = mongoose.model('Company', companySchema);

module.exports = Company;
