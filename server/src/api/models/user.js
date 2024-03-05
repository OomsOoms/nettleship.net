const mongoose = require('mongoose');
const passwordHasher = require('../helpers/passwordHasher');

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
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
    passwordChangedAt: {
      type: Number,
      default: () => Math.floor(Date.now() / 1000),
    },
  },
  { collection: 'Users' }
);

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await passwordHasher.hashPassword(this.password);
  this.passwordChangedAt = Math.floor(Date.now() / 1000);
  next();
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
