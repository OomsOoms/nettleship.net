const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendEmail } = require('../helpers');

/**
 * required: function () {
          return !this.googleId && this.isNew;
        },
 */
// these dont seem to work
function googleSignUpRequired() {
  return this.isNew && this.google.id;
}

function localSignUpRequired() {
  console.log('googleSignUpRequired', this.isNew, this.google.id);
  console.log('localSignUpRequired', this.isNew, !this.google.id);
  return this.isNew && !this.google.id;
}

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      unique: true,
      required: true,
    },
    google: {
      id: {
        type: String,
        default: null,
        // unique: unless null
        //required: googleSignUpRequired,
      },
      email: {
        type: String,
        default: null,
        // required: googleSignUpRequired,
      },
    },
    local: {
      email: {
        type: String,
        default: null,
        // unique: unless null
      },
      newEmail: {
        type: String,
        default: null,
        // unique: unless null
        //required: localSignUpRequired,
      },
      password: {
        type: String,
        default: null,
        //required: localSignUpRequired,
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
      avatarUrl: {
        type: String,
        default: '/uploads/avatars/default-avatar.jpg',
        //required: googleSignUpRequired,
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

// Indexes - some unique indexes are partial to allow for null values
UserSchema.index(
  { name: 1, 'local.email': 1 },
  { unique: true, partialFilterExpression: { 'local.email': { $type: 'string' } } }
);
UserSchema.index(
  { name: 1, 'local.newEmail': 1 },
  { unique: true, partialFilterExpression: { 'local.newEmail': { $type: 'string' } } }
);
UserSchema.index({ 'google.id': 1 }, { unique: true, partialFilterExpression: { 'google.id': { $type: 'string' } } });

// Run when a document is saved with await user.save()
UserSchema.pre('save', async function (next) {
  this.oldDocument = this;
  this.wasNew = this.isNew;
  // Hash the password if it has been modified or is new
  if (this.isModified('local.password')) {
    this.local.password = await bcryptjs.hash(this.local.password, process.env.SALT_ROUNDS || 10);
    this.passwordChangedAt = Date.now();
  }

  if (this.isModified())
    if (this.isNew) {
      // Set displayName to username for new users
      this.profile.displayName = this.username;
    }

  // Ensure email and newEmail do not overlap, the error is thrown when saving
  const existingUser = await this.constructor.findOne({
    $or: [{ 'local.email': this.local.newEmail }, { 'local.newEmail': this.local.email }],
  });
  if (existingUser && existingUser.id !== this.id) {
    [this.local.email, this.local.newEmail] = [this.local.newEmail, this.local.email];
  }
  next();
});

// Run when a document is saved with await user.save()
UserSchema.post('save', async function (doc, next) {
  // Send a welcome email to new google users
  if (doc.google.email && doc.wasNew) {
    console.log('Sending welcome email to new google user');
  }
  // Send an email confirmation to new local users
  if (doc.local.newEmail !== doc.oldDocument.local.newEmail) {
    doc.sendVerificationEmail();
    if (doc.local.email) {
      sendEmail(doc.local.email, 'Email changed', 'emailChanged', {
        username: doc.username,
        email: doc.local.newEmail,
      });
    }
  }
  next();
});

UserSchema.methods.verifyPassword = async function (password) {
  return bcryptjs.compare(password, this.local.password);
};

UserSchema.methods.sendVerificationEmail = function () {
  const token = jwt.sign({ id: this.id }, process.env.JWT_SECRET_KEY, { expiresIn: '24h' });
  sendEmail(this.local.newEmail, 'Verify your email', 'verifyEmail', { username: this.username, token });
};

const User = mongoose.model('User', UserSchema);

module.exports = User;
