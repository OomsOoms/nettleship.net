const { Error } = require('../helpers');
const { User } = require('../models');

async function sessionAuth(req, res, next) {
  if (req.session.userId) {
    const user = await User.findById(req.session.userId);
    if (!user) {
      next(Error.invalidCredentials('User not found'));
    }
    // User is authenticated, proceed to the next middleware/route handler
    req.user = user;
    next();
  } else {
    // User is not authenticated send an error, frontend should redirect to login
    next(Error.invalidCredentials('Unauthorized'));
  }
}

// should only be used after sessionAuth
async function adminAuth(req, res, next) {
  if (!req.user.profile.roles.includes('admin')) {
    next(Error.forbidden('User is not an admin'));
  }
  next();
}

module.exports = {
  sessionAuth,
  adminAuth,
};
