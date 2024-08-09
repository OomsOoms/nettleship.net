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
    unverifiedEmail: {
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
        default:
          'https://i.pinimg.com/736x/c3/57/fa/c357face2de95f03e31c27cecec2ef63.jpg',
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

// run when a document is created with await User.create()

// run when a document is saved with await user.save()ho
UserSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await hashPassword(this.password);
    this.passwordChangedAt = Date.now();
  }
  if (this.isNew) {
    this.profile.displayName = this.username;
    this.email = this.unverifiedEmail;
  }
  next();
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
