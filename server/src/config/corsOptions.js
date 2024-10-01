const cors = require('cors');

const corsOptions = {
  origin: process.env.FRONTEND_DOMAIN,
  credentials: true,
  optionsSuccessStatus: 200,
};

module.exports = cors(corsOptions);
