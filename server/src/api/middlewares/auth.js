const jwt = require('jsonwebtoken');
const User = require('../models/user'); 

module.exports = async function (req, res, next) {
  var bearerHeader = req.headers['authorization'];
  var [scheme, credentials] = bearerHeader.split(' ').length ===  2 ? bearerHeader.split(' ') : [null, null];
  if (/^Bearer$/i.test(scheme)) {
    if (credentials) {
      var token = credentials;
      try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);

        const user = await User.findById(decoded.id);
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        };

        if (user.passwordChangedAt > decoded.iat) {
          return res.status(401).json({ error: 'Token has expired' });
        };
      
        req.user = decoded;
        next();
      } catch (err) {
        res.status(401).json({ error: 'Token verification failed' });
      }
    } else {
      res.status(401).json({ error: 'No token provided' });
    }
  } else {
    res.status(401).json({ error: 'Invalid authentication scheme' });
  }
};
