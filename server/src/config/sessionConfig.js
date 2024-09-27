const MongoStore = require('connect-mongo');
const session = require('express-session');

module.exports = session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.DATABASE_URI,
    collectionName: 'sessions',
    ttl: 14 * 24 * 60 * 60,
    autoRemove: 'native', //
    stringify: false, // Set stringify option to false to store cookies as objects
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7,
    secure: process.env.NODE_ENV === 'production', // Set secure to true if in production
  },
});
