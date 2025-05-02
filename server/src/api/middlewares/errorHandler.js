const { logger } = require('../../config/logger');

// Catch all errors and send them to the client with a stack trace if in development
const errorHandler = (error, req, res, next) => {
    const errorStatus = error.status || 500;
    const errorMessage = error.message || 'Internal server error';
    const method = req.method;
    const url = req.originalUrl;
    const timestamp = new Date().toISOString();
    const userId = req.user ? req.user.id : 'Not authenticated';

    // Send a response to the client
    res.status(errorStatus).json({
        message: errorMessage,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });

    // only log 500 errors
    if (errorStatus >= 500) {
        logger.error(`${timestamp} | ${method} | ${url} | ${errorStatus} | ${errorMessage} | ${userId}`);
    }
    // 400 errors are already logged with morgan in the access.log
};

module.exports = errorHandler;
