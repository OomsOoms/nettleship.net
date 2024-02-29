const { logEvent } = require("./logEvents");

const errorHandler = (error, req, res, next) => {
  logEvent(error.stack, "errLog.txt");
  res.status(500).send(error.message);
};

module.exports = errorHandler;
