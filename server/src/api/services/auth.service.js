const { User } = require('../models');

async function handleGoogleStrategy(accessToken, refreshToken, profile, cb) {
  try {
    const existingUser = await User.findOne({ googleId: profile.id });
    if (existingUser) return cb(null, existingUser);

    const baseUsername = profile.email.split('@')[0];
    let uniqueUsername = baseUsername;

    // Generate unique usernames until we find one that doesn't exist
    let count = 1;
    while (await User.findOne({ username: uniqueUsername })) {
      uniqueUsername = `${baseUsername}${count}`;
      count++;
    }

    const user = new User({
      googleId: profile.id,
      username: uniqueUsername,
      profile: {
        displayName: profile.displayName,
        profilePicture: profile.picture,
      },
    });
    await user.save();
    return cb(null, user);
  } catch (err) {
    return cb(err);
  }
}

async function handleLocalStrategy(username, password, done) {
  try {
    const user = await User.findOne({ username });
    if (!user || !(await user.verifyPassword(password))) return done(null, false);
    return done(null, user);
  } catch (err) {
    return done(err);
  }
}

module.exports = {
  handleGoogleStrategy,
  handleLocalStrategy,
};
