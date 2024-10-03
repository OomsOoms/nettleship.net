const passport = require('../../config/passport'); // Instead of directly importing services, we import the passport configuration which uses the services

function localLogin(req, res) {
  return passport.authenticate('local', (err, user) => {
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
      //return res.redirect('/login');
    }
    // Same code is seen in register controller
    req.login(user, (err) => {
      req.session.ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      req.session.userAgent = req.headers['user-agent'];
      return res.status(200).json({ message: 'Logged in successfully via local login' });
      //return res.redirect(`${process.env.FRONTEND_DOMAIN}/`);
    });
  })(req, res);
}

function googleLogin(req, res) {
  return passport.authenticate('google', { scope: ['email', 'profile'] })(req, res);
}

function googleCallback(req, res) {
  return passport.authenticate('google', (err, user) => {
    if (!user) {
      //return res.status(401).json({ message: 'Invalid credentials' });
      return res.redirect(`${process.env.FRONTEND_DOMAIN}/login?error=google`);
    }
    req.logIn(user, (err) => {
      req.session.ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      req.session.userAgent = req.headers['user-agent'];
      //return res.status(200).json({ message: 'Logged in successfully via google' });
      return res.redirect(`${process.env.FRONTEND_DOMAIN}/`);
    });
  })(req, res);
}

function resetPassword(req, res) {
  res.status(501).json({ message: 'Not implemented' });
}

function logout(req, res) {
  if (!req.user) {
    return res.status(400).json({ message: 'You are not logged in' });
  }
  req.logout(function (err) {
    req.session.destroy();
    res.status(200).json({ message: 'Logged out successfully' });
  });
}

function getStatus(req, res) {
  if (req.user) {
    return res.status(200).json({
      username: req.user.username,
      profile: req.user.profile,
    });
  } else {
    return res.status(401).json({ message: 'Not logged in' });
  }
}

module.exports = {
  localLogin,
  googleLogin,
  googleCallback,
  logout,
  resetPassword,
  getStatus,
};
