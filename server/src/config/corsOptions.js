const cors = require('cors');

const corsOptions = {
  origin: ['https://localhost:3000', 'https://localhost:5500', 'https://s84dlvcl-8000.uks1.devtunnels.ms/'],
  optionSuccessStatus: 200,
};

module.exports = cors(corsOptions);
