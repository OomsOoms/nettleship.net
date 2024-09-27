const cors = require('cors');

const corsOptions = {
  origin: process.env.FRONTEND_DOMAIN,
  credentials: true,
};

module.exports = cors(corsOptions);
