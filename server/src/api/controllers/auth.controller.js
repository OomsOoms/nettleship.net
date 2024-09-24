const passport = require('../../config/passport'); // Instead of directly importing services, we import the passport configuration which uses the services

function localLogin(req, res) {
  return passport.authenticate('local', (err, user, info) => {
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
      //return res.redirect('/login');
    }
    // Same code is seen in register controller
    req.login(user, (err) => {
      req.session.ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      req.session.userAgent = req.headers['user-agent'];
      res.status(201).json({ message: 'Logged in successfully' });
      // res.redirect('/dashboard');
    });
  })(req, res);
}

function googleLogin(req, res) {
  return passport.authenticate('google', { scope: ['email', 'profile'] })(req, res);
}

function googleCallback(req, res) {
  return passport.authenticate('google', (err, user, info) => {
    console.log(user);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    req.logIn(user, (err) => {
      req.session.ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      req.session.userAgent = req.headers['user-agent'];
      return res.status(200).json({ message: 'Logged in successfully' });
    });
  })(req, res);
}

function resetPassword(req, res) {}

function logout(req, res) {
  if (!req.user) {
    return res.status(400).json({ message: 'You are not logged in' });
  }
  req.logout(function (err) {
    req.session.destroy();
    res.status(200).json({ message: 'Logged out successfully' });
  });
}

module.exports = {
  localLogin,
  googleLogin,
  googleCallback,
  logout,
  resetPassword,
};
