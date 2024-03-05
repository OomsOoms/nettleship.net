const mongoose = require('mongoose');

module.exports = async function () {
  try {
    await mongoose.connect(process.env.DATABASE_URI, {});
    console.log(
      `Connected to MongoDB:${mongoose.connection.host}:${mongoose.connection.port} - ${mongoose.connection.name}`
    );
  } catch (error) {
    console.error(`Error connecting to the database: ${error.message}`);
  }
};
