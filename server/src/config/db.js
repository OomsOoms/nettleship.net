const mongoose = require('mongoose');

const { logger } = require('../config/logger');

async function connect() {
  let uri;
  if (process.env.NODE_ENV === 'test') {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongod = await MongoMemoryServer.create();
    uri = mongod.getUri();
  } else {
    uri = process.env.DATABASE_URI;
  }
  return new Promise((resolve, reject) => {
    mongoose.connect(uri).then((res, err) => {
      if (err) return reject(err);
      logger.info(
        `Connected to MongoDB:${mongoose.connection.host}:${mongoose.connection.port} - ${mongoose.connection.name}`
      );
      resolve();
    });
  });
}

function close() {
  return mongoose.disconnect();
}

module.exports = { connect, close };
