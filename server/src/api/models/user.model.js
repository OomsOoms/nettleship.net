const mongoose = require('mongoose');
const { hashPassword } = require('../helpers');

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    profile: {
      displayName: {
        type: String,
        default: this.username,
      },
      bio: {
        type: String,
        default: 'No bio provided',
      },
      profilePicture: {
        type: String,
        default:
          'https://i.pinimg.com/736x/c3/57/fa/c357face2de95f03e31c27cecec2ef63.jpg',
      },
    },
    settings: {
      language: {
        type: String,
        default: 'en',
      },
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      index: {
        expireAfterSeconds: 60,
        partialFilterExpression: { active: false },
      },
    },
    updatedAt: {
      type: Date,
      default: () => Date.now(),
    },
    roles: {
      type: [String],
      default: ['user'],
    },
    active: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
  },
  { collection: 'Users' }
);

UserSchema.pre('save', function (next) {
  // 'this' refers to the User document.
  if (!this.profile.displayName) {
    this.profile.displayName = this.username;
  }
  next();
});
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await hashPassword(this.password);
  this.passwordChangedAt = Math.floor(Date.now() / 1000);
  next();
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
