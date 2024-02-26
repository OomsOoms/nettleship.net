require('dotenv').config();
const express = require('express');
const morgan = require('morgan');

const connectDB = require('./config/db');
const app = express();

app.use(morgan('dev'));

// Connect to MongoDB
connectDB().then(() => {
  // for parsing application/json
  app.use(express.json());

  // routes
  app.use('/api/games', require('./api/routes/gameRoutes'));

  const PORT = process.env.PORT ||  8000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}).catch(error => {
  console.error("Failed to start server due to database connection error:", error);
});
