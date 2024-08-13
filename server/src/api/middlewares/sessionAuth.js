const { Error } = require('../helpers');

function sessionAuth(req, res, next) {
  if (req.session.userId) {
    // User is authenticated, proceed to the next middleware/route handler
    next();
  } else {
    // User is not authenticated send an error, frontend should redirect to login
    throw Error.invalidCredentials('Unauthorized');
  }
}

module.exports = sessionAuth;
