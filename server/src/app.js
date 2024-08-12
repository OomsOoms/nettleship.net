require('dotenv').config();

const express = require('express');

const corsMiddleware = require('./config/corsOptions.js');
const db = require('./config/db.js');
const sessionConfig = require('./config/sessionConfig.js');
const {
  logger,
  errorHandler,
  rateLimiter,
} = require('./api/middlewares/index.js');

const app = express();
const PORT = process.env.PORT || 8000;

// middleware for logging
app.use(logger);

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
app.use(errorHandler);
app.all('*', (req, res) => {
  res.status(404).json({ message: '404 Route does not exist' });
});

// Connect to server
db.connect().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://localhost:${PORT}/`);
  });
});

module.exports = app;
