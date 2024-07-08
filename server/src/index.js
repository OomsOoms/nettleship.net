require('dotenv').config();

const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');
const corsMiddleware = require('./config/corsOptions.js');
const connectDB = require('./config/db');
const { logger, errorHandler } = require('./api/middlewares');

const app = express();
const PORT = process.env.PORT || 8000;

// Connect to MongoDB
connectDB();

// middleware for logging
app.use(logger);

// Enable CORS for all routes
app.use(corsMiddleware);

// built-in middleware for json
app.use(express.json());

// session middleware need to move this to a separate file
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: process.env.DATABASE_URI,
      collectionName: 'sessions',
      ttl: 14 * 24 * 60 * 60, // 14 days
      autoRemove: 'native', // Let MongoDB handle the removal of expired sessions
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
      secure: false,
    },
  })
);

// Routes
require('./api/routes')(app);

// Error handling middleware
app.use(errorHandler);

// Error handling middleware
app.all('*', (req, res) => {
  res.status(404).json({ message: '404 Route does not exist' });
});

// Connect to server
mongoose.connection.once('open', () => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://localhost:${PORT}/`);
  });
});

module.exports = app;
