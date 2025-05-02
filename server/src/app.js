require('dotenv').config({ path: `.env.${process.env.NODE_ENV}` });

const express = require('express');
const enableWs = require('express-ws');
const morgan = require('morgan');
const passport = require('passport');

const { logger, accessLogStream } = require('./config/logger');
const db = require('./config/db');
const { errorHandler, rateLimiter } = require('./api/middlewares');
const sessionConfig = require('./config/sessionConfig');
const corsMiddleware = require('./config/corsOptions');

const app = express();
enableWs(app);

// trust first proxy
app.set('trust proxy', 1);

// middleware for logging
if (process.env.NODE_ENV === 'production') {
    app.use(morgan('combined', { stream: accessLogStream })); // file logs only
} else {
    // tests and development
    app.use(morgan('dev')); // console logs only
}

// built-in middleware for parsing URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// havent written abou tthis and im lazy so its gonna be like this should be moved to its own file


// session middleware
app.use(sessionConfig);
// passport middleware
app.use(passport.initialize());
app.use(passport.session());

// guest id middleware should move this to its own file because i could end up adding more to guest users
app.use((req, res, next) => {
    if (req.isAuthenticated()) return next();
    if (!req.session.guestId) {
        req.session.guestId = `guest_${Math.random().toString(36).substring(7)}`;
    }
    next();
});

// Enable CORS for all routes
app.use(corsMiddleware);

// rate limiter middleware - limits the number of requests from an IP
app.use(rateLimiter.generalLimiter);

// Serve static files
app.use(express.static('public'));

// routes
require('./api/routes')(app);

// server status route, useful for monitoring services
app.get('/api/status', (req, res) => {
    res.status(200).json({ status: 'Server is running' });
});

// error handling middleware
app.all('*', (req, res) => {
    res.status(404).json({ message: '404 Route does not exist' });
});

// error handler middleware - must be after routes
app.use(errorHandler);

db.connect().then(() => {
    const PORT = process.env.PORT || 8000;
    app.listen(PORT, '0.0.0.0', () => {
        logger.info(`Server is running on http://localhost:${PORT}/`);
    });
});
