require('dotenv').config();

const express = require('express');
const morgan = require('morgan');

const corsMiddleware = require('./config/corsOptions');
const { logger, accessLogStream } = require('./config/logger');
const db = require('./config/db');
const sessionConfig = require('./config/sessionConfig');
const { errorHandler, rateLimiter } = require('./api/middlewares');

const app = express();
const PORT = process.env.PORT || 8000;

// middleware for logging
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined', { stream: accessLogStream })); // file logs only
} else {
  // tests and development
  app.use(morgan('dev')); // console logs only
}

// Enable CORS for all routes
app.use(corsMiddleware);

// built-in middleware for json
app.use(express.json());

// session middleware need to move this to a separate file
app.use(sessionConfig);

// rate limiter middleware - limits the number of requests from an IP
app.use(rateLimiter.generalLimiter);

// routes
require('./api/routes/index.js')(app);

// error handling middleware
app.all('*', (req, res) => {
  res.status(404).json({ message: '404 Route does not exist' });
});
app.use(errorHandler);

// Connect to server
db.connect().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    logger.info(`Server is running on http://localhost:${PORT}/`);
  });
});

module.exports = app;
