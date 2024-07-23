function sessionAuth(req, res, next) {
  if (req.session.userId) {
    // User is authenticated, proceed to the next middleware/route handler
    next();
  } else {
    // User is not authenticated, redirect to login or send an error
    res.status(401).send('You must be logged in to access this page');
  }
}

module.exports = sessionAuth;
