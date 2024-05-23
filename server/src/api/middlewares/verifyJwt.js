const jwt = require('jsonwebtoken');

const { User } = require('../models');

async function verifyJwt(req, res, next) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  let token;
  if (!authHeader?.startsWith('Bearer ')) {
    if (!req.query.token) {
      return res.sendStatus(401);
    }
    token = req.query.token;
  } else {
    token = authHeader.split(' ')[1];
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const user = await User.findById(decoded.id);
    if (!user || user.passwordChangedAt > decoded.iat) {
      return res.status(401).json({ error: 'Token has expired' });
    }
    req.user = decoded;
    console.log(user);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

module.exports = verifyJwt;
