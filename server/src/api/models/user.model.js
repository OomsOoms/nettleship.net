const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');

/**
 * I use this so that all authentication is handled through a single passport strategy
 *       required: function () {
        if (this.googleId) return false;
      },
 */

const UserSchema = new mongoose.Schema(
  {
    googleId: {
      type: String,
      default: null,
      unique: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      default: null,
      required: function () {
        if (this.googleId) return false;
      },
    },
    newEmail: {
      type: String,
      default: null,
      required: function () {
        if (this.googleId) return false;
        return this.isNew;
      },
    },
    password: {
      type: String,
      default: null,
      required: function () {
        if (this.googleId) return false;
      },
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
        default: '/uploads/avatars/default-avatar.jpg',
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

UserSchema.index({ name: 1, email: 1 }, { unique: true, partialFilterExpression: { email: { $type: 'string' } } });
UserSchema.index(
  { name: 1, newEmail: 1 },
  { unique: true, partialFilterExpression: { newEmail: { $type: 'string' } } }
);

// run when a document is saved with await user.save()
UserSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified or is new
  if (this.isModified('password')) {
    this.password = await bcryptjs.hash(this.password, process.env.SALT_ROUNDS || 10);
    this.passwordChangedAt = Date.now();
  }
  // If the user is new, set the displayName to the username
  if (this.isNew) {
    this.profile.displayName = this.username;
  }
  // Ensure that email and newEmail do not have overlapping unique values
  const query = {
    $or: [...(this.newEmail ? [{ email: this.newEmail }] : []), ...(this.email ? [{ newEmail: this.email }] : [])],
  };
  const existingUser = query.$or.length ? await User.findOne(query) : null;
  if (existingUser) {
    if (existingUser.id !== this.id) {
      // Swap the vaues as this will force a default mongo conflict error
      const temp = this.newEmail;
      this.newEmail = this.email;
      this.email = temp;
    }
  }
  next();
});

UserSchema.methods.verifyPassword = async function (password) {
  return bcryptjs.compare(password, this.password);
};

const User = mongoose.model('User', UserSchema);

module.exports = User;
