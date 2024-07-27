const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const DATABASE_URI = process.env.DATABASE_URI;

async function connect() {
 return new Promise(async (resolve, reject) => {
    if (process.env.NODE_ENV === 'test') {
      const mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      mongoose.connect(uri)
       .then((res, err) => {
         if (err) return reject(err);
         console.log(
           `Mocked connection to MongoDB:${mongoose.connection.host}:${mongoose.connection.port} - ${mongoose.connection.name}`
         );
         resolve();
       })
    } else {
      mongoose.connect(DATABASE_URI)
       .then((res, err) => {
         if (err) return reject(err);
         console.log(
           `Connected to MongoDB:${mongoose.connection.host}:${mongoose.connection.port} - ${mongoose.connection.name}`
         );
         resolve();
       })
    }

  });
}

function close() {
  return mongoose.disconnect();
}

module.exports = { connect, close };
