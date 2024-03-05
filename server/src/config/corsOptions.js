const cors = require('cors');

const corsOptions = {
    origin: ['https://localhost:3000','https://localhost:5500'],
    optionSuccessStatus: 200,
}

module.exports = cors(corsOptions);