require('dotenv').config();
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const mongoose = require('mongoose');
const corsMiddleware = require('./config/corsOptions.js');

const swaggerSpec = require('./config/swagger');
const connectDB = require('./config/db');
const { logger } = require('./api/middlewares/logger');
const { errorHandler } = require('./api/middlewares/errorHandler');

const app = express();
const PORT = process.env.PORT || 8000;

// Connect to MongoDB
//connectDB();

// middleware for logging
app.use(logger);

// credential check before cores
//app.use(credentials)

// Enable CORS for all routes
app.use(corsMiddleware);

// built-in middleware for json
app.use(express.json());

// Routes
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/users', require('./api/routes/userRoutes'));

// Error handling middleware
app.use(errorHandler);

// Error handling middleware
app.all('*', (req, res) => {
  res.status(404).json({ message: '404 Route does not exist' });
});

// Connect to server
//mongoose.connection.once('open', () => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://localhost:${PORT}/`);
  });
//});
