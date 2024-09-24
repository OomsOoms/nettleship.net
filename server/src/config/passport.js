const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const { authService } = require('../api/services');
const { User } = require('../api/models');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    authService.handleGoogleStrategy
  )
);

passport.use(new LocalStrategy(authService.handleLocalStrategy));

passport.serializeUser(function (user, cb) {
  process.nextTick(function () {
    const serializedUser = {
      id: user.id,
      provider: user.provider || 'local',
    };
    return cb(null, serializedUser);
  });
});

passport.deserializeUser(function (serializedUser, cb) {
  process.nextTick(async function () {
    const user = await User.findById(serializedUser.id);
    return cb(null, user);
  });
});

module.exports = passport;
