const cors = require('cors');

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || origin === process.env.FRONTEND_DOMAIN) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200,
  exposedHeaders: ['Content-Length'],
};

module.exports = cors(corsOptions);
