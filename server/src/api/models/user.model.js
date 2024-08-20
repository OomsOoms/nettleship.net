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
      unique: true,
      default: null,
    },
    newEmail: {
      type: String,
      unique: true,
      required: function () {
        return this.isNew;
      },
    },
    password: {
      type: String,
      required: true,
    },
    profile: {
      displayName: {
        type: String,
        default: null,
      },
      bio: {
        type: String,
        default: '',
      },
      profilePicture: {
        type: String,
        default: 'http://localhost:8000/uploads/avatars/default-avatar.jpg',
      },
      roles: {
        type: [String],
        default: ['user'],
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
    },
    passwordChangedAt: {
      type: Date,
      default: Date.now(),
    },
  },
  { collection: 'Users' }
);

// run when a document is saved with await user.save()ho
UserSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await hashPassword(this.password);
    this.passwordChangedAt = Date.now();
  }
  if (this.isNew) {
    this.profile.displayName = this.username;
    this.email = this.newEmail;
  }
  next();
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
