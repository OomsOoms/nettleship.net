const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth2').Strategy;

const { authService } = require('../api/services');

passport.use(new LocalStrategy(authService.handleLocalStrategy));

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.BACKEND_DOMAIN + '/api/auth/google/callback',
      passReqToCallback: true,
    },
    authService.handleGoogleStrategy
  )
);

passport.serializeUser(function (user, cb) {
  process.nextTick(function () {
    const serializedUser = {
      id: user.id,
      provider: user.google ? 'google' : 'local',
    };
    return cb(null, serializedUser);
  });
});

passport.deserializeUser(function (serializedUser, cb) {
  process.nextTick(async function () {
    const user = await authService.deserializeUser(serializedUser);
    return cb(null, user);
  });
});

module.exports = passport;
