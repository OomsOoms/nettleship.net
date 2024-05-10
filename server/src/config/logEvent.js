const path = require('path');
const fs = require('fs');
const fsPromises = require('fs').promises;

async function logEvent(message, logFile = 'requestLog.log') {
  try {
    new Promise((resolve) => {
      console.log(message);
      resolve();
    });
    if (!fs.existsSync('logs')) {
      await fsPromises.mkdir('logs');
    }

    await fsPromises.appendFile(path.join('logs', logFile), `${message}\n`);
  } catch (err) {
    console.error(err);
  }
}

module.exports = logEvent;
