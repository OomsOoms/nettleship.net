require('dotenv').config();
const express = require('express');
const morgan = require('morgan');

const connectDB = require('./config/db');
const app = express();

app.use(morgan('dev'));
// for parsing application/json
app.use(express.json());

// Connect to MongoDB
connectDB().then(() => {
  try {
    // routes
    app.use('/api/users', require('./api/routes/userRoutes'));
    app.use('/api/games', require('./api/routes/gameRoutes'));
  } catch (error) {
    console.error("Failed to load routes:", error);
  }

  const PORT = process.env.PORT ||  8000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}).catch(error => {
  console.error("Failed to start server due to database connection error:", error);
});
