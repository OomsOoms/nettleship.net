const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const { User, Token } = require('../models');
const { Error, sendEmail } = require('../helpers');
const { logger } = require('../../config/logger');

async function handleLocalStrategy(username, password, done) {
  try {
    const user = await User.findOne({ username });
    if (!user || !(await user.verifyPassword(password))) return done(null, false);
    return done(null, user);
  } catch (err) {
    return done(err);
  }
}

async function handleGoogleStrategy(req, accessToken, refreshToken, profile, cb) {
  try {
    // log the user into the account linked to the google account if it exists
    const existingUser = await User.findOne({ 'google.id': profile.id });
    if (existingUser) return cb(null, existingUser);

    // if the user is authenticated, link the google account to the user's account
    if (req.isAuthenticated()) {
      req.user.google = {
        id: profile.id,
        email: profile.email,
      };
      await req.user.save();
      return cb(null, req.user);
    }

    // Generate unique usernames until we find one that doesn't exist
    const baseUsername = profile.email.split('@')[0];
    let uniqueUsername = baseUsername;
    let count = 1;
    while (await User.findOne({ username: uniqueUsername })) {
      uniqueUsername = `${baseUsername}${count}`;
      count++;
    }

    // Create a new user and return it
    const user = new User({
      google: {
        id: profile.id,
        email: profile.email,
      },
      username: uniqueUsername,
      profile: {
        displayName: profile.displayName,
        avatarUrl: profile.picture,
      },
    });

    await user.save();

    return cb(null, user);
  } catch (err) {
    return cb(err, null);
  }
}

async function unlinkGoogle(user) {
  // return if the user is not linked to a google account
  if (!user.google.id) throw Error.BadRequest('Google account not linked');

  // check if the user has a local account
  if (!user.local.password) {
    // check the password because its required to have a local account, email or pending email could be null
    // send password reset email
    logger.debug('user has no local account, sending password reset email', user.google.email);

    // generate jti for the password reset token and store it in the database
    const jti = uuidv4();
    await Token.create({ jti, userId: user.id });

    // generate a password reset token with the user id and jti
    const token = jwt.sign({ userId: user.id, jti }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });

    const link = `${process.env.FRONTEND_DOMAIN}/reset-password?token=${token}`;

    // send the password reset email
    await sendEmail(user.google.email, 'resetPassword', { link, username: user.username });
    return 'Password reset email sent';
  }

  // copy the google email to the local email field
  user.google = null;
  await user.save();

  return 'Google account unlinked';
}

// i feel maybe the reset password stuff should be moved to the model but im unsure becuase it has db interaction and db interaction should be in the service layer not from one model to another
async function requestResetPassword(email) {
  const user = await User.findOne({ $or: [{ 'local.email': email }, { 'local.pendingEmail': email }] });

  // if the user has a verified email, send the password reset email
  if (user && user.local.email) {
    // generate jti for the password reset token and store it in the database
    const jti = uuidv4();
    await Token.create({ jti, userId: user.id });

    // generate a password reset token with the user id and jti
    const token = jwt.sign({ userId: user.id, jti }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });

    const link = `${process.env.FRONTEND_DOMAIN}/reset-password?token=${token}`;

    // send the password reset email
    await sendEmail(email, 'resetPassword', { link, username: user.username });
    return 'Password reset email sent';
    // if the user has an unverified email only send the verification email
  } else if (user && user.local.pendingEmail) {
    user.sendVerificationEmail();
    return 'Verification email sent, verify your email to reset your password';
  }
  // no error is thrown to avoid email enumeration
  return 'Password reset email sent';
}

async function resetPassword(token, password) {
  // verify the token
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  const existingToken = await Token.findOne({ jti: decoded.jti });
  if (!existingToken) throw Error.BadRequest('Invalid token');

  // delete the token from the database
  await Token.deleteOne({ jti: decoded.jti });

  // find the user by id
  const user = await User.findById(decoded.userId);

  // set the new password
  user.local.password = password;
  await user.save();
}

async function deserializeUser(serializedUser) {
  try {
    const user = await User.findById(serializedUser.id);
    return user;
  } catch (err) {
    return err;
  }
}

module.exports = {
  handleLocalStrategy,
  handleGoogleStrategy,
  unlinkGoogle,
  requestResetPassword,
  resetPassword,
  deserializeUser,
};
