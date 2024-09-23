require('dotenv').config();

const express = require('express');
const morgan = require('morgan');
const passport = require('passport');

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
app.set('trust proxy', 1);

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

app.get('/login', (req, res) => {
  res.send(`
 <html>
      <body>
        <h1>Login</h1>
        <a href="/api/auth/google">Authenticate with Google</a>
      </body>
    </html>
  `);
});

app.get('/protected', (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ message: 'Unauthorized' });
  res.send(`Hello ${req.user.username}`);
});
// req.login() will login a user on signup

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
