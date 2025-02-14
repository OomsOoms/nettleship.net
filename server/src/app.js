require('dotenv').config({ path: `.env.${process.env.NODE_ENV}` });

const express = require('express');
const morgan = require('morgan');
const passport = require('passport');
const helmet = require('helmet');
const compression = require('compression');

const corsMiddleware = require('./config/corsOptions');
const { logger, accessLogStream } = require('./config/logger');
const db = require('./config/db');
const sessionConfig = require('./config/sessionConfig');
const { errorHandler, rateLimiter } = require('./api/middlewares');

const app = express();
const PORT = process.env.PORT || 3000;

// trust first proxy
app.set('trust proxy', 1);

// middleware for logging
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined', { stream: accessLogStream })); // file logs only
} else {
  // tests and development
  app.use(morgan('dev')); // console logs only
}

// Enable security-related HTTP headers
app.use(helmet());

// Enable response compression
app.use(compression());

// Enable CORS for all routes
app.use(corsMiddleware);

// built-in middleware for json
app.use(express.json());

// session middleware for passport and express-session
app.use(sessionConfig);
app.use(passport.initialize()); // init passport on every route call // adds the req.isAuthenticated() method and req.user object etc
app.use(passport.session()); //allow passport to use "express-session"

// rate limiter middleware - limits the number of requests from an IP
app.use(rateLimiter.generalLimiter);

// Serve static files
app.use(express.static('public'));

// routes
require('./api/routes')(app);

// error handling middleware
app.all('*', (req, res) => {
  res.status(404).json({ message: '404 Route does not exist' });
});

// error handler middleware
app.use(errorHandler);

// Connect to server
db.connect().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    logger.info(`Server is running on http://localhost:${PORT}/`);
  });
});

module.exports = app;
