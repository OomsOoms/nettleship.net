require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");

const connectDB = require("./config/db");
const { logger } = require("./api/middlewares/logEvents");
const errorHandler = require("./api/middlewares/errorHandler");

const app = express();
const PORT = process.env.PORT || 8000;

// Connect to MongoDB
connectDB();

// custom middleware logger
app.use(logger);

// built-in middleware for json
app.use(express.json());

// third-party middleware for logging
app.use(morgan("dev"));

// Routes
app.use("/api/users", require("./api/routes/userRoutes"));
app.use("/api/games", require("./api/routes/gameRoutes"));

// Error handling middleware
app.use(errorHandler);

// Error handling middleware
app.all("*", (req, res) => {
  res.status(404).json({ message: "404 Route does not exist" });
});

// Connect to server
mongoose.connection.once("open", () => {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on http://localhost:${PORT}/`);
  });
});
