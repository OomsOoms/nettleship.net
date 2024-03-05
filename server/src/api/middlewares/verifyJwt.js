const jwt = require('jsonwebtoken');

const User = require('../models/user');

module.exports = async function (req, res, next) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader?.startsWith('Bearer ')) return res.sendStatus(401);
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const user = await User.findById(decoded.id);
    if (!user || user.passwordChangedAt > decoded.iat) {
      return res.status(401).json({ error: 'Token has expired' });
    }
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
