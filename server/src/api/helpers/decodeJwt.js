const jwt = require('jsonwebtoken');

module.exports = async function (req, res) {
  const token = req.query.token;
  console.log(token);
  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.user = decoded;
    console.log(decoded);
  } catch (err) {
    // make this throw errors instead of sending responses
    if (err instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: 'Token has expired' });
    } else {
      return res.status(401).json({ error: 'Invalid token' });
    }
  }
};
