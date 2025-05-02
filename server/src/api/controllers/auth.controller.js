// Instead of importing the service directly, the passport configuration is imported which uses the auth service functions
const passport = require('../../config/passport');
const { authService } = require('../services');

async function getStatus(req, res) {
    if (req.isAuthenticated()) {
        return res.status(200).json({
            authenticated: true,
            user: {
                id: req.user.id,
                username: req.user.username,
                avatarUrl: req.user.avatarUrl,
                role: req.user.role,
		displayName: req.user.displayName
            },
            provider: req.session.provider,
            expiresIn: req.session.cookie.maxAge
        });
    } else {
        return res.status(401).json({ authenticated: false });
    }
}

async function localLogin(req, res) {
    return passport.authenticate('local', (err, user) => {
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        req.login(user, (err) => {
            req.session.ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            req.session.userAgent = req.headers['user-agent'];
            return res.status(200).json({ message: 'Logged in successfully via local login' });
        });
    })(req, res);
}

async function googleLogin(req, res) {
    return passport.authenticate('google', { scope: ['email', 'profile'], prompt: 'select_account'})(req, res);
}

async function googleCallback(req, res) {
  return passport.authenticate('google', (err, user) => {
    if (!user) {
      // redirect to the frontend login page with the error google
      res.redirect(`${process.env.FRONTEND_DOMAIN}/register?error=google`);
    }

    req.login(user, (err) => {
      req.session.ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      req.session.userAgent = req.headers['user-agent'];
      // Redirect to the frontend
      res.redirect(`${process.env.FRONTEND_DOMAIN}/`);
    });
  })(req, res);
}

async function logout(req, res) {
    if (!req.isAuthenticated()) {
        return res.status(400).json({ message: 'You are not logged in' });
    }
    // delete session data from store
    req.logout(function (err) {
        req.session.destroy();
        res.status(200).json({ message: 'Logged out successfully' });
    });
}

async function unlinkGoogle(req, res) {
    const result = await authService.unlinkGoogle(req.user);
    return res.status(200).json({ message: result });
}

async function requestResetPassword(req, res) {
    const email = req.body.email;
    const result = await authService.requestResetPassword(email);
    return res.status(200).json({ message: result });
}

async function resetPassword(req, res) {
    if (!req.headers.authorization) return res.status(400).json({ message: 'Token is required' });
    const token = req.headers.authorization.split(' ')[1];
    const password = req.body.password;
    await authService.resetPassword(token, password);
    return res.status(200).json({ message: 'Password reset successfully' });
}

module.exports = {
    getStatus,
    localLogin,
    googleLogin,
    googleCallback,
    logout,
    unlinkGoogle,
    requestResetPassword,
    resetPassword
};
