const MongoStore = require('connect-mongo');
const session = require('express-session');

// Export the session configuration to be used in app.js
module.exports = session({
  // Secret key for signing session cookies
  // Should be a random, unguessable string stored in environment variables
  secret: process.env.SESSION_SECRET,

  // Don't save session if nothing changed
  // Prevents unnecessary writes to the session store
  resave: false,

  // Don't create session for unauthenticated users
  // Saves resources by only creating sessions for logged-in users
  saveUninitialized: true,

  // Configure MongoDB session store
  store: MongoStore.create({
    // Connection string to MongoDB
    mongoUrl: process.env.DATABASE_URI,

    // Name of collection to store sessions
    collectionName: 'sessions',

    // Time to live in seconds (14 days)
    // Sessions will automatically expire after this time
    ttl: 14 * 24 * 60 * 60,

    // Use MongoDB's native expiration mechanism
    autoRemove: 'native',

    // Store cookies as objects instead of strings
    // Allows for easier manipulation of cookie data
    stringify: false,
  }),

  // Cookie configuration
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    secure: false, // Change to true in production with HTTPS
    httpOnly: true,
    sameSite: 'lax', // i dont understand this
  },
});
