const logEvent = require('../../config/logEvent');

// eslint-disable-next-line no-unused-vars
const errorHandler = (error, req, res, next) => {
  const errorStatus = error.status || 500;
  const errorMessage = error.message || 'Internal server error';
  const method = req.method;
  const url = req.originalUrl;
  const timestamp = new Date().toISOString();
  const userId = req.user ? req.user.id : 'Not authenticated';

  // Construct a detailed error log message
  const detailedErrorMessage = `
     Error: ${errorMessage}
    Method: ${method}
     URL: ${url}
     Timestamp: ${timestamp}
     User ID: ${userId}
     Stack Trace: ${error.stack}
  `;

  // Log the detailed error message
  logEvent(detailedErrorMessage, 'errorLog.log');

  // Send a response to the client
  res.status(errorStatus).json({ error: errorMessage });
};

module.exports = errorHandler;
